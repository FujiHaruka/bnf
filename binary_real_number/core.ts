import { Result } from "./utils/Result.ts";

export abstract class BaseTokenNode {
  readonly type: TokenType;

  constructor({
    type,
  }: {
    type: TokenType;
  }) {
    this.type = type;
  }
}

export class LiteralTokenNode extends BaseTokenNode {
  readonly value: string;

  constructor({
    type,
    value,
  }: {
    type: TokenType;
    value: string;
  }) {
    super({ type });
    this.value = value;
  }

  toJSON(): LiteralTokenNodeJson {
    return {
      type: this.type.toJSON(),
      value: this.value,
    };
  }
}

export class NamedTokenNode extends BaseTokenNode {
  readonly startAt: number;
  readonly endAt: number;
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
    super({ type });
    this.startAt = startAt;
    this.endAt = endAt;
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
}
export interface NamedTokenNodeJson {
  type: string;
  startAt: number;
  endAt: number;
  children: TokenNodeJson[];
}
export type TokenNodeJson = LiteralTokenNodeJson | NamedTokenNodeJson;

export class FatalError extends Error {}

export class UnexpectedTokenError extends Error {
  constructor(ctx: { ruleName: string; char: string; position: number }) {
    super(
      `[${ctx.ruleName}] Unexpected token "${ctx.char}" at position ${ctx.position}`,
    );
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

export function longestNode(
  nodeResults: Result<NamedTokenNode>[],
): Result<NamedTokenNode> {
  const nodes = nodeResults
    .filter((result) => result.isOk())
    .map((result) => result.unwrap());

  const ends = nodes.map((node) => node.endAt);
  const maxEnd = Math.max(...ends);
  const longest = nodes.find((node) => node.endAt === maxEnd);
  return longest
    ? Result.Ok(longest)
    : Result.Err(new Error("No longest node"));
}
