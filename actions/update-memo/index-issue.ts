import { updateMemo } from "./index";
import { Issues } from "github-webhook-event-types";
import { ClientPayload, parseEnv } from "./env";

/**
 * Create an memo from GitHub Issue
 * Treat "Tag:*" label as tag
 * Memo issue should have "Type:Memo"
 * Treat Memo with "Type:Private" label as private
 */
/*
    ENV
        ISSUES: github.event.issues
        https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/webhook-events-and-payloads#issues


    Optional
      UPDATE_MARKDOWN=true
 */

const getTagFromLabel = (label: string) => {
    const tagPattern = /tag:(.*)/i;
    const match = label.match(tagPattern);
    if (!match) {
        return;
    }
    return match[1].trim();
}
/**
 * get <URL> or URL from Markdown
 * @param body
 */
const getURLInBody = (body: string) => {
    const StrictURLPattern = /<(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))>/
    const strictMatch = body.match(StrictURLPattern);
    const strictURL = strictMatch && strictMatch[1];
    if (strictURL) {
        return strictURL
    }
    const LooseURLPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    const looseMatch = body.match(LooseURLPattern);
    const looseURL = looseMatch && looseMatch[0];
    if (looseURL) {
        return looseURL;
    }
    return;
}
export const createPayloadFromIssueEvent = (issues: Issues): ClientPayload | Error => {
    const url = getURLInBody(issues.issue.body);
    if (!url) {
        return new Error("Not found <url> in issue body");
    }
    const isPrivate = issues.issue.labels.some(label => /Type:\s*Private/i.test(label.name));
    // should have one of
    const title = issues.issue.title;
    const content = issues.issue.body;
    const tags = issues.issue.labels.map(label => getTagFromLabel(label.name)).filter(label => !!label) as string[];
    const date = issues.issue.updated_at; // ISO string
    const viaURL = issues.issue.html_url;
    return {
        item: {
            private: isPrivate,
            title,
            content,
            url,
            tags,
            date: date,
            viaURL,
            media: [],
            relatedItems: [],
        }
    }
}
if (require.main === module) {
    (async function () {
        const env = parseEnv();
        const ISSUES = process.env.ISSUES;
        if (!ISSUES) {
            throw new Error("require ISSUES env")
        }
        const issuesEvent = JSON.parse(ISSUES) as Issues;
        const CLIENT_PAYLOAD = createPayloadFromIssueEvent(issuesEvent);
        if (CLIENT_PAYLOAD instanceof Error) {
            throw CLIENT_PAYLOAD
        }

        return updateMemo({
            ...env,
            CLIENT_PAYLOAD
        });
    })().catch(error => {
        console.error(error);
        process.exit(1);
    });
}
