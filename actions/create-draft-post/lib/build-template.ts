import fs from "fs";
import Handlebars from "handlebars";
import { MemoItem } from "./MemoItem";
Handlebars.registerHelper('auto_format_md', function (text) {
    return text.trim();
});
Handlebars.registerHelper('format_tags', function (tags) {
    return tags.map(function (tag: string) {
        return '<span class="item-tag">' + tag + '</span>';
    }).join(" ");
});
Handlebars.registerHelper('escape_md', function (text) {
    const markdown_literal = /[\\`\*_\{\}\[\]]/g;
    return text.replace(markdown_literal, "\\$&");
});
Handlebars.registerHelper('escape_attr', function (text) {
    const markdown_literal = /["\\`\*_\{\}\[\]]/g;
    return text.replace(markdown_literal, "\\$&");
});
Handlebars.registerHelper('ttp', function (text) {
    return text.replace(/https?:\/\//i, "")
        .replace(/_/g, "\\_");
});

/**
 *
 * @param {string} title
 * @param {string} author
 * @param {string} category
 * @param {Date} date
 * @param {string[]} tags
 * @param {number} weekNumber
 * @param {Object} groupsByHeader
 * @returns {string}
 */
export function createMarkdown({
                                   title,
                                   author,
                                   date,
                                   category,
                                   tags,
                                   items
                               }: {
    title: string,
    author: string,
    date: Date,
    category: string,
    tags: string[],
    items: MemoItem[]
}) {
    const source = fs.readFileSync(__dirname + "/template.handlebars", "utf-8");
    const template = Handlebars.compile(source);
    return template({
        items: items,
        layout: "post",
        title,
        author,
        date: date.toISOString(),
        category,
        tags
    });
}
