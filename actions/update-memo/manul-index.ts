import { updateMemo } from "./index";
import * as path from "path";
import { ClientPayload, parseEnv } from "./env";

/**
 * Very limited inputs
 */
type ManualInputs = {
    private: string;
    url: string;
    title: string;
    content: string;
    tags: string;
}
const WATCH_FOLDER_UPDATE_MEMO_DIR = path.join(__dirname, "../../watch-folder/update-memo");
/*
    env
      Payload=ManualInputs

    Optional
      UPDATE_MARKDOWN=true
 */
if (require.main === module) {
    (async function () {
        const env = parseEnv();
        const PAYLOAD = process.env.PAYLOAD;
        if (!PAYLOAD) {
            throw new Error("require PAYLOAD env")
        }
        const inputs = JSON.parse(PAYLOAD) as ManualInputs;
        const CLIENT_PAYLOAD: ClientPayload = {
            item: {
                private: inputs.private === "true",
                title: inputs.title,
                content: inputs.content,
                url: inputs.url.trim(),
                tags: inputs.tags.split(",").map(tag => tag.trim()),
                media: [],
                relatedItems: [],
                date: new Date().toISOString()
            }
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
