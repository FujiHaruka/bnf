import { LiteralTokenNode, LiteralTokenType } from "../token.ts";
import {
  EmptyTextError,
  FatalError,
  PositionExceededError,
  UnexpectedTokenError,
} from "../utils/errors.ts";
import { Result } from "../utils/Result.ts";

export function literalTokenParser(charactor: string) {
  if (charactor.length !== 1) {
    throw new FatalError("charactor length must be 1");
  }

  const parse = (text: string, position: number): Result<LiteralTokenNode> => {
    if (text.length === 0) {
      return Result.Err(new EmptyTextError());
    }

    if (text.length <= position) {
      return Result.Err(
        new PositionExceededError({
          ruleName: LiteralTokenType.name,
          position,
        }),
      );
    }

    if (text.charAt(position) !== charactor) {
      return Result.Err(
        new UnexpectedTokenError({
          ruleName: LiteralTokenType.name,
          char: text.charAt(position),
          position,
        }),
      );
    }

    const node = new LiteralTokenNode({
      value: text.charAt(position),
      startAt: position,
      endAt: position + 1,
    });
    return Result.Ok(node);
  };

  Object.defineProperty(parse, "name", {
    value: `parseLiteral("${charactor}")`,
    configurable: true,
  });

  return parse;
}
