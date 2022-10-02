import {
  assert,
  assertEquals,
  assertThrows,
  describe,
  it,
} from "../../deps-test.ts";
import { LiteralTokenNode, NamedTokenNode, TokenType } from "../token.ts";
import { UnexpectedTokenError } from "../utils/errors.ts";
import { Result } from "../utils/Result.ts";
import { literalTokenParser } from "./literalTokenParser.ts";
import { or } from "./or.ts";
import { NamedTokenParser } from "./types.ts";

describe(or.name, () => {
  it("works with literal token parsers", () => {
    const tokenType = new TokenType("test");
    const parse = or(tokenType, [
      literalTokenParser("0"),
      literalTokenParser("1"),
      literalTokenParser("2"),
    ]);

    assert(parse("0", 0).isOk());
    assert(parse("1", 0).isOk());
    assert(parse("2", 0).isOk());
    assert(parse("_", 0).isErr());

    assertEquals(
      parse("0", 0).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 1,
        children: [
          new LiteralTokenNode({
            value: "0",
            startAt: 0,
            endAt: 1,
          }),
        ],
      }),
    );
  });

  it("works with named token parsers", () => {
    const dummyTokenType = new TokenType("dummy");
    const dummyParser: NamedTokenParser = (text, position) => {
      if (text.slice(position, position + 2) === "##") {
        return Result.Ok(
          new NamedTokenNode({
            type: dummyTokenType,
            children: [],
            startAt: position,
            endAt: position + 2, // longer than literal token
          }),
        );
      } else {
        return Result.Err(
          new UnexpectedTokenError({
            ruleName: "dummy",
            char: text.charAt(position),
            position,
          }),
        );
      }
    };

    const tokenType = new TokenType("test");
    const parse = or(tokenType, [
      literalTokenParser("0"),
      dummyParser,
    ]);

    assert(parse("0", 0).isOk());
    assert(parse("##", 0).isOk());
    assert(parse("1", 0).isErr());

    assertEquals(
      parse("0", 0).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 1,
        children: [
          new LiteralTokenNode({
            value: "0",
            startAt: 0,
            endAt: 1,
          }),
        ],
      }),
    );
    assertEquals(
      parse("##", 0).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 2,
        children: [
          new NamedTokenNode({
            type: dummyTokenType,
            children: [],
            startAt: 0,
            endAt: 2,
          }),
        ],
      }),
    );
  });

  it("throws fatal error when empty array is given", () => {
    assertThrows(() => or(new TokenType("dummay"), []));
  });
});
