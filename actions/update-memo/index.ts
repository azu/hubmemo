import { createKoreFile, createGitHubAdaptor, createFsAdaptor } from "korefile";
import { AsocialBookmark, AsocialBookmarkItem, createBookmarkFilePath } from "asocial-bookmark";
// @ts-expect-error: need @types
import escape from "markdown-escape";
import * as path from "path";
import * as fs from "fs";
import moveFile from "move-file";
import {
    ClientPayload,
    ClientPayloadMedia,
    isClientPayloadInlineMedia,
    isClientPayloadMediaFile,
    MemoItem,
    parseEnv
} from "./env";
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
    }).join("\n\n----\n\n");
};

export async function updateMemo({
                                     GITHUB_REPOSITORY,
                                     GITHUB_REF,
                                     UPDATE_MARKDOWN,
                                     CLIENT_PAYLOAD
                                 }: {
    GITHUB_REPOSITORY: string,
    GITHUB_REF: string,
    UPDATE_MARKDOWN: boolean,
    CLIENT_PAYLOAD: ClientPayload
}) {
    const payloadItem = CLIENT_PAYLOAD.item;
    const [owner, repo] = GITHUB_REPOSITORY.split("/");
    // test
    const ref = CLIENT_PAYLOAD._test_ref_ ?? GITHUB_REF.replace(/^refs\//, "");
    const branch = ref.replace(/^heads\//, "")
    console.log("Update Repository", {
        owner,
        repo,
        ref
    });
    const now = new Date();
    const filePathTemplate = "data/:year/:month";
    const projectRoot = path.join(__dirname, "../../");
    const asocialBookmark = new AsocialBookmark<MemoItem>({
        local: {
            cwd: projectRoot
        },
        dataFilePath: filePathTemplate + "/index.json"
    });
    const korefile = createKoreFile({
        adaptor: createFsAdaptor({
            cwd: projectRoot
        })
    });
    const bookmarkBasePath = createBookmarkFilePath(filePathTemplate, now);
    const githubRepoBaseURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${bookmarkBasePath}`;
    // Upload or move Images
    const createMediaList = async (mediaList: ClientPayloadMedia[] = []): Promise<MemoItem["media"]> => {
        await fs.promises.mkdir(path.join(bookmarkBasePath, "img"), {
            recursive: true
        })
        const uploadMedias = mediaList.filter(isClientPayloadInlineMedia).map(media => {
            return {
                path: path.join(bookmarkBasePath, "img", media.fileName),
                content: Buffer.from(media.content, "base64")
            }
        });
        if (uploadMedias.length > 0) {
            console.log(`Upload media`, uploadMedias);
            await korefile.writeFiles(uploadMedias)
        }
        await Promise.all(mediaList.filter(isClientPayloadMediaFile).map(media => {
            const newImageFilePath = path.resolve(path.join(bookmarkBasePath, "img", path.basename(media.filePath)));
            console.log(`Move media: ${media.filePath} → ${newImageFilePath}`);
            return moveFile(media.filePath, newImageFilePath, {
                overwrite: true
            });
        }));
        return mediaList.map(media => {
            if (isClientPayloadMediaFile(media)) {
                return {
                    url: `${githubRepoBaseURL}/img/${path.basename(media.filePath)}`
                };
            }
            if (isClientPayloadInlineMedia(media)) {
                return {
                    url: `${githubRepoBaseURL}/img/${media.fileName}`
                };
            }
            throw new Error("Unknown media type" + media);
        })
    }
    const mediaItems = await createMediaList(CLIENT_PAYLOAD.item.media);
    const isoDate = now.toISOString();
    const item = {
        ...payloadItem,
        private: payloadItem.private ?? false,
        media: mediaItems,
        date: isoDate
    }
    await asocialBookmark.updateBookmark(item);
    console.log("Update Item", item);
    if (UPDATE_MARKDOWN) {
        // Create Markdown
        const items = await asocialBookmark.getBookmarksAt(now);
        const filePath = path.join(bookmarkBasePath, "README.md");
        await korefile.writeFile(filePath, createMarkdown(items, githubRepoBaseURL));
    }
}

if (require.main === module) {
    const PAYLOAD = process.env.PAYLOAD;
    if (!PAYLOAD) {
        throw new Error("require PAYLOAD env")
    }
    const CLIENT_PAYLOAD = JSON.parse(PAYLOAD) as ClientPayload;
    const env = parseEnv();
    updateMemo({
        ...env,
        CLIENT_PAYLOAD
    }).catch(error => {
        console.error(error);
        process.exit(1);
    });
}
