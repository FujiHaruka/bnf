import {
  assert,
  assertObjectMatch,
  assertSnapshot,
  assertThrows,
  describe,
  it,
} from "../deps-test.ts";
import { cleanupTempTokenNodes } from "./combinators/cleanupTempTokenNodes.ts";
import { flattenRecursiveNodes } from "./combinators/flattenRecursiveNodes.ts";
import { NamedTokenParser } from "./combinators/types.ts";
import { parse, Parser } from "./parser.ts";

describe("Parsers", () => {
  const tests: [NamedTokenParser, string, Record<string, unknown>][] = [
    // <rule-char> ::= <letter> | <digit> | "-"
    [Parser["rule-char"], "-", {
      type: "rule-char",
      children: [{
        value: "-",
      }],
    }],
    [Parser["rule-char"], "A", {
      type: "rule-char",
      children: [{
        type: "letter",
        children: [{
          value: "A",
        }],
      }],
    }],
    [Parser["rule-char"], "0", {
      type: "rule-char",
      children: [{
        type: "digit",
        children: [{
          value: "0",
        }],
      }],
    }],
    // <rule-name> ::= <letter> | <rule-name> <rule-char>
    [Parser["rule-name"], "fo-ba", {
      type: "rule-name",
      startAt: 0,
      endAt: 5,
      children: [{
        type: "letter",
      }, {
        type: "rule-char",
      }, {
        type: "rule-char",
      }, {
        type: "rule-char",
      }, {
        type: "rule-char",
      }],
    }],
  ];

  tests.forEach(([parse, text, expected]) => {
    it(`${parse.name} parses ${text}`, () => {
      const result = parse(text, 0)
        .map(cleanupTempTokenNodes)
        .map(flattenRecursiveNodes);
      // if (parse.name === "rule-name") {
      //   console.log(JSON.stringify(result.unwrap(), null, 2))
      // }
      assert(result.isOk());
      assertObjectMatch(result.unwrap().toJSON(), expected);
    });
  });
});

const testsSuccess: string[] = [];
testsSuccess.forEach((text) => {
  Deno.test(`parse / success "${text}"`, (t) => {
    assertSnapshot(t, parse(text));
  });
});

const testsFailure: string[] = [];
testsFailure.forEach((text) => {
  Deno.test(`parse / failure "${text}"`, () => {
    assertThrows(() => parse(text));
  });
});
