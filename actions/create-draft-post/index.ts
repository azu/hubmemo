import path from "path";
import { getUnpublishedItems } from "./lib/unpublish-items";
import { copyResources } from "./lib/copy-resources";
import { createContent } from "./lib/create-content";

async function main() {
    const owner = "azu"
    const repo = "hubmemo"
    const branch = "master"
    const postsJSONURL = `https://${owner}.github.io/${repo}/posts.json`;
    const dataRoot = path.resolve(path.join(__dirname, "../../data"));
    const publicRoot = path.resolve(path.join(__dirname, "../../docs"));
    const rawDataURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/data`
    const author = "azu"
    const category = "memo"
    const unPublishedItems = await getUnpublishedItems({
        dataRoot,
        postsJSONURL
    });
    await copyResources({
        publicRoot,
        dataRoot,
        unPublishedItems,
        rawDataURL
    });
    const content = createContent({
        author,
        category,
        unPublishedItems
    });
    console.log("content", content);
}

if (require.main) {
    main().catch(error => {
        console.error(error);
        process.exit(1);
    });
}
