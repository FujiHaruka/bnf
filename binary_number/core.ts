// export class TokenNode {
//   readonly type: TokenType;
//   readonly children: TokenNode[];
//   readonly startAt: number;
//   readonly endAt: number;

//   constructor({
//     type,
//     children,
//     startAt,
//     endAt,
//   }: {
//     type: TokenType;
//     children: TokenNode[];
//     startAt: number;
//     endAt: number;
//   }) {
//     this.type = type;
//     this.children = children;
//     this.startAt = startAt;
//     this.endAt = endAt;
//   }
// }

export interface TokenNode {
  type: TokenType;
  children: TokenNode[];
  startAt: number;
  endAt: number;
}

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
