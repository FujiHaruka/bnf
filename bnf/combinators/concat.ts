import { NamedTokenNode, TokenNode, TokenType } from "../token.ts";
import { FatalError } from "../utils/errors.ts";
import { Result } from "../utils/Result.ts";
import { NamedTokenParser, Parser } from "./types.ts";

export function concat(
  parentTokenType: TokenType,
  parsers: Parser[],
): NamedTokenParser {
  if (parsers.length === 0) {
    throw new FatalError("parsers to concat must have at least 1 parser");
  }

  const parser: NamedTokenParser = (text, position) => {
    const childrenResult = parsers.reduce(
      (prev: Result<TokenNode[]>, parse: Parser): Result<TokenNode[]> => {
        return prev.andThen<TokenNode[]>((nodes) => {
          const lastNode = nodes.at(-1);
          if (lastNode) {
            return parse(text, lastNode.endAt)
              .map((node) => nodes.concat(node));
          } else {
            return parse(text, position)
              .map((node) => [node]);
          }
        });
      },
      Result.Ok([] as TokenNode[]),
    );

    return childrenResult
      .map((children) =>
        new NamedTokenNode({
          type: parentTokenType,
          startAt: position,
          endAt: children.at(-1)!.endAt,
          children,
        })
      );
  };

  Object.defineProperty(parser, "name", {
    value: `Concat(${parsers.map((p) => p.name).join(", ")})`,
    configurable: true,
  });

  return parser;
}
