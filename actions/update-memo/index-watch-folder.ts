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
        // create CLIENT_PAYLOAD from watch-folder/update-memo/*.json
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
                    tags: payload.item.tags ?? [],
                    media: payload.item.media ?
                        payload.item.media.map(media => {
                            return {
                                // absolute file path
                                filePath: path.resolve(path.join(path.dirname(jsonFilePath), media.relativeFilePath))
                            }
                        })
                        : []
                }
            }
        });
        // If same Payload identifier(url), merge it
        const mergedPayloadList = payloadList.reduce((payloadList, currentPayload) => {
            const sameIdPayload = payloadList.find(p => p.item.url === currentPayload.item.url);
            if (sameIdPayload) {
                // Merge media current to existing instead of adding
                // merge tags and unique
                sameIdPayload.item.tags = Array.from(new Set(sameIdPayload.item.tags.concat(currentPayload.item.tags)));
                // merge media list
                sameIdPayload.item.media = sameIdPayload.item.media.concat(currentPayload.item.media);
            } else {
                payloadList.push(currentPayload);
            }
            return payloadList;
        }, [] as ClientPayload[]);

        for (const payload of mergedPayloadList) {
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
