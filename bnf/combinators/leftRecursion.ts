import { NamedTokenNode, TokenType } from "../token.ts";
import { Result } from "../utils/Result.ts";
import { NamedTokenParser, Parser } from "./types.ts";

/**
 * <x> ::= <base> | <x> <tail>
 * is equivalent to
 * <x> ::= <base> <tail>*
 */
export function leftRecursion(tokenType: TokenType, {
  base,
  tail,
}: {
  base: Parser;
  tail: Parser;
}): NamedTokenParser {
  const parse: NamedTokenParser = (text, position) => {
    const baseResult = base(text, position);
    if (baseResult.isErr()) {
      return baseResult as Result<NamedTokenNode>;
    }

    const baseNode = baseResult.unwrap();
    const children = [baseNode];

    let tailResult = tail(text, baseNode.endAt);
    while (tailResult.isOk()) {
      const tailNode = tailResult.unwrap();
      children.push(tailNode);
      tailResult = tail(text, tailNode.endAt);
    }

    return Result.Ok(
      new NamedTokenNode({
        type: tokenType,
        startAt: position,
        endAt: children.at(-1)!.endAt,
        children,
      }),
    );
  };

  return parse;
}

// Explanation
// <x> ::= <base> | <x> <tail>
// <x> ::= <base> | (<base> | <x> <tail>) <tail>
// <x> ::= <base> | <base> <tail> | <x> <tail> <tail>
// <x> ::= <base> | <base> <tail> | (<base> | <x> <tail>) <tail> <tail>
// <x> ::= <base> | <base> <tail> | <base> <tail> <tail> | <x> <tail> <tail> <tail>
