import { MemoItem } from "./MemoItem";
import * as path from "path";
import * as fs from "fs";

const copyResource = async (input: string, output: string) => {
    await fs.promises.mkdir(path.dirname(output), {
        recursive: true
    });
    await fs.promises.copyFile(input, output, fs.constants.COPYFILE_FICLONE);
}
export const copyResources = async ({ dataRoot, publicRoot, unPublishedItems, rawDataURL }: {
    dataRoot: string;
    publicRoot: string;
    rawDataURL: string;
    unPublishedItems: MemoItem[]
}) => {
    // copy images that related item to publish
    const promises: Promise<void>[] = []
    for (const item of unPublishedItems) {
        for (const media of item.media) {
            const absolutePath = media.url.replace(rawDataURL, dataRoot);
            const relativePath = path.relative(dataRoot, absolutePath);
            const outputMediaPath = path.join(publicRoot, "img",
                relativePath
                    .replace(/\/img\/([^\/]+)$/, "/$1")
            );
            promises.push(copyResource(absolutePath, outputMediaPath));
        }
    }
    return Promise.all(promises);
}
