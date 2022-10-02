import { literalTokenParser } from "./literalTokenParser.ts";
import { assert, assertEquals, describe, it } from "../../deps-test.ts";
import { leftRecursion } from "./leftRecursion.ts";
import { LiteralTokenNode, NamedTokenNode, TokenType } from "../token.ts";

describe(leftRecursion.name, () => {
  it("works with literal token parsers", () => {
    const tokenType = new TokenType("test");
    const parse = leftRecursion(tokenType, {
      base: literalTokenParser("1"),
      tail: literalTokenParser("0"),
    });

    assert(parse("1000", 0).isOk());
    assertEquals(
      parse("1000", 0).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 4,
        children: [
          new LiteralTokenNode({
            value: "1",
            startAt: 0,
            endAt: 1,
          }),
          new LiteralTokenNode({
            value: "0",
            startAt: 1,
            endAt: 2,
          }),
          new LiteralTokenNode({
            value: "0",
            startAt: 2,
            endAt: 3,
          }),
          new LiteralTokenNode({
            value: "0",
            startAt: 3,
            endAt: 4,
          }),
        ],
      }),
    );
  });
});
