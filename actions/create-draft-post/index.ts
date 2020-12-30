import path from "path";
import { getUnpublishedItems } from "./lib/unpublish-items";
import { copyResources } from "./lib/copy-resources";
import { createContent } from "./lib/create-content";
import * as fs from "fs";
import { MemoItem } from "./lib/MemoItem";

/**
 Env
 GITHUB_ACTOR=xxx
 GITHUB_TOKEN=xxx
 GITHUB_REF=refs/heads/main
 GITHUB_REPOSITORY=azu/hubmemo

 Optional
 # does not exludes tail /
 WEBSITE_BASE_URL=https://example.com
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
    const POSTS_JSON_URL = process.env.WEBSITE_BASE_URL
        ? `${process.env.WEBSITE_BASE_URL}/posts.json`
        : `https://${owner}.github.io/${repo}/posts.json`;

    // TODO: Configurable?
    const dataRoot = path.resolve(path.join(__dirname, "../../data"));
    const publicRoot = path.resolve(path.join(__dirname, "../../docs"));
    const rawDataURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/data`
    const imgResourceRoot = path.resolve(path.join(publicRoot, "img"));
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
    const imgResourceRelativePath = path.relative(publicRoot, imgResourceRoot);
    const rewriteMediaForPublish = (memoItem: MemoItem): MemoItem => {
        return {
            ...memoItem,
            media: memoItem.media.map(media => {
                return {
                    url: media.url.replace(rawDataURL, imgResourceRelativePath)
                };
            })
        }
    }
    const forPublishItems = unPublishedItems.map(rewriteMediaForPublish)

    const content = await createContent({
        author,
        category,
        forPublishItems: forPublishItems
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
