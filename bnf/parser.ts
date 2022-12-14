import { concat } from "./combinators/concat.ts";
import { cleanNode } from "./nodes/cleanNode.ts";
import { literalTokenParser } from "./combinators/literalTokenParser.ts";
import { or } from "./combinators/or.ts";
import { repeat } from "./combinators/repeat.ts";
import { NamedTokenNode, TempTokenType, TokenType } from "./token.ts";
import { UnexpectedTokenError } from "./utils/errors.ts";
import { Result } from "./utils/Result.ts";
import { literalOr } from "./combinators/literalOr.ts";

export const RuleNames = [
  "syntax",
  "rule",
  "opt-whitespace",
  "expression",
  "line-end",
  "list",
  "term",
  "literal",
  "text1",
  "text2",
  "character",
  "letter",
  "digit",
  "symbol",
  "character1",
  "character2",
  "rule-name",
  "rule-char",
] as const;

export type RuleName = typeof RuleNames[number];

export const TokenTypes = Object.fromEntries(RuleNames
  .map((ruleName) => [ruleName, new TokenType(ruleName)])) as Readonly<
    Record<RuleName, TokenType>
  >;

export const Parser = {
  /**
   * <syntax> ::= <rule> | <rule> <syntax>
   * equivalent to
   * <syntax> ::= <rule>+
   */
  "syntax"(text: string, position: number): Result<NamedTokenNode> {
    return repeat(TokenTypes["syntax"], Parser["rule"], {
      minimumRepeat: 1,
    })(text, position);
  },
  /**
   * <rule> ::= <opt-whitespace> "<" <rule-name> ">" <opt-whitespace> "::=" <opt-whitespace> <expression> <line-end>
   */
  "rule"(text: string, position: number): Result<NamedTokenNode> {
    return concat(TokenTypes["rule"], [
      Parser["opt-whitespace"],
      literalTokenParser("<"),
      Parser["rule-name"],
      literalTokenParser(">"),
      Parser["opt-whitespace"],
      literalTokenParser("::="),
      Parser["opt-whitespace"],
      Parser["expression"],
      Parser["line-end"],
    ])(text, position);
  },
  /**
   * <opt-whitespace> ::= " " <opt-whitespace> | ""
   * equivalent to
   * <opt-whitespace> ::= " "*
   */
  "opt-whitespace"(text: string, position: number): Result<NamedTokenNode> {
    return repeat(TokenTypes["opt-whitespace"], literalTokenParser(" "), {
      minimumRepeat: 0,
    })(text, position);
  },
  /**
   * <expression> ::= <list> | <list> <opt-whitespace> "|" <opt-whitespace> <expression>
   */
  "expression"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["expression"], [
      Parser["list"],
      concat(TempTokenType, [
        Parser["list"],
        Parser["opt-whitespace"],
        literalTokenParser("|"),
        Parser["opt-whitespace"],
        Parser["expression"],
      ]),
    ])(text, position);
  },
  /**
   * <line-end> ::= <opt-whitespace> <EOL> | <line-end> <line-end>
   * equivalent to
   * <line-end> ::= (<opt-whitespace> <EOL>)+
   */
  "line-end"(text: string, position: number): Result<NamedTokenNode> {
    return repeat(
      TokenTypes["line-end"],
      concat(TempTokenType, [
        Parser["opt-whitespace"],
        // TODO: EOL parser
        literalTokenParser("\n"),
      ]),
      { minimumRepeat: 1 },
    )(text, position);
  },
  /**
   * <list> ::= <term> | <term> <opt-whitespace> <list>
   */
  "list"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["list"], [
      Parser["term"],
      concat(TempTokenType, [
        Parser["term"],
        Parser["opt-whitespace"],
        Parser["list"],
      ]),
    ])(text, position);
  },
  /**
   * <term> ::= <literal> | "<" <rule-name> ">"
   */
  "term"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["term"], [
      Parser["literal"],
      concat(TempTokenType, [
        literalTokenParser("<"),
        Parser["rule-name"],
        literalTokenParser(">"),
      ]),
    ])(text, position);
  },
  /**
   * <literal> ::= '"' <text1> '"' | "'" <text2> "'"
   */
  "literal"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["literal"], [
      concat(TempTokenType, [
        literalTokenParser('"'),
        Parser["text1"],
        literalTokenParser('"'),
      ]),
      concat(TempTokenType, [
        literalTokenParser("'"),
        Parser["text2"],
        literalTokenParser("'"),
      ]),
    ])(text, position);
  },
  /**
   * <text1> ::= "" | <character1> <text1>
   * equivalent to
   * <text1> ::= <character1>*
   */
  "text1"(text: string, position: number): Result<NamedTokenNode> {
    return repeat(TokenTypes["text1"], Parser["character1"], {
      minimumRepeat: 0,
    })(text, position);
  },
  /**
   * <text2> ::= '' | <character2> <text2>
   * equivalent to
   * <text2> ::= <character2>*
   */
  "text2"(text: string, position: number): Result<NamedTokenNode> {
    return repeat(TokenTypes["text2"], Parser["character2"], {
      minimumRepeat: 0,
    })(text, position);
  },
  /**
   * <character> ::= <letter> | <digit> | <symbol>
   */
  "character"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["character"], [
      Parser["letter"],
      Parser["digit"],
      Parser["symbol"],
    ])(text, position);
  },

  /**
   * <letter> ::= "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
   */
  "letter"(text: string, position: number): Result<NamedTokenNode> {
    return literalOr(
      TokenTypes["letter"],
      [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
      ],
    )(text, position);
  },
  /**
   * <digit> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
   */
  "digit"(text: string, position: number): Result<NamedTokenNode> {
    return literalOr(
      TokenTypes["digit"],
      [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ],
    )(text, position);
  },
  /**
   * <symbol> ::=  "|" | " " | "!" | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | ":" | ";" | ">" | "=" | "<" | "?" | "@" | "[" | "\" | "]" | "^" | "_" | "`" | "{" | "}" | "~"
   */
  "symbol"(text: string, position: number): Result<NamedTokenNode> {
    return literalOr(
      TokenTypes["symbol"],
      [
        "|",
        " ",
        "!",
        "#",
        "$",
        "%",
        "&",
        "(",
        ")",
        "*",
        "+",
        ",",
        "-",
        ".",
        "/",
        ":",
        ";",
        ">",
        "=",
        "<",
        "?",
        "@",
        "[",
        "\\",
        "]",
        "^",
        "_",
        "`",
        "{",
        "}",
        "~",
      ],
    )(text, position);
  },
  /**
   * <character1> ::= <character> | "'"
   */
  "character1"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["character1"], [
      Parser["character"],
      literalTokenParser("'"),
    ])(text, position);
  },
  /**
   * <character2> ::= <character> | '"'
   */
  "character2"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["character2"], [
      Parser["character"],
      literalTokenParser('"'),
    ])(text, position);
  },
  /**
   * <rule-name> ::= <letter> | <rule-name> <rule-char>
   * equivalent to
   * <rule-name> ::= <letter> <rule-char>*
   */
  "rule-name"(text: string, position: number): Result<NamedTokenNode> {
    return concat(TokenTypes["rule-name"], [
      Parser["letter"],
      repeat(TempTokenType, Parser["rule-char"], {
        minimumRepeat: 0,
      }),
    ])(text, position);
  },
  /**
   * <rule-char> ::= <letter> | <digit> | "-"
   */
  "rule-char"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["rule-char"], [
      Parser["letter"],
      Parser["digit"],
      literalTokenParser("-"),
    ])(text, position);
  },
};

export function parse(text: string): NamedTokenNode {
  const node = Parser["syntax"](text, 0)
    .map(cleanNode)
    .unwrap();

  if (node.endAt !== text.length) {
    throw new UnexpectedTokenError({
      ruleName: "$root",
      char: text.charAt(node.endAt),
      position: node.endAt,
    });
  }

  return node;
}
