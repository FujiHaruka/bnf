interface BaseTokeNode {
  type: TokenType;
  startAt: number;
  endAt: number;
}

export interface LiteralTokeNode extends BaseTokeNode {
  value: string;
}

export interface NamedTokeNode extends BaseTokeNode {
  children: TokenNode[];
}
export type TokenNode = NamedTokeNode | LiteralTokeNode;

export interface TokenNodeJson {
  readonlytype: string;
  children: TokenNodeJson[];
  startAt: number;
  endAt: number;
}

export class FatalError extends Error {}

export class UnexpectedTokenError extends Error {
  constructor(ctx: { currentChar: string; cursor: number }) {
    super(`Unexpected token ${ctx.currentChar} at position ${ctx.cursor}`);
  }
}

export class TokenType {
  constructor(readonly name: string) {}

  toJSON() {
    return this.name;
  }

  toString() {
    return this.name;
  }
}
