import { LiteralTokeNode, NamedTokeNode, TokenNode, TokenType, UnexpectedTokenError } from "./core.ts";

export const TokenTypes = {
  "binary-number": new TokenType("binary-number"),
  "binary-sequence": new TokenType("binary-sequence"),
  "binary-digit": new TokenType("binary-digit"),
  "$literal": new TokenType("$literal"),
} as const;

type ParserAtom = (text: string, startAt: number) => TokenNode | null;

function expect(fn: ParserAtom): (text: string, startAt: number) => TokenNode {
  return (text: string, startAt: number) => {
    const nodeOrNull = fn(text, startAt);
    if (nodeOrNull) {
      return nodeOrNull;
    } else {
      throw new UnexpectedTokenError({
        currentChar: text.charAt(startAt),
        cursor: startAt,
      });
    }
  };
}

export const Parser = {
  /**
   * `<binary-number> ::= <binary-digit> | "1" <binary-sequence>`
   */
  "binary-number"(text: string, startAt: number): NamedTokeNode | null {
    // if it starts with a specific characotr, it can match the latter case.
    if (text.charAt(startAt) === "1") {
      const literal = expect(Parser["$literal"])(text, startAt);
      const sequence = Parser["binary-sequence"](text, literal.endAt);
      if (sequence) {
        return {
          type: TokenTypes["binary-number"],
          children: [literal, sequence],
          startAt,
          endAt: sequence.endAt,
        };
      }
    }

    const digit = Parser["binary-digit"](text, startAt);
    if (digit) {
      return {
        type: TokenTypes["binary-number"],
        children: [digit],
        startAt: startAt,
        endAt: digit.endAt,
      };
    } else {
      return null;
    }
  },

  /**
   * `<binary-sequence> ::= <binary-digit> | <binary-digit> <binary-sequence>`
   */
  "binary-sequence"(text: string, startAt: number): NamedTokeNode | null {
    const children: NamedTokeNode[] = [];

    let node: NamedTokeNode | null = null;
    let endAt = startAt;
    do {
      node = Parser["binary-digit"](text, endAt);
      if (node) {
        endAt = node.endAt;
        children.push(node);
      }
    } while (node);

    if (children.length === 0) {
      return null;
    } else {
      return {
        type: TokenTypes["binary-sequence"],
        children,
        startAt,
        endAt,
      };
    }
  },

  /**
   * `<binary-digit> ::= "0" | "1"`
   */
  "binary-digit"(text: string, startAt: number): NamedTokeNode | null {
    switch (text.charAt(startAt)) {
      case "0":
      case "1": {
        const node = expect(Parser["$literal"])(text, startAt);
        return {
          type: TokenTypes["binary-digit"],
          children: [node],
          startAt,
          endAt: node.endAt,
        };
      }
      default:
        return null;
    }
  },

  "$literal"(text: string, startAt: number): LiteralTokeNode | null {
    return {
      type: TokenTypes["$literal"],
      value: text.charAt(startAt),
      startAt,
      endAt: startAt + 1,
    };
  },
};

export function parse(text: string): TokenNode {
  const node = expect(Parser["binary-number"])(text, 0);
  if (node.endAt !== text.length) {
    throw new UnexpectedTokenError({
      currentChar: text.charAt(node.endAt),
      cursor: node.endAt,
    });
  }

  return node;
}
