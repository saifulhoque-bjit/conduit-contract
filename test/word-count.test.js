// SPEC: spec-2ec0d2
// Every Article payload -- a single article and each list or feed item --
// carries a required, read-only wordCount: an integer of 0 or more.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const spec = parse(readFileSync(join(root, "openapi.yml"), "utf8"));
const example = (file) =>
  JSON.parse(readFileSync(join(root, "examples", file), "utf8"));

const articleSchemas = {
  "schemas.Article": spec.components.schemas.Article,
  "MultipleArticlesResponse item":
    spec.components.responses.MultipleArticlesResponse.content["application/json"]
      .schema.properties.articles.items,
};

for (const [name, schema] of Object.entries(articleSchemas)) {
  test(`${name} requires a read-only wordCount of 0 or more`, () => {
    assert.ok(schema.required.includes("wordCount"), "wordCount is not required");
    assert.deepEqual(schema.properties.wordCount, {
      type: "integer",
      minimum: 0,
      readOnly: true,
    });
  });
}

test("the Article examples carry the body's word count", () => {
  assert.equal(example("schemas.Article.json").wordCount, 4);
  assert.equal(example("responses.SingleArticleResponse.json").article.wordCount, 4);
  for (const item of example("responses.MultipleArticlesResponse.json").articles) {
    assert.ok(Number.isInteger(item.wordCount) && item.wordCount >= 0);
  }
});
