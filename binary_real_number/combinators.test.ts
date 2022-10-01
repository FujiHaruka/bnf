import { literalTokenParser } from "./combinators.ts";
import { assertEquals, describe, it } from "../deps-test.ts";
import { LiteralTokenNode, LiteralTokenType } from "./token.ts";
import {
  EmptyTextError,
  PositionExceededError,
  UnexpectedTokenError,
} from "./utils/errors.ts";
import { assertThrows } from "https://deno.land/std@0.157.0/testing/asserts.ts";

describe(literalTokenParser.name, () => {
  it("parses successfully", () => {
    const parse = literalTokenParser("#");
    assertEquals(parse("__#__", 2).isOk(), true);
    assertEquals(
      parse("__#__", 2).unwrap(),
      new LiteralTokenNode({
        type: LiteralTokenType,
        value: "#",
        startAt: 2,
        endAt: 3,
      }),
    );
  });

  it("fails to parse with unexpected token error", () => {
    const parse = literalTokenParser("#");
    assertEquals(parse("_____", 2).isErr(), true);
    assertEquals(
      parse("_____", 2).unwrapErr(),
      new UnexpectedTokenError({
        ruleName: "$literal",
        char: "_",
        position: 2,
      }),
    );
  });

  it("automatically creates parser function name", () => {
    const parse = literalTokenParser("#");
    assertEquals(parse.name, 'parseLiteral("#")');
  });

  it("returns error when tries to parse empty text", () => {
    const parse = literalTokenParser("#");
    assertEquals(parse("", 0).isErr(), true);
    assertEquals(parse("", 0).unwrapErr(), new EmptyTextError());
  });

  it("returns error when position exceeds text length", () => {
    const parse = literalTokenParser("#");
    assertEquals(parse("_", 1).isErr(), true);
    assertEquals(
      parse("_", 1).unwrapErr(),
      new PositionExceededError({ position: 1, ruleName: "$literal" }),
    );
  });

  it("throws error with invalid text length given", () => {
    assertThrows(() => literalTokenParser(""));
    assertThrows(() => literalTokenParser("##"));
  });
});
