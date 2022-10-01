export class FatalError extends Error {}

export class UnexpectedTokenError extends Error {
  constructor(ctx: { ruleName: string; char: string; position: number }) {
    super(
      `${ctx.ruleName}Unexpected token "${ctx.char}" at position ${ctx.position} while parsing by rule "${ctx.ruleName}"`,
    );
  }
}

export class EmptyTextError extends Error {
  constructor() {
    super("Cannot parse empty text");
  }
}

export class PositionExceededError extends Error {
  constructor(ctx: { ruleName: string; position: number }) {
    super(
      `Cursor position exceeds text length. (position: ${ctx.position}, rule: ${ctx.ruleName})`,
    );
  }
}
