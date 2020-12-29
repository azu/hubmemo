import path from "path";
import { getUnpublishedItems } from "./lib/unpublish-items";
import { copyResources } from "./lib/copy-resources";
import { createContent } from "./lib/create-content";
import * as fs from "fs";

/**
 Env
 GITHUB_ACTOR=xxx
 GITHUB_TOKEN=xxx
 GITHUB_REF=refs/heads/main
 GITHUB_REPOSITORY=azu/hubmemo

 Optional
 POSTS_JSON_URL
 CATEGORY=memo
 UPDATE_MARKDOWN=true
 */

type ClientPayload = {
    /**
     * For Test
     */
    _test_ref_: string
}

async function main() {
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    if (!GITHUB_REPOSITORY) {
        throw new Error("require GITHUB_REPOSITORY env")
    }
    const GITHUB_REF = process.env.GITHUB_REF;
    if (!GITHUB_REF) {
        throw new Error("require GITHUB_BRANCH env")
    }
    const PAYLOAD = process.env.PAYLOAD;
    if (!PAYLOAD) {
        throw new Error("require PAYLOAD env")
    }
    const GITHUB_ACTOR = process.env.GITHUB_ACTOR
    if (!GITHUB_ACTOR) {
        throw new Error("require GITHUB_ACTOR env")
    }
    const [owner, repo] = GITHUB_REPOSITORY.split("/");
    // test
    const clientPayload = JSON.parse(PAYLOAD) as ClientPayload;
    const ref = clientPayload._test_ref_ ?? GITHUB_REF.replace(/^refs\//, "");
    const branch = ref.replace(/^heads\//, "")
    const POSTS_JSON_URL = process.env.POSTS_JSON_URL ?? `https://${owner}.github.io/${repo}/posts.json`;
    // TODO: Configurable?
    const dataRoot = path.resolve(path.join(__dirname, "../../data"));
    const publicRoot = path.resolve(path.join(__dirname, "../../docs"));
    const rawDataURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/data`
    const author = GITHUB_ACTOR
    const category = process.env.CATEGORY ?? "memo"
    console.log("[Info]", {
        dataRoot,
        publicRoot,
        branch,
        POSTS_JSON_URL,
        author,
        category
    })
    const unPublishedItems = await getUnpublishedItems({
        dataRoot,
        postsJSONURL: POSTS_JSON_URL
    });
    await copyResources({
        publicRoot,
        dataRoot,
        unPublishedItems,
        rawDataURL
    });
    const content = await createContent({
        author,
        category,
        unPublishedItems
    });
    const postsDir = path.join(publicRoot, "_posts");
    await fs.promises.mkdir(postsDir, {
        recursive: true
    })
    await fs.promises.writeFile(path.join(postsDir, "draft.md"), content, "utf-8")
}

if (require.main) {
    main().catch(error => {
        console.error(error);
        process.exit(1);
    });
}
