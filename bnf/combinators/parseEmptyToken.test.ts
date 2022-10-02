import { assert, assertEquals, describe, it } from "../../deps-test.ts";
import { LiteralTokenNode } from "../token.ts";
import { parseEmptyToken } from "./parseEmptyToken.ts";

describe(parseEmptyToken.name, () => {
  it("works", () => {
    const token = parseEmptyToken("_", 0);
    assert(token.isOk());
    assertEquals(
      token.unwrap(),
      new LiteralTokenNode({
        value: "",
        startAt: 0,
        endAt: 0,
      }),
    );
  });
});
