# Update Memo

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
        date: string;
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
    ],
    "media": [
      {
        "fileName": "img.png",
        "content": "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnElEQVR42u3RAQ0AAAgDoJvc6FrDOahAZdLhjBIiBCFCECIEIUIQIkSIEIQIQYgQhAhBiBCEIEQIQoQgRAhChCAEIUIQIgQhQhAiBCEIEYIQIQgRghAhCEGIEIQIQYgQhAhBCEKEIEQIQoQgRAhCECIEIUIQIgQhQhCCECEIEYIQIQgRghCECEGIEIQIQYgQhAgRIgQhQhAiBCHfLWUmlZ1jOmbgAAAAAElFTkSuQmCC"
      }
    ]
  }
}
```

If you want to curl form command line, please see see [test.sh](test.sh)
