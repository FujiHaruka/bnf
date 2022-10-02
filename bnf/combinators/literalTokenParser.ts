import { LiteralTokenNode, LiteralTokenType } from "../token.ts";
import {
  EmptyTextError,
  FatalError,
  PositionExceededError,
  UnexpectedTokenError,
} from "../utils/errors.ts";
import { Result } from "../utils/Result.ts";

export function literalTokenParser(value: string) {
  if (value.length === 0) {
    throw new FatalError("value must not be empty");
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

    if (text.slice(position, position + value.length) !== value) {
      return Result.Err(
        new UnexpectedTokenError({
          ruleName: LiteralTokenType.name,
          // TODO: show correct char
          char: text.charAt(position),
          position,
        }),
      );
    }

    const node = new LiteralTokenNode({
      value: text.charAt(position),
      startAt: position,
      endAt: position + value.length,
    });
    return Result.Ok(node);
  };

  Object.defineProperty(parse, "name", {
    value: `parseLiteral("${value}")`,
    configurable: true,
  });

  return parse;
}
