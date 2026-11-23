// Each file in examples/ is named after a component of openapi.yml
// ("schemas.Article.json" or "responses.SingleArticleResponse.json") and must
// match that component's schema. Every response component has an example.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const spec = parse(readFileSync(join(root, "openapi.yml"), "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema({ $id: "spec", components: spec.components });

function schemaOf(kind, name) {
  if (kind === "schemas") return { $ref: `spec#/components/schemas/${name}` };
  const pointer = `spec#/components/${kind}/${name}/content/application~1json/schema`;
  return { $ref: pointer };
}

const examples = readdirSync(join(root, "examples")).filter((f) => f.endsWith(".json"));

for (const file of examples) {
  const [kind, name] = file.replace(/\.json$/, "").split(".");
  test(`${file} matches ${kind}.${name}`, () => {
    assert.ok(spec.components[kind]?.[name], `openapi.yml has no ${kind}.${name}`);
    const validate = ajv.compile(schemaOf(kind, name));
    const body = JSON.parse(readFileSync(join(root, "examples", file), "utf8"));
    assert.ok(validate(body), ajv.errorsText(validate.errors));
  });
}

test("every JSON response has an example", () => {
  const missing = Object.entries(spec.components.responses)
    .filter(([, r]) => r.content?.["application/json"])
    .map(([name]) => `responses.${name}.json`)
    .filter((file) => !examples.includes(file));
  assert.deepEqual(missing, []);
});
