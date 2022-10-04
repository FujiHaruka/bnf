import { literalTokenParser } from "./literalTokenParser.ts";
import {
  assert,
  assertEquals,
  assertIsError,
  assertThrows,
  describe,
  it,
} from "../../deps-test.ts";
import { LiteralTokenNode } from "./../token.ts";
import {
  EmptyTextError,
  PositionExceededError,
  UnexpectedTokenError,
} from "../utils/errors.ts";

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

  it("parses successfully when value with more than 1 length", () => {
    const parse = literalTokenParser("#$%");
    assert(parse("__#$%__", 2).isOk());
    assertEquals(
      parse("__#$%__", 2).unwrap(),
      new LiteralTokenNode({
        value: "#$%",
        startAt: 2,
        endAt: 5,
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
  });
});
