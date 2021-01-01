# Watch Folder

If you push files to `watch-folder`, `watch-folder-*.yml` action process it.

## Folder Conventions

### `update-memo/*`

If you add the json file to `watch_folder/update-memo/` directory, [watch-folder-update-memo.yml](../.github/workflows/watch-folder-update-memo.yml) process it and output to `data/*`.

- `watch_folder/update-memo/*.json` → `data/{year}/README.md`

Structure:

```
<project>
└── watch_folder/
    └── update-memo/
        └── *.json
```

Example JSON `update-memo/example.json`

```json
{
  "item": {
    "title": "example",
    "url": "https://example.com/",
    "content": "description for example",
    "tags": [
      "example"
    ]
  }
}
```

Payload item type

```ts
type PayloadMemoItem = {
    // unique key
    url: string;
    title: string
    content: string;
    tags: string[];
    date: string;
    viaURL?: string;
    relatedItems?: { title: string, url: string }[]
    private: boolean;
    // relative path from this payload json
    media?: { relativeFilePath: string }[]
}
```

## UseCase

### Mobile OS integrations

`watch_folder` actions help you to integrate your mobile phone and hubmemo.

For example, [Working Copy](https://workingcopyapp.com/)(iOS app) can push files from shortcuts.app. You can push memo
from any iOS app using [Working Copy](https://workingcopyapp.com/)'s shortcut.

```
Any App → Shortcupus's workflow → Working Copy → push to `watch_folder` → `watch-folder-*.yml`
```

Related:

- [ywangd/stash: StaSh - Shell for Pythonista](https://github.com/ywangd/stash)
