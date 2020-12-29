import path from "path";
import dayjs from "dayjs";
import * as glob from "glob";
import fetch from "node-fetch";
import { MemoItem } from "./MemoItem";

const fetchPosts = async (postsJSONURL: string) => {
    try {
        return await fetch(postsJSONURL).then(res => res.json())
    } catch {
        return [];
    }
}
export const getUnpublishedItems = async ({
                                              dataRoot,
                                              postsJSONURL
                                          }: {
    dataRoot: string;
    postsJSONURL: string;
}): Promise<MemoItem[]> => {
    const res = await fetchPosts(postsJSONURL);
    const latestDate = res.length > 0 ? dayjs(res[0]?.date) : dayjs().subtract(1, "year");
    const dataFilePaths = glob.sync(dataRoot.split(path.sep).join("/") + "/**/index.json");
    const unPublishItems: MemoItem[] = [];
    for (const dataFilePath of dataFilePaths) {
        const items = require(dataFilePath) as MemoItem[];
        items.forEach(item => {
            if (!item.private && dayjs(item.date).isAfter(latestDate)) {
                unPublishItems.push(item);
            }
        })
    }
    return unPublishItems;
}
