"""Jira integration for creating issues from user stories.

Supports:
- Dry-run export to JSON
- Creating issues in Jira Cloud via REST API (requires env vars)

Env vars:
- JIRA_BASE_URL (e.g. https://your-domain.atlassian.net)
- JIRA_EMAIL
- JIRA_API_TOKEN
- JIRA_PROJECT_KEY (e.g. SDLC)

Usage:
  python tools/jira_sync.py --stories requirements/05_user_stories.md --out jira_issues.json
  python tools/jira_sync.py --stories requirements/05_user_stories.md --create
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import requests


@dataclass(frozen=True)
class JiraIssue:
    project_key: str
    issue_type: str
    summary: str
    description: str
    labels: list[str]


_STORY_RE = re.compile(r"^As a\s+\*\*(.+?)\*\*,\s+I want to\s+\*\*(.+?)\*\*,\s+so that\s+\*\*(.+?)\*\*\.?\s*$")


def _iter_user_stories(md_text: str) -> Iterable[tuple[str | None, str, str]]:
    """Yield (epic, story_id, story_text) from markdown."""
    epic: str | None = None
    current_id: str | None = None

    for raw in md_text.splitlines():
        line = raw.strip()
        if line.startswith("## Epic"):
            epic = line.replace("## ", "").strip()
            continue

        # Example: ### US1.1: Set Investment Priority
        if line.startswith("### "):
            current_id = line.replace("### ", "").strip()
            continue

        if line.startswith("As a ") and current_id:
            yield epic, current_id, line


def _to_jira_description(epic: str | None, story_id: str, story_text: str) -> str:
    parts = []
    if epic:
        parts.append(f"Epic: {epic}")
    parts.append(f"Story: {story_id}")
    parts.append("")
    parts.append(story_text)
    return "\n".join(parts)


def build_issues_from_stories(project_key: str, md_text: str) -> list[JiraIssue]:
    issues: list[JiraIssue] = []

    for epic, story_id, story_text in _iter_user_stories(md_text):
        summary = f"{story_id}"
        if ":" in story_id:
            summary = story_id.split(":", 1)[0].strip() + " -" + story_id.split(":", 1)[1]

        issues.append(
            JiraIssue(
                project_key=project_key,
                issue_type="Story",
                summary=summary,
                description=_to_jira_description(epic, story_id, story_text),
                labels=["user-story", "sdlc"],
            )
        )

        # Also generate a QA task placeholder for test cases
        issues.append(
            JiraIssue(
                project_key=project_key,
                issue_type="Task",
                summary=f"QA: Test cases for {story_id.split(':', 1)[0].strip()}",
                description=(
                    _to_jira_description(epic, story_id, story_text)
                    + "\n\nAcceptance Criteria: (add Given/When/Then)\nTest Cases: (add manual + automated)"
                ),
                labels=["qa", "test-cases", "sdlc"],
            )
        )

    return issues


def _jira_auth_header(email: str, api_token: str) -> str:
    token = base64.b64encode(f"{email}:{api_token}".encode("utf-8")).decode("ascii")
    return f"Basic {token}"


def create_issues_in_jira(issues: list[JiraIssue]) -> list[dict]:
    base_url = os.environ["JIRA_BASE_URL"].rstrip("/")
    email = os.environ["JIRA_EMAIL"]
    api_token = os.environ["JIRA_API_TOKEN"]

    url = f"{base_url}/rest/api/3/issue"
    headers = {
        "Authorization": _jira_auth_header(email, api_token),
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    created: list[dict] = []
    for issue in issues:
        payload = {
            "fields": {
                "project": {"key": issue.project_key},
                "issuetype": {"name": issue.issue_type},
                "summary": issue.summary,
                "description": issue.description,
                "labels": issue.labels,
            }
        }

        resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
        if resp.status_code >= 300:
            raise RuntimeError(f"Jira issue creation failed ({resp.status_code}): {resp.text}")
        created.append(resp.json())

    return created


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stories", required=True, help="Path to user stories markdown")
    parser.add_argument("--project", default=os.environ.get("JIRA_PROJECT_KEY", ""))
    parser.add_argument("--out", default="jira_issues.json", help="Output JSON file (dry run)")
    parser.add_argument("--create", action="store_true", help="Create issues in Jira")
    args = parser.parse_args()

    project_key = (args.project or "").strip()
    if not project_key:
        raise SystemExit("Missing Jira project key. Set --project or JIRA_PROJECT_KEY.")

    md_text = Path(args.stories).read_text(encoding="utf-8")
    issues = build_issues_from_stories(project_key, md_text)

    if args.create:
        required = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"]
        missing = [k for k in required if not os.environ.get(k)]
        if missing:
            raise SystemExit(f"Missing env vars for Jira create: {', '.join(missing)}")

        created = create_issues_in_jira(issues)
        Path(args.out).write_text(json.dumps(created, indent=2), encoding="utf-8")
        print(f"Created {len(created)} issues. Wrote results to {args.out}")
        return 0

    Path(args.out).write_text(
        json.dumps([issue.__dict__ for issue in issues], indent=2), encoding="utf-8"
    )
    print(f"Prepared {len(issues)} issues. Dry-run output written to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
