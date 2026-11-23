# conduit-contract

The API contract of the Conduit application. `conduit-api` serves it and `conduit-web` reads it.

- `openapi.yml`: the API spec, from the RealWorld project (MIT, see `LICENSE`).
- `examples/`: one example of each payload. A file is named after the component it shows:
  `schemas.Article.json` or `responses.SingleArticleResponse.json`.

A change to a payload changes `openapi.yml` and its examples in the same commit.

## Test

```sh
npm ci
npm test
```

`npm test` checks each example against its component's schema, and that every JSON response has
an example. It needs no server.
