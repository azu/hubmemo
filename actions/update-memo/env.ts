import { AsocialBookmarkItem } from "asocial-bookmark";

export type MemoItem = AsocialBookmarkItem & {
    private: boolean;
    media: { url: string }[]
}

export type ClientPayloadInlineMedia = {
    fileName: string;
    /* base64 */
    content: string
};
export type ClientPayloadMediaFile = {
    filePath: string;
};
export type ClientPayloadMedia = ClientPayloadInlineMedia | ClientPayloadMediaFile;
export const isClientPayloadInlineMedia = (media: unknown): media is ClientPayloadInlineMedia => {
    return typeof media === "object" && media !== null && "fileName" in media;
}
export const isClientPayloadMediaFile = (media: unknown): media is ClientPayloadMediaFile => {
    return typeof media === "object" && media !== null && "filePath" in media;
}
/**
 * Client Payload Object
 */
export type ClientPayload = {
    item: AsocialBookmarkItem & {
        private: boolean;
        media: ClientPayloadMedia[];
    }
    /**
     * For Test
     */
    _test_ref_?: string
}
/**
 * watch-folder/update-memo Payload
 */
export type WATCH_ClientPayload = {
    item: AsocialBookmarkItem & {
        private: boolean;
        media: { relativeFilePath:string }[];
    }
}
export const parseEnv = () => {
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    if (!GITHUB_REPOSITORY) {
        throw new Error("require GITHUB_REPOSITORY env")
    }
    const GITHUB_REF = process.env.GITHUB_REF;
    if (!GITHUB_REF) {
        throw new Error("require GITHUB_BRANCH env")
    }
    const UPDATE_MARKDOWN = Boolean(process.env.UPDATE_MARKDOWN);
    return {
        GITHUB_REPOSITORY,
        GITHUB_REF,
        UPDATE_MARKDOWN
    }
}
