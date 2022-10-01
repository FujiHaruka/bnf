import { concat, literalTokenParser, NamedTokenParser } from "./combinators.ts";
import {
  assert,
  assertEquals,
  assertIsError,
  describe,
  it,
} from "../deps-test.ts";
import { LiteralTokenNode, NamedTokenNode, TokenType } from "./token.ts";
import {
  EmptyTextError,
  PositionExceededError,
  UnexpectedTokenError,
} from "./utils/errors.ts";
import { assertThrows } from "https://deno.land/std@0.157.0/testing/asserts.ts";
import { Result } from "./utils/Result.ts";

describe(literalTokenParser.name, () => {
  it("parses successfully", () => {
    const parse = literalTokenParser("#");
    assert(parse("__#__", 2).isOk());
    assertEquals(
      parse("__#__", 2).unwrap(),
      new LiteralTokenNode({
        value: "#",
        startAt: 2,
        endAt: 3,
      }),
    );
  });

  it("fails to parse with unexpected token error", () => {
    const parse = literalTokenParser("#");
    assert(parse("_____", 2).isErr());
    assertIsError(
      parse("_____", 2).unwrapErr(),
      UnexpectedTokenError,
    );
  });

  it("automatically creates parser function name", () => {
    const parse = literalTokenParser("#");
    assertEquals(parse.name, 'parseLiteral("#")');
  });

  it("returns error when tries to parse empty text", () => {
    const parse = literalTokenParser("#");
    assert(parse("", 0).isErr());
    assertIsError(parse("", 0).unwrapErr(), EmptyTextError);
  });

  it("returns error when position exceeds text length", () => {
    const parse = literalTokenParser("#");
    assert(parse("_", 1).isErr());
    assertIsError(
      parse("_", 1).unwrapErr(),
      PositionExceededError,
    );
  });

  it("throws error with invalid text length given", () => {
    assertThrows(() => literalTokenParser(""));
    assertThrows(() => literalTokenParser("##"));
  });
});

describe(concat.name, () => {
  it("works with 1 literal parser", () => {
    const tokenType = new TokenType("test");
    const parse = concat(tokenType, [
      literalTokenParser("#"),
    ]);

    assertEquals(parse("#", 0).isOk(), true);
    assertEquals(
      parse("#", 0).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 1,
        children: [
          new LiteralTokenNode({
            value: "#",
            startAt: 0,
            endAt: 1,
          }),
        ],
      }),
    );

    assert(parse("_", 0).isErr());
    assertIsError(parse("_", 0).unwrapErr(), UnexpectedTokenError);
  });

  it("works with 3 literal parsers", () => {
    const tokenType = new TokenType("test");
    const parse = concat(tokenType, [
      literalTokenParser("0"),
      literalTokenParser("1"),
      literalTokenParser("2"),
    ]);

    assertEquals(parse("_012_", 1).isOk(), true);
    assertEquals(
      parse("_012_", 1).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 1,
        endAt: 4,
        children: [
          new LiteralTokenNode({
            value: "0",
            startAt: 1,
            endAt: 2,
          }),
          new LiteralTokenNode({
            value: "1",
            startAt: 2,
            endAt: 3,
          }),
          new LiteralTokenNode({
            value: "2",
            startAt: 3,
            endAt: 4,
          }),
        ],
      }),
    );

    assertIsError(parse("__", 1).unwrapErr(), UnexpectedTokenError);
    assertIsError(parse("_0_", 1).unwrapErr(), UnexpectedTokenError);
    assertIsError(parse("_01_", 1).unwrapErr(), UnexpectedTokenError);
    assertIsError(parse("_01", 1).unwrapErr(), PositionExceededError);
  });

  it("works with literal parsers and named parsers", () => {
    const dummyParserType = new TokenType("dummy");
    const dummyParser: NamedTokenParser = (_text, position) => {
      return Result.Ok(
        new NamedTokenNode({
          type: dummyParserType,
          children: [],
          startAt: position,
          endAt: position + 2,
        }),
      );
    };

    const tokenType = new TokenType("test");
    const parse = concat(tokenType, [
      dummyParser,
      literalTokenParser("0"),
      dummyParser,
      literalTokenParser("1"),
      dummyParser,
    ]);

    assertEquals(
      parse("__0__1__", 0).unwrap(),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 8,
        children: [
          new NamedTokenNode({
            type: dummyParserType,
            children: [],
            startAt: 0,
            endAt: 2,
          }),
          new LiteralTokenNode({
            value: "0",
            startAt: 2,
            endAt: 3,
          }),
          new NamedTokenNode({
            type: dummyParserType,
            children: [],
            startAt: 3,
            endAt: 5,
          }),
          new LiteralTokenNode({
            value: "1",
            startAt: 5,
            endAt: 6,
          }),
          new NamedTokenNode({
            type: dummyParserType,
            children: [],
            startAt: 6,
            endAt: 8,
          }),
        ],
      }),
    );
  });

  it("generates parser name", () => {
    const parse1: NamedTokenParser = () => {
      // deno-lint-ignore no-explicit-any
      return null as any;
    };
    const parse2: NamedTokenParser = () => {
      // deno-lint-ignore no-explicit-any
      return null as any;
    };

    const tokenType = new TokenType("test");
    const parse = concat(tokenType, [parse1, parse2]);
    assertEquals(parse.name, "Concat(parse1, parse2)");
  });

  it("throws fatal error when empty array is given", () => {
    assertThrows(() => concat(new TokenType("dummay"), []));
  });
});
