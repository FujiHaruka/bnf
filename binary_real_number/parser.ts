import {
  LiteralTokenNode,
  longestNode,
  NamedTokenNode,
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
  | "binary-digit"
  | "$literal";

export const TokenTypes: Readonly<Record<RuleName, TokenType>> = {
  "binary-number": new TokenType("binary-number"),
  "binary-decimal": new TokenType("binary-decimal"),
  "binary-integer": new TokenType("binary-integer"),
  "binary-natural-number": new TokenType("binary-natural-number"),
  "binary-sequence": new TokenType("binary-sequence"),
  "binary-digit": new TokenType("binary-digit"),
  "$literal": new TokenType("$literal"),
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
    return Parser["binary-integer"](text, position)
      .andThen((integer) => {
        return Parser["$literal"](text, integer.endAt)
          .andThen((literal) => {
            const ok = [integer, literal] as const;
            if (literal.value === ".") {
              return Result.Ok(ok);
            } else {
              return Result.Err<typeof ok>(
                new UnexpectedTokenError({
                  ruleName: "binary-decimal",
                  char: literal.value,
                  position: integer.endAt,
                }),
              );
            }
          });
      })
      .andThen(([integer, literal]) => {
        return Parser["binary-sequence"](text, integer.endAt + 1)
          .map((sequence) =>
            new NamedTokenNode({
              type: TokenTypes["binary-decimal"],
              children: [integer, literal, sequence],
              startAt: position,
              endAt: sequence.endAt,
            })
          );
      });
  },

  /**
   * <binary-integer> ::= "0" | "-" <binary-natural-number> | <binary-natural-number>
   */
  "binary-integer"(text: string, position: number): Result<NamedTokenNode> {
    const char = text.charAt(position);
    switch (char) {
      case "0": {
        return Parser["$literal"](text, position)
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
        return Parser["$literal"](text, position)
          .andThen((literal) => {
            return Parser["binary-natural-number"](text, position + 1)
              .map((natural) => [literal, natural] as const);
          })
          .map(([literal, natural]) =>
            new NamedTokenNode({
              type: TokenTypes["binary-integer"],
              children: [literal, natural],
              startAt: position,
              endAt: natural.endAt,
            })
          );
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
      const result = Parser["$literal"](text, position)
        .andThen((literal) => {
          return Parser["binary-sequence"](text, position + 1).map((sequence) =>
            [literal, sequence] as const
          );
        })
        .map(([literal, sequence]) => {
          const node = new NamedTokenNode({
            type: TokenTypes["binary-number"],
            children: [literal, sequence],
            startAt: position,
            endAt: sequence.endAt,
          });
          return node;
        });

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
        return Parser["$literal"](text, position)
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

  "$literal"(text: string, position: number): Result<LiteralTokenNode> {
    if (text.length <= position) {
      return Result.Err(new Error("Position overtakes text length"));
    }

    const node = new LiteralTokenNode({
      type: TokenTypes["$literal"],
      value: text.charAt(position),
    });
    return Result.Ok(node);
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
