import { updateMemo } from "./index";
import * as fs from "fs";
import * as path from "path";
import { ClientPayload, parseEnv, WATCH_ClientPayload } from "./env";

const WATCH_FOLDER_UPDATE_MEMO_DIR = path.join(__dirname, "../../watch-folder/update-memo");
/*
    Env
      GITHUB_TOKEN=xxx
      GITHUB_REF=refs/heads/main
      GITHUB_REPOSITORY=azu/hubmemo

    Optional
      UPDATE_MARKDOWN=true
 */
if (require.main === module) {
    (async function () {
        const env = parseEnv();
        // normalize watch-folder/update-memo/*.json
        const dirents = await fs.promises.readdir(WATCH_FOLDER_UPDATE_MEMO_DIR, {
            withFileTypes: true
        });
        const jsonFiles = dirents.filter(dirEnt => {
            return dirEnt.isFile && dirEnt.name.endsWith(".json");
        }).map(dirent => {
            return path.join(WATCH_FOLDER_UPDATE_MEMO_DIR, dirent.name)
        });
        const payloadList: ClientPayload[] = jsonFiles.map(jsonFilePath => {
            const payload = require(jsonFilePath) as WATCH_ClientPayload;
            return {
                item: {
                    ...payload.item,
                    media: payload.item.media?.map(media => {
                        return {
                            // absolute file path
                            filePath: path.resolve(path.join(path.dirname(jsonFilePath), media.relativeFilePath))
                        }
                    })
                }
            }
        })
        for (const payload of payloadList) {
            await updateMemo({
                ...env,
                CLIENT_PAYLOAD: payload
            });
        }
        // remove all json
        for (const jsonFile of jsonFiles) {
            await fs.promises.rm(jsonFile);
        }
    })().catch(error => {
        console.error(error);
        process.exit(1);
    });
}
