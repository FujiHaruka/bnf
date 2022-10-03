import {
  assert,
  assertObjectMatch,
  assertSnapshot,
  describe,
  it,
  makeloc,
  posix,
} from "../deps-test.ts";
import { cleanNode } from "./nodes/cleanNode.ts";
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
    // <literal> ::= '"' <text1> '"' | "'" <text2> "'"
    [Parser["literal"], '"A"', {
      type: "literal",
      startAt: 0,
      endAt: 3,
      children: [{
        value: '"',
      }, {
        type: "text1",
      }, {
        value: '"',
      }],
    }],
    [Parser["literal"], '""', {
      type: "literal",
      startAt: 0,
      endAt: 2,
      children: [{
        value: '"',
      }, {
        value: '"',
      }],
    }],
    // <term> ::= <literal> | "<" <rule-name> ">"
    [Parser["term"], "'A'", {
      type: "term",
      startAt: 0,
      endAt: 3,
      children: [{
        type: "literal",
        children: [{
          value: "'",
        }, {
          type: "text2",
        }, {
          value: "'",
        }],
      }],
    }],
    [Parser["term"], "<ro-ba>", {
      type: "term",
      startAt: 0,
      endAt: 7,
      children: [{
        value: "<",
      }, {
        type: "rule-name",
      }, {
        value: ">",
      }],
    }],
    [Parser["term"], `"'"`, {
      type: "term",
      startAt: 0,
      endAt: 3,
      children: [{
        type: "literal",
        children: [{
          value: '"',
        }, {
          type: "text1",
        }, {
          value: '"',
        }],
      }],
    }],
    // <list> ::= <term> | <term> <opt-whitespace> <list>
    [Parser["list"], "<term> <opt-whitespace> <list>", {
      type: "list",
      startAt: 0,
      endAt: 30,
    }],
    // <line-end> ::= <opt-whitespace> <EOL> | <line-end> <line-end>
    [Parser["line-end"], " \n\n  \n", {
      type: "line-end",
      startAt: 0,
      endAt: 6,
    }],
    [Parser["line-end"], "\n", {
      type: "line-end",
      startAt: 0,
      endAt: 1,
    }],
    // <opt-whitespace> ::= " " <opt-whitespace> | ""
    [Parser["opt-whitespace"], " ", {
      type: "opt-whitespace",
      startAt: 0,
      endAt: 1,
      children: [{
        value: " ",
      }],
    }],
    // <rule> ::= <opt-whitespace> "<" <rule-name> ">" <opt-whitespace> "::=" <opt-whitespace> <expression> <line-end>
    [
      Parser["rule"],
      '<rule> ::= <opt-whitespace> "<" <rule-name> ">" <opt-whitespace> "::=" <opt-whitespace> <expression> <line-end>\n',
      {
        startAt: 0,
        endAt: 112,
      },
    ],
  ];

  tests.forEach(([parse, text, expected]) => {
    it(`${parse.name} parses \`${text.replaceAll("\n", "\\n")}\``, () => {
      const result = parse(text, 0)
        .map(cleanNode);
      if (parse.name === "opt-whitespace") {
        console.log(result.unwrap().toJSON());
      }
      assert(result.isOk());
      assertObjectMatch(result.unwrap().toJSON(), expected);
    });
  });
});

describe(parse.name, () => {
  const fixtures = [
    "binary_number.bnf",
    // "bnf.bnf",
  ];

  fixtures.forEach((fixture) => {
    Deno.test(`parse / success with ${fixture}`, async (t) => {
      const { __dirname } = makeloc(import.meta);
      const filepath = posix.join(__dirname, "__fixtures__", fixture);
      const bnf = Deno.readTextFileSync(filepath);
      await assertSnapshot(t, parse(bnf));
      // Deno.writeTextFileSync(`${fixture}.json`, JSON.stringify(parse(bnf), null, 2))
    });
  });
});
