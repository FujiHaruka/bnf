import {
  ScanContext,
  TokenNode,
  TokenType,
  UnexpectedTokenError,
} from "./core.ts";

export const TokenTypes = {
  "binary-number": new TokenType("binary-number"),
  "binary-sequence": new TokenType("binary-sequence"),
  "binary-digit": new TokenType("binary-digit"),
  "$literal": new TokenType("$literal"),
} as const;

type ParserAtom = (ctx: ScanContext) => TokenNode | null;

function expect(ctx: ScanContext, fn: ParserAtom): TokenNode {
  const nodeOrNull = fn(ctx);
  if (nodeOrNull) {
    return nodeOrNull;
  } else {
    throw new UnexpectedTokenError(ctx);
  }
}

export const Parser = {
  /**
   * `<binary-number> ::= <binary-digit> | "1" <binary-sequence>`
   */
  "binary-number"(ctx: ScanContext): TokenNode | null {
    const startAt = ctx.cursor;

    // if it starts with a specific characotr, it can match the latter case.
    if (ctx.currentChar === "1") {
      const literalNode = new TokenNode({
        type: TokenTypes.$literal,
        children: [],
        startAt: ctx.cursor,
        endAt: ctx.cursor + 1,
      });
      ctx.nextCursor();
      const node = Parser["binary-sequence"](ctx);
      if (node) {
        return new TokenNode({
          type: TokenTypes["binary-number"],
          children: [literalNode, node],
          startAt,
          endAt: startAt + 2,
        });
      }

      // Reset cursor position
      ctx.prevCursor();
    }

    const node = Parser["binary-digit"](ctx);
    if (node) {
      ctx.nextCursor();
      return new TokenNode({
        type: TokenTypes["binary-number"],
        children: [node],
        startAt: startAt,
        endAt: startAt + 1,
      });
    } else {
      return null;
    }
  },

  /**
   * `<binary-sequence> ::= <binary-digit> | <binary-digit> <binary-sequence>`
   */
  "binary-sequence"(ctx: ScanContext): TokenNode | null {
    const startAt = ctx.cursor;
    const children: TokenNode[] = [];

    let node: TokenNode | null = null;
    do {
      node = Parser["binary-digit"](ctx);
      if (node) {
        children.push(node);
      }
    } while (node);

    if (children.length === 0) {
      return null;
    } else {
      return new TokenNode({
        type: TokenTypes["binary-sequence"],
        children,
        startAt,
        endAt: startAt + children.length,
      });
    }
  },

  /**
   * `<binary-digit> ::= "0" | "1"`
   */
  "binary-digit"(ctx: ScanContext): TokenNode | null {
    const startAt = ctx.cursor;
    switch (ctx.currentChar) {
      case "0":
      case "1": {
        ctx.nextCursor();
        return new TokenNode({
          type: TokenTypes["binary-digit"],
          children: [],
          startAt,
          endAt: startAt + 1,
        });
      }
      default:
        return null;
    }
  },
};

export function parse(text: string): TokenNode {
  const ctx = new ScanContext(text);
  const node = expect(ctx, Parser["binary-number"]);
  if (!ctx.scanFinished) {
    throw new UnexpectedTokenError(ctx);
  }

  return node;
}
