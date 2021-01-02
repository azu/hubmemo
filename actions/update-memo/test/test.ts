import assert from "assert";
import { createPayloadFromIssueEvent } from "../index-issue";

import issues from "./fixtures/issues.json";

describe('createPayloadFromIssueEvent', function () {
    it("should return payload", () => {
        const payload = createPayloadFromIssueEvent(issues.issue);
        assert.deepStrictEqual(payload, {
                "item": {
                    "private": false,
                    "title": "Spelling error in the README file",
                    "content": "description",
                    "url": "https://example.com",
                    "tags": ["example"],
                    "date": issues.issue.updated_at,
                    "viaURL": "https://github.com/Codertocat/Hello-World/issues/1",
                    "media": [],
                    "relatedItems": []
                }
            }
        )
    })
});
