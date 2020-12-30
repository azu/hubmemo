import { rename } from "./rename"
// ${{ toJSON(github.event) }}
if (!process.env.PULL_REQUEST_EVENT) {
    throw new Error("process.env.PULL_REQUEST_EVENT is not defined");
}
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
if (!GITHUB_REPOSITORY) {
    throw new Error("require GITHUB_REPOSITORY env")
}
const [owner, repo] = GITHUB_REPOSITORY.split("/");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const PULL_REQUEST_EVENT = JSON.parse(process.env.PULL_REQUEST_EVENT!);
console.log("PULL_REQUEST_EVENT", PULL_REQUEST_EVENT);
(async () => {
    const authorAssociation = PULL_REQUEST_EVENT.pull_request.author_association;
    const canUserCommit = authorAssociation === "MEMBER" || authorAssociation === "OWNER";
    if (!canUserCommit) {
        return;
    }
    // Post PR should includes "Type:Post" label
    const pullRequestTitle = PULL_REQUEST_EVENT.pull_request.title;
    const pullRequestBody = PULL_REQUEST_EVENT.pull_request.body;
    if (PULL_REQUEST_EVENT.action === "synchronize") {
        await rename({
            head: PULL_REQUEST_EVENT.pull_request.head,
            base: PULL_REQUEST_EVENT.pull_request.base,
            owner: owner,
            repo: repo,
            GITHUB_TOKEN: GITHUB_TOKEN
        })
    } else if (PULL_REQUEST_EVENT.action === "edited" || PULL_REQUEST_EVENT.action === "opened") {
        await rename({
            head: PULL_REQUEST_EVENT.pull_request.head,
            base: PULL_REQUEST_EVENT.pull_request.base,
            owner: owner,
            repo: repo,
            forceFitToTitle: pullRequestTitle,
            headline: pullRequestBody,
            GITHUB_TOKEN: GITHUB_TOKEN
        });
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
})
