#!/usr/bin/env bash
curl -vv \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.everest-preview+json" \
    "https://api.github.com/repos/azu/hubmemo/dispatches" \
    -d '{"item":{"title":"example","url":"https://example.com","content":"description for example","tags":["example"], "media":[{ "fileName": "img.png", "content": "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnElEQVR42u3RAQ0AAAgDoJvc6FrDOahAZdLhjBIiBCFCECIEIUIQIkSIEIQIQYgQhAhBiBCEIEQIQoQgRAhChCAEIUIQIgQhQhAiBCEIEYIQIQgRghAhCEGIEIQIQYgQhAhBCEKEIEQIQoQgRAhCECIEIUIQIgQhQhCCECEIEYIQIQgRghCECEGIEIQIQYgQhAgRIgQhQhAiBCHfLWUmlZ1jOmbgAAAAAElFTkSuQmCC"}]},"_test_ref_":"heads/test"}'
