export class FatalError extends Error {}

export class UnexpectedTokenError extends Error {
  constructor(ctx: { ruleName: string; char: string; position: number }) {
    super(
      `${ctx.ruleName}Unexpected token "${ctx.char}" at position ${ctx.position} while parsing by rule "${ctx.ruleName}"`,
    );
  }
}
