// SPEC: spec-aabc69
// Every Article carries a required, read-only readingTimeMinutes of at least 1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const spec = parse(readFileSync(join(root, "openapi.yml"), "utf8"));
const example = (file) => JSON.parse(readFileSync(join(root, "examples", file), "utf8"));

test("Article requires a read-only integer readingTimeMinutes of at least 1", () => {
  const article = spec.components.schemas.Article;
  assert.ok(article.required.includes("readingTimeMinutes"));
  assert.deepEqual(article.properties.readingTimeMinutes, {
    type: "integer",
    minimum: 1,
    readOnly: true,
  });
});

test("each Article example has readingTimeMinutes", () => {
  assert.equal(example("schemas.Article.json").readingTimeMinutes, 1);
  assert.equal(example("responses.SingleArticleResponse.json").article.readingTimeMinutes, 1);
});
