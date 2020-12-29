export type MemoItem = {
        title: string;
        // unique key
        url: string;
        content: string;
        tags: string[];
        date: string;
        viaURL?: string;
        relatedItems?: { title: string, url: string }[]
    }
    & {
    private: boolean;
    media: { url: string }[]
}
