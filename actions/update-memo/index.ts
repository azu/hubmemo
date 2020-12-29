import { createKoreFile, createGitHubAdaptor } from "korefile";
import { AsocialBookmark, AsocialBookmarkItem, createBookmarkFilePath } from "asocial-bookmark";
// @ts-expect-error: need @types
import escape from "markdown-escape";

type MemoItem = AsocialBookmarkItem & {
    media: { url: string }[]
}
type ClientPayload = AsocialBookmarkItem & {
    _test_ref_: string;
    media: {
        fileName: string;
        /* base64 */
        content: string
    }[]
}
/*
    Env
      GITHUB_TOKEN=xxx
      GITHUB_REF=refs/heads/main
      GITHUB_REPOSITORY=azu/hubmemo
      PAYLOAD=client_payload json

    Optional
      UPDATE_MARKDOWN=true
 */
const createMarkdown = (items: MemoItem[], baseURL: string): string => {
    return items.map(item => {
        const media = item.media.map(media => {
            return `![](${media.url.replace(baseURL + "/", "")})`;
        }).join("\n");
        const title = item.url.startsWith("http") && item.title ? `## [${escape(item.title)}](${item.url})` : ""
        return `${title}

${item.content}        
` + (media ? "\n" + media : "")
    }).join("\n----\n");
};

async function main() {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
        throw new Error("require GH_TOKEN env");
    }
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
    const UPDATE_MARKDOWN = Boolean(process.env.UPDATE_MARKDOWN);
    const clientPayload = JSON.parse(PAYLOAD) as ClientPayload;
    const [owner, repo] = GITHUB_REPOSITORY.split("/");
    // test
    const ref = clientPayload._test_ref_ ?? GITHUB_REF.replace(/^refs\//, "");
    const branch = ref.replace(/^heads\//, "")
    console.log("Update Repository", {
        owner,
        repo,
        ref
    });
    const now = new Date();
    const filePathTemplate = "data/:year/:month";
    const asocialBookmark = new AsocialBookmark<MemoItem>({
        github: {
            owner: owner,
            repo: repo,
            ref: ref,
            token: GITHUB_TOKEN
        },
        dataFilePath: filePathTemplate + "/index.json"
    });
    const korefile = createKoreFile({
        adaptor: createGitHubAdaptor({
                owner: owner,
                repo: repo,
                ref: ref,
                token: GITHUB_TOKEN
            }
        )
    });
    const bookmarkBasePath = createBookmarkFilePath(filePathTemplate, now);
    const githubRepoBaseURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${bookmarkBasePath}`;
    // Upload Images
    const mediaList = clientPayload.media ?? [];
    const imgFiles = mediaList.map(media => {
        return {
            path: `${bookmarkBasePath}/img/${media.fileName}`,
            content: Buffer.from(media.content, "base64")
        }
    });
    const mediaItems = mediaList.map(media => {
        return {
            url: `${githubRepoBaseURL}/img/${media.fileName}`
        }
    })
    if (imgFiles.length > 0) {
        await korefile.writeFiles(imgFiles)
    }
    const isoDate = now.toISOString();
    const item = {
        ...clientPayload,
        media: mediaItems,
        date: isoDate
    }
    await asocialBookmark.updateBookmark(item);
    console.log("Update Item", item);
    if (UPDATE_MARKDOWN) {
        // Create Markdown
        const items = await asocialBookmark.getBookmarksAt(now);
        const filePath = bookmarkBasePath + "/README.md";
        await korefile.writeFile(filePath, createMarkdown(items, githubRepoBaseURL));
    }
}

if (require.main) {
    main().catch(error => {
        console.error(error);
        process.exit(1);
    });
}
