import { NamedTokenNode, TokenNode, TokenType } from "../token.ts";
import { Result } from "../utils/Result.ts";
import { NamedTokenParser, Parser } from "./types.ts";

export type RepeatOptions = {
  minimumRepeat: 0 | 1;
};

export function repeat(tokenType: TokenType, baseParser: Parser, {
  minimumRepeat,
}: RepeatOptions): NamedTokenParser {
  const parse: NamedTokenParser = (text, position) => {
    const children: TokenNode[] = [];

    let result: Result<TokenNode>;
    let endAt = position;
    while (true) {
      result = baseParser(text, endAt);
      if (result.isErr()) {
        break;
      }

      const child = result.unwrap();
      children.push(child);
      endAt = child.endAt;
    }

    if (minimumRepeat === 1 && children.length === 0) {
      // result is error
      return result as Result<NamedTokenNode>;
    }

    const lastChild = children.at(-1);
    return Result.Ok(
      new NamedTokenNode({
        type: tokenType,
        startAt: position,
        endAt: lastChild ? lastChild.endAt : position,
        children,
      }),
    );
  };

  return parse;
}
