import { updateMemo } from "./index";
import { Issues } from "github-webhook-event-types";
import { ClientPayload, parseEnv } from "./env";
import { Octokit } from "@octokit/rest";

/**
 * Create an memo from GitHub Issue
 * Treat "Tag:*" label as tag
 * Memo issue should have "Type:Memo"
 * Treat Memo with "Type:Private" label as private
 */
/*
    ENV
        GITHUB_TOKEN : github token
        ISSUE: github.event.issues.issue
        DISABLE_NOTIFICATION: true or false
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
const splitURL = (body: string) => {
    const StrictURLPattern = /<(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))>([\s\S]+)/
    const strictMatch = body.match(StrictURLPattern);
    if (strictMatch) {
        return {
            url: strictMatch[1],
            body: strictMatch[2]?.trim() ?? ""
        }
    }
    const LooseURLPattern = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)([\s\S]+)/
    const looseMatch = body.match(LooseURLPattern);
    if (looseMatch) {
        return {
            url: looseMatch[1],
            body: looseMatch[2]?.trim() ?? ""
        }
    }
    return;
}
export const createPayloadFromIssueEvent = (issue: Issues["issue"]): ClientPayload | Error => {
    const split = splitURL(issue.body);
    if (!split) {
        return new Error("Not found <url> in issue body");
    }
    const { url, body } = split;
    const isPrivate = issue.labels.some(label => /Type:\s*Private/i.test(label.name));
    // should have one of
    const title = issue.title;
    const content = body;
    const tags = issue.labels.map(label => getTagFromLabel(label.name)).filter(label => !!label) as string[];
    const date = issue.updated_at; // ISO string
    const viaURL = issue.html_url;
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

        const ISSUE = process.env.ISSUE;
        if (!ISSUE) {
            throw new Error("require ISSUE env")
        }
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        if (!GITHUB_TOKEN) {
            throw new Error("require GITHUB_TOKEN env")
        }
        const DISABLE_NOTIFICATION = process.env.DISABLE_NOTIFICATION === "true";
        const github = new Octokit({
            auth: GITHUB_TOKEN
        });
        const issueEvent = JSON.parse(ISSUE) as Issues["issue"];
        const CLIENT_PAYLOAD = createPayloadFromIssueEvent(issueEvent);
        if (CLIENT_PAYLOAD instanceof Error) {
            throw CLIENT_PAYLOAD
        }
        const [owner, repo] = env.GITHUB_REPOSITORY.split("/");
        try {
            const result = await updateMemo({
                ...env,
                CLIENT_PAYLOAD
            });
            if (!DISABLE_NOTIFICATION) {
                await github.issues.createComment({
                    issue_number: issueEvent.number,
                    owner: owner,
                    repo: repo,
                    body: `📝 Create new memo in ${result.memoBaseURL}`
                });
            }
        } catch (error) {
            if (!DISABLE_NOTIFICATION) {
                await github.issues.createComment({
                    issue_number: issueEvent.number,
                    owner: owner,
                    repo: repo,
                    body: `📝 Can not create new memo`
                });
            }
            throw error;
        }
    })().catch(error => {

        console.error(error);
        process.exit(1);
    });
}
