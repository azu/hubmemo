# Watch Folder

If you push files to `watch-folder`, `watch-folder-*.yml` action process it.

## Folder Conventions

### `watch_folder/update-memo/*.json`

If you add the json file to `watch_folder/update-memo/` directory, [watch-folder-update-memo.yml](../.github/workflows/watch-folder-update-memo.yml) process it and output to `data/*`.

- `watch_folder/update-memo/*.json` → `data/{year}/README.md`create-content.ts

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

With upload media example.
You need to push `watch_folder/update-memo/img.png` at same time.

```json
{
  "item": {
    "title": "example",
    "url": "https://example.com/",
    "content": "description for example",
    "tags": [
      "example"
    ],
    "media": [{
      "relativeFilePath": "./img.png"
    }]
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
    date?: string;
    viaURL?: string;
    relatedItems?: { title: string, url: string }[]
    private: boolean;
    // relative path from this payload json
    media?: { relativeFilePath: string }[]
}
```

:memo: Note to the behavior of Add multiple `watch_folder/update-memo/*.json` at once.

If you add multiple `watch_folder/update-memo/*.json` at once, HubMemo merge some property on same `url` key.
It aims to avoid limitation of iOS's shortcuts.app. The limitation is that it can not create a dynamic dictionary of array. 

So, HubMemo create a single memo from multiple `watch_folder/update-memo/*.json` on same `url` key items 

- Merge `media` between same `url` key items
- Merge `tags` between same `url` key items  
- Merge other properties between same `url` key items

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
