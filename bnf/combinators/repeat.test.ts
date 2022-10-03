import { literalTokenParser } from "./literalTokenParser.ts";
import { assert, assertEquals, describe, it } from "../../deps-test.ts";
import { LiteralTokenNode, NamedTokenNode, TokenType } from "../token.ts";
import { repeat } from "./repeat.ts";

describe(repeat.name, () => {
  it("works with literal token parsers", () => {
    const tokenType = new TokenType("test");
    const parse = repeat(tokenType, literalTokenParser("1"), {
      minimumRepeat: 0,
    });

    assert(parse("111", 0).isOk());
    assertEquals(
      parse("111", 0).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 3,
        children: [
          new LiteralTokenNode({
            value: "1",
            startAt: 0,
            endAt: 1,
          }),
          new LiteralTokenNode({
            value: "1",
            startAt: 1,
            endAt: 2,
          }),
          new LiteralTokenNode({
            value: "1",
            startAt: 2,
            endAt: 3,
          }),
        ],
      }),
    );
  });

  it("works with minimumRepeat option = 0", () => {
    const tokenType = new TokenType("test");
    const parse = repeat(tokenType, literalTokenParser("1"), {
      minimumRepeat: 0,
    });

    assert(parse("1", 0).isOk());
    assert(parse("_", 0).isOk());
  });

  it("works with minimumRepeat option = 1", () => {
    const tokenType = new TokenType("test");
    const parse = repeat(tokenType, literalTokenParser("1"), {
      minimumRepeat: 1,
    });

    assert(parse("1", 0).isOk());
    assert(parse("_", 0).isErr());
  });
});
