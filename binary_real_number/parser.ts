import {
  LiteralTokenNode,
  longestNode,
  NamedTokenNode,
  TokenNode,
  TokenType,
  UnexpectedTokenError,
} from "./core.ts";

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

type ParserAtom<T extends TokenNode = TokenNode> = (
  text: string,
  position: number,
) => T | null;

function expect<T extends TokenNode>(
  fn: ParserAtom<T>,
): (text: string, startAt: number) => T {
  const fnOrThrow = (text: string, position: number) => {
    const nodeOrNull = fn(text, position);
    if (nodeOrNull) {
      return nodeOrNull;
    } else {
      throw new UnexpectedTokenError({
        char: text.charAt(position),
        position: position,
      });
    }
  };
  Object.defineProperty(fnOrThrow, "name", {
    value: `expect(${fn.name})`,
    configurable: true,
  });
  return fnOrThrow;
}

export const Parser = {
  /**
   * <binary-number> ::= <binary-integer> | <binary-decimal>
   */
  "binary-number"(text: string, position: number): NamedTokenNode | null {
    const candidates = [
      Parser["binary-integer"](text, position),
      Parser["binary-decimal"](text, position),
    ].filter((node: NamedTokenNode | null): node is NamedTokenNode =>
      Boolean(node)
    );
    const node = longestNode(candidates);
    if (node) {
      return new NamedTokenNode({
        type: TokenTypes["binary-number"],
        children: [node],
        startAt: position,
        endAt: node.endAt,
      });
    } else {
      return null;
    }
  },

  /**
   * <binary-decimal> ::= <binary-integer> "." <binary-sequence>
   */
  "binary-decimal"(text: string, position: number): NamedTokenNode | null {
    const integer = Parser["binary-integer"](text, position) ??
      Parser["binary-sequence"](text, position);
    if (integer) {
      const literal = expect(Parser["$literal"])(text, integer.endAt);
      if (literal.value !== ".") {
        throw new UnexpectedTokenError({
          char: literal.value,
          position: integer.endAt,
        });
      }

      const sequence = expect(Parser["binary-sequence"])(
        text,
        integer.endAt + 1,
      );
      return new NamedTokenNode({
        type: TokenTypes["binary-decimal"],
        children: [integer, literal, sequence],
        startAt: position,
        endAt: sequence.endAt,
      });
    } else {
      return null;
    }
  },

  /**
   * <binary-integer> ::= "0" | "-" <binary-natural-number> | <binary-natural-number>
   */
  "binary-integer"(text: string, position: number): NamedTokenNode | null {
    const char = text.charAt(position);
    switch (char) {
      case "0": {
        const literal = new LiteralTokenNode({
          type: TokenTypes["$literal"],
          value: char,
        });
        return new NamedTokenNode({
          type: TokenTypes["binary-integer"],
          children: [literal],
          startAt: position,
          endAt: position + 1,
        });
      }
      case "-": {
        const literal = new LiteralTokenNode({
          type: TokenTypes["$literal"],
          value: char,
        });
        const node = expect(Parser["binary-natural-number"])(
          text,
          position + 1,
        );
        return new NamedTokenNode({
          type: TokenTypes["binary-integer"],
          children: [literal],
          startAt: position,
          endAt: node.endAt,
        });
      }
      default: {
        const node = Parser["binary-natural-number"](text, position);
        if (node) {
          return new NamedTokenNode({
            type: TokenTypes["binary-integer"],
            children: [node],
            startAt: position,
            endAt: node.endAt,
          });
        } else {
          return null;
        }
      }
    }
  },

  /**
   * `<binary-natural-number> ::= <binary-digit> | "1" <binary-sequence>`
   */
  "binary-natural-number"(
    text: string,
    position: number,
  ): NamedTokenNode | null {
    // if it starts with a specific characotr, it can match the latter case.
    if (text.charAt(position) === "1") {
      const literal = expect(Parser["$literal"])(text, position);
      const sequence = Parser["binary-sequence"](text, position + 1);
      if (sequence) {
        return new NamedTokenNode({
          type: TokenTypes["binary-number"],
          children: [literal, sequence],
          startAt: position,
          endAt: sequence.endAt,
        });
      }
    }

    const digit = Parser["binary-digit"](text, position);
    if (digit) {
      return new NamedTokenNode({
        type: TokenTypes["binary-number"],
        children: [digit],
        startAt: position,
        endAt: digit.endAt,
      });
    } else {
      return null;
    }
  },

  /**
   * `<binary-sequence> ::= <binary-digit> | <binary-digit> <binary-sequence>`
   */
  "binary-sequence"(text: string, position: number): NamedTokenNode | null {
    const children: NamedTokenNode[] = [];

    let node: NamedTokenNode | null = null;
    let endAt = position;
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
      return new NamedTokenNode({
        type: TokenTypes["binary-sequence"],
        children,
        startAt: position,
        endAt,
      });
    }
  },

  /**
   * `<binary-digit> ::= "0" | "1"`
   */
  "binary-digit"(text: string, position: number): NamedTokenNode | null {
    switch (text.charAt(position)) {
      case "0":
      case "1": {
        const node = expect(Parser["$literal"])(text, position);
        return new NamedTokenNode({
          type: TokenTypes["binary-digit"],
          children: [node],
          startAt: position,
          endAt: position + 1,
        });
      }
      default:
        return null;
    }
  },

  "$literal"(text: string, position: number): LiteralTokenNode | null {
    return new LiteralTokenNode({
      type: TokenTypes["$literal"],
      value: text.charAt(position),
    });
  },
};

export function parse(text: string): NamedTokenNode {
  const node = expect(Parser["binary-number"])(text, 0);
  if (node.endAt !== text.length) {
    throw new UnexpectedTokenError({
      char: text.charAt(node.endAt),
      position: node.endAt,
    });
  }

  return node;
}
