import { LiteralTokenNode } from "../token.ts";
import { Result } from "../utils/Result.ts";

export function parseEmptyToken(
  _text: string,
  position: number,
): Result<LiteralTokenNode> {
  return Result.Ok(
    new LiteralTokenNode({
      value: "",
      startAt: position,
      endAt: position,
    }),
  );
}
