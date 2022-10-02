import { NamedTokenNode, TokenType } from "../token.ts";
import { FatalError } from "../utils/errors.ts";
import { Result } from "../utils/Result.ts";
import { NamedTokenParser, Parser } from "./types.ts";

export function or(
  parentTokenType: TokenType,
  parsers: Parser[],
) {
  // Left recursion is not supported for now

  if (parsers.length === 0) {
    throw new FatalError("parsers to combine must have at least 1 parser");
  }

  const parser: NamedTokenParser = (text, position) => {
    const results = parsers.map((parse) => parse(text, position));
    // Ensure at least one result is successful
    if (results.every((result) => result.isErr())) {
      // First matched error
      return results[0] as Result<NamedTokenNode>;
    }

    const nodes = results.filter((result) => result.isOk()).map((result) =>
      result.unwrap()
    );

    // Find the longest matched node
    const ends = nodes.map((node) => node.endAt);
    const maxEnd = Math.max(...ends);
    const longest = nodes.find((node) => node.endAt === maxEnd)!;
    return Result.Ok(
      new NamedTokenNode({
        type: parentTokenType,
        startAt: position,
        endAt: longest.endAt,
        children: [longest],
      }),
    );
  };

  Object.defineProperty(parser, "name", {
    value: `Or(${parsers.map((p) => p.name).join(", ")})`,
    configurable: true,
  });

  return parser;
}
