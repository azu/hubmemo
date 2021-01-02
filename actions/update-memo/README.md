# Update Memo

- index.ts: From dispatch-update-memo.yml
- index-issue: From issue-update-memo.yml
- index-manual.ts: From manual-update-memo.yml
- index-watch-folder.ts: From watch-folder-update-memo.yml

## Payload

Payload format

```ts
type ClientPayload = {
    item: {
        private: boolean,
        title: string;
        // unique key
        url: string;
        content: string;
        tags: string[];
        date?: string;
        viaURL?: string;
        relatedItems?: { title: string, url: string }[]
    }
    /**
     * For Test
     */
    _test_ref_: string
}
```

Example:

```json
{
  "item": {
    "title": "example",
    "url": "https://example.com",
    "content": "description for example",
    "tags": [
      "example"
    ]
  }
}
```

If you want to curl form command line, please see [test.sh](test.sh)

## Notes

:warning: there is a limitation on the total data size of the client-payload.
A very large payload may result in a `client_payload is too large` error.
