import { createMarkdown } from "./build-template";
import dayjs from "dayjs";
import { MemoItem } from "./MemoItem";

export async function createContent({
                                        author,
                                        category,
                                        unPublishedItems
                                    }: {
    author: string;
    category: string; unPublishedItems: MemoItem[]
}) {
    // Top 5 tags
    const allTags: string[] = [];
    unPublishedItems.forEach(item => item.tags.forEach(tag => allTags.push(tag)));
    const countMap = new Map();
    allTags.forEach(tag => countMap.set(tag, (countMap.get(tag) || 0) + 1));
    const sortedTagTuple = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);
    const excludedTags = ["JavaScript", "article", "news", "ReleaseNote", "library"].map(a => a.toLowerCase())
    const tagsTop5 = sortedTagTuple.filter(tagTuple => {
        return !excludedTags.includes(tagTuple[0].toLowerCase())
    })
        .slice(0, 5)
        .map(tuple => tuple[0]);
    const today = dayjs();
    const todayFormat = today.format("YYYY-MM-DD");
    return createMarkdown({
        title: `${todayFormat}: `,
        author: author,
        category: category,
        date: today.toDate(),
        tags: tagsTop5,
        items: unPublishedItems
    });
}
