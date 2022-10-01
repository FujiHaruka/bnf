import { concat, createLiteralTokenParser } from "./combinators.ts";
import {
  longestNode,
  NamedTokenNode,
  parseLiteral,
  TokenNode,
  TokenType,
} from "./token.ts";
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
    const candidates = [
      Parser["binary-integer"](text, position),
      Parser["binary-decimal"](text, position),
    ];
    return longestNode(candidates)
      .map((node) =>
        new NamedTokenNode({
          type: TokenTypes["binary-number"],
          children: [node],
          startAt: position,
          endAt: node.endAt,
        })
      );
  },

  /**
   * <binary-decimal> ::= <binary-integer> "." <binary-sequence>
   */
  "binary-decimal"(text: string, position: number): Result<NamedTokenNode> {
    const parse = concat(
      TokenTypes["binary-decimal"],
      [
        Parser["binary-integer"],
        createLiteralTokenParser("."),
        Parser["binary-sequence"],
      ],
    );
    return parse(text, position);
  },

  /**
   * <binary-integer> ::= "0" | "-" <binary-natural-number> | <binary-natural-number>
   */
  "binary-integer"(text: string, position: number): Result<NamedTokenNode> {
    const char = text.charAt(position);
    switch (char) {
      case "0": {
        return parseLiteral(text, position)
          .map((literal) =>
            new NamedTokenNode({
              type: TokenTypes["binary-integer"],
              children: [literal],
              startAt: position,
              endAt: position + 1,
            })
          );
      }
      case "-": {
        return concat(
          TokenTypes["binary-integer"],
          [
            createLiteralTokenParser("-"),
            Parser["binary-natural-number"],
          ],
        )(text, position);
      }
      default: {
        return Parser["binary-natural-number"](text, position)
          .map((natural) =>
            new NamedTokenNode({
              type: TokenTypes["binary-integer"],
              children: [natural],
              startAt: position,
              endAt: natural.endAt,
            })
          );
      }
    }
  },

  /**
   * `<binary-natural-number> ::= <binary-digit> | "1" <binary-sequence>`
   */
  "binary-natural-number"(
    text: string,
    position: number,
  ): Result<NamedTokenNode> {
    // if it starts with a specific charactor, it can match the latter case.
    if (text.charAt(position) === "1") {
      const result = concat(
        TokenTypes["binary-natural-number"],
        [
          createLiteralTokenParser("1"),
          Parser["binary-sequence"],
        ],
      )(text, position);

      if (result.isOk()) {
        return result;
      }
    }

    return Parser["binary-digit"](text, position)
      .map((digit) =>
        new NamedTokenNode({
          type: TokenTypes["binary-number"],
          children: [digit],
          startAt: position,
          endAt: digit.endAt,
        })
      );
  },

  /**
   * `<binary-sequence> ::= <binary-digit> | <binary-digit> <binary-sequence>`
   */
  "binary-sequence"(text: string, position: number): Result<NamedTokenNode> {
    const children: NamedTokenNode[] = [];

    let node: Result<NamedTokenNode>;
    let endAt = position;
    do {
      node = Parser["binary-digit"](text, endAt);
      if (node.isOk()) {
        const unwrapped = node.unwrap();
        endAt = unwrapped.endAt;
        children.push(unwrapped);
      }
    } while (node.isOk());

    if (children.length === 0) {
      return Result.Err(
        new UnexpectedTokenError({
          ruleName: "binary-sequence",
          char: text.charAt(position),
          position,
        }),
      );
    } else {
      const node = new NamedTokenNode({
        type: TokenTypes["binary-sequence"],
        children,
        startAt: position,
        endAt,
      });
      return Result.Ok(node);
    }
  },

  /**
   * `<binary-digit> ::= "0" | "1"`
   */
  "binary-digit"(text: string, position: number): Result<NamedTokenNode> {
    switch (text.charAt(position)) {
      case "0":
      case "1": {
        return parseLiteral(text, position)
          .map((node) =>
            new NamedTokenNode({
              type: TokenTypes["binary-digit"],
              children: [node],
              startAt: position,
              endAt: position + 1,
            })
          );
      }
      default:
        return Result.Err(
          new UnexpectedTokenError({
            ruleName: "binary-digit",
            char: text.charAt(position),
            position,
          }),
        );
    }
  },
};

type ParserAtom<T extends TokenNode = TokenNode> = (
  text: string,
  position: number,
) => Result<T>;

// type validation
// deno-lint-ignore no-unused-vars
const validation: Record<RuleName, ParserAtom> = Parser;

export function parse(text: string): NamedTokenNode {
  const node = Parser["binary-number"](text, 0).unwrap();
  if (node.endAt !== text.length) {
    throw new UnexpectedTokenError({
      ruleName: "$root",
      char: text.charAt(node.endAt),
      position: node.endAt,
    });
  }

  return node;
}
