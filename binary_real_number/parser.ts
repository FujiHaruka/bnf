import { cleanupTempTokenNodes } from "./combinators/cleanupTempTokenNodes.ts";
import { concat } from "./combinators/concat.ts";
import { flattenRecursiveNodes } from "./combinators/flattenRecursiveNodes.ts";
import { literalTokenParser } from "./combinators/literalTokenParser.ts";
import { or } from "./combinators/or.ts";
import { NamedTokenNode, TempTokenType, TokenType } from "./token.ts";
import { UnexpectedTokenError } from "./utils/errors.ts";
import { Result } from "./utils/Result.ts";

export type RuleName =
  | "binary-number"
  | "binary-decimal"
  | "binary-integer"
  | "binary-natural-number"
  | "binary-sequence"
  | "binary-digit";

export const TokenTypes: Readonly<Record<RuleName, TokenType>> = {
  "binary-number": new TokenType("binary-number"),
  "binary-decimal": new TokenType("binary-decimal"),
  "binary-integer": new TokenType("binary-integer"),
  "binary-natural-number": new TokenType("binary-natural-number"),
  "binary-sequence": new TokenType("binary-sequence"),
  "binary-digit": new TokenType("binary-digit"),
};

export const Parser = {
  /**
   * <binary-number> ::= <binary-integer> | <binary-decimal>
   */
  "binary-number"(text: string, position: number): Result<NamedTokenNode> {
    return or(
      TokenTypes["binary-number"],
      [
        Parser["binary-integer"],
        Parser["binary-decimal"],
      ],
    )(text, position);
  },

  /**
   * <binary-decimal> ::= <binary-integer> "." <binary-sequence>
   */
  "binary-decimal"(text: string, position: number): Result<NamedTokenNode> {
    const parse = concat(
      TokenTypes["binary-decimal"],
      [
        Parser["binary-integer"],
        literalTokenParser("."),
        Parser["binary-sequence"],
      ],
    );
    return parse(text, position);
  },

  /**
   * <binary-integer> ::= "0" | "-" <binary-natural-number> | <binary-natural-number>
   */
  "binary-integer"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["binary-integer"], [
      literalTokenParser("0"),
      concat(TempTokenType, [
        literalTokenParser("-"),
        Parser["binary-natural-number"],
      ]),
      Parser["binary-natural-number"],
    ])(text, position);
  },

  /**
   * `<binary-natural-number> ::= <binary-digit> | "1" <binary-sequence>`
   */
  "binary-natural-number"(
    text: string,
    position: number,
  ): Result<NamedTokenNode> {
    return or(TokenTypes["binary-natural-number"], [
      Parser["binary-digit"],
      concat(
        TempTokenType,
        [
          literalTokenParser("1"),
          Parser["binary-sequence"],
        ],
      ),
    ])(text, position);
  },

  /**
   * `<binary-sequence> ::= <binary-digit> | <binary-digit> <binary-sequence>`
   */
  "binary-sequence"(text: string, position: number): Result<NamedTokenNode> {
    return or(TokenTypes["binary-sequence"], [
      Parser["binary-digit"],
      concat(TempTokenType, [
        Parser["binary-digit"],
        Parser["binary-sequence"],
      ]),
    ])(text, position);
  },

  /**
   * `<binary-digit> ::= "0" | "1"`
   */
  "binary-digit"(text: string, position: number): Result<NamedTokenNode> {
    return or(
      TokenTypes["binary-digit"],
      [
        literalTokenParser("0"),
        literalTokenParser("1"),
      ],
    )(text, position);
  },
};

export function parse(text: string): NamedTokenNode {
  const node = Parser["binary-number"](text, 0)
    .map<NamedTokenNode>(cleanupTempTokenNodes)
    .map<NamedTokenNode>(flattenRecursiveNodes)
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
