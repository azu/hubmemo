# Usage

This guide describes about "Memo" and "Post".

- Memo: It is a collection of snippet data
- Post: It is an article for publishing

Hubmemo use GitHub Actions for updating flow.

## Requirements

You need to get your GitHub Personal Access Token.

- Visit <https://github.com/settings/tokens/new>
- Create a token with `repo` permission
- Copy it!

## Update Memo

[.github/workflows/dispatch-update-memo.yml](../.github/workflows/dispatch-update-memo.yml) Action create/update a memo.

You can call this action via GitHub API.

```shell
#!/usr/bin/env bash
# Need to change!
YOUR_REPO="azu/hubmemo"
# Your GitHub Personal Token
GITHUB_TOKEN="xxxxx"
curl -vv \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.everest-preview+json" \
    "https://api.github.com/repos/${YOUR_REPO}/dispatches" \
    -d '{"event_type": "update-memo", "client_payload": {"item":{"title":"example","url":"https://example.com","content":"description for example","tags":["example"], "media":[{ "fileName": "img.png", "content": "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnElEQVR42u3RAQ0AAAgDoJvc6FrDOahAZdLhjBIiBCFCECIEIUIQIkSIEIQIQYgQhAhBiBCEIEQIQoQgRAhChCAEIUIQIgQhQhAiBCEIEYIQIQgRghAhCEGIEIQIQYgQhAhBCEKEIEQIQoQgRAhCECIEIUIQIgQhQhCCECEIEYIQIQgRghCECEGIEIQIQYgQhAgRIgQhQhAiBCHfLWUmlZ1jOmbgAAAAAElFTkSuQmCC"}]}}}'
```

You can also use GUI.

- [ ] GUI

## Publish Post

[.github/workflows/dispatch-update-memo.yml](../.github/workflows/dispatch-update-memo.yml)  also create Draft Pull Request!

1. See your Pull Requests tabs
2. Edit the Pull Request
3. Merge it!
4. Automatically publish this content to [your setup provider](./SETUP.md)

Hubmemo help you to edit Draft PR via [`.github/workflows/update-draft-post.yml`](../.github/workflows/update-draft-post.yml).

- if PR title starts `YYYY-MM-DD: ~`, change the `draft.md` to `YYYY-MM-DD-<slug>.md`
- if the content's `title: ~` starts with `YYYY-MM-DD: ~`, change the `draft.md` to `YYYY-MM-DD-<slug>.md`
- if PR body is changed, add the PR's body as headline into the content
