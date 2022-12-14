export abstract class BaseTokenNode {
  readonly type: TokenType;
  readonly startAt: number;
  readonly endAt: number;

  constructor({
    type,
    startAt,
    endAt,
  }: {
    type: TokenType;
    startAt: number;
    endAt: number;
  }) {
    this.type = type;
    this.startAt = startAt;
    this.endAt = endAt;
  }
}

export class LiteralTokenNode extends BaseTokenNode {
  readonly value: string;

  constructor({
    value,
    startAt,
    endAt,
  }: {
    value: string;
    startAt: number;
    endAt: number;
  }) {
    super({ type: LiteralTokenType, startAt, endAt });
    this.value = value;
  }

  toJSON(): LiteralTokenNodeJson {
    return {
      type: this.type.toJSON(),
      value: this.value,
      startAt: this.startAt,
      endAt: this.endAt,
    };
  }
}

export class NamedTokenNode extends BaseTokenNode {
  readonly children: TokenNode[];

  constructor({
    type,
    startAt,
    endAt,
    children,
  }: {
    type: TokenType;
    startAt: number;
    endAt: number;
    children: TokenNode[];
  }) {
    super({ type, startAt, endAt });
    this.children = children;
  }

  toJSON(): NamedTokenNodeJson {
    return {
      type: this.type.toJSON(),
      children: this.children.map((child) => child.toJSON()),
      startAt: this.startAt,
      endAt: this.endAt,
    };
  }
}

export type TokenNode = NamedTokenNode | LiteralTokenNode;

export interface LiteralTokenNodeJson {
  type: string;
  value: string;
  startAt: number;
  endAt: number;
}
export interface NamedTokenNodeJson {
  type: string;
  startAt: number;
  endAt: number;
  children: TokenNodeJson[];
}
export type TokenNodeJson = LiteralTokenNodeJson | NamedTokenNodeJson;

export class TokenType {
  constructor(readonly name: string) {}

  toJSON() {
    return this.name;
  }

  toString() {
    return this.name;
  }
}

export const TempTokenType = new TokenType("$temp");
export const LiteralTokenType = new TokenType("$literal");

export const isLiteralTokenNode = (node: TokenNode): node is LiteralTokenNode =>
  node.type === LiteralTokenType;
export const isNamedTokenNode = (node: TokenNode): node is NamedTokenNode =>
  node.type !== LiteralTokenType;
