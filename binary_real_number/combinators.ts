import {
  LiteralTokenNode,
  NamedTokenNode,
  TokenNode,
  TokenType,
} from "./token.ts";
import {
  EmptyTextError,
  FatalError,
  PositionExceededError,
  UnexpectedTokenError,
} from "./utils/errors.ts";
import { Result } from "./utils/Result.ts";

export const LiteralTokenType = new TokenType("$literal");

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
      type: LiteralTokenType,
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

export type Parser = (text: string, position: number) => Result<TokenNode>;
export type LiteralTokenParser = (
  text: string,
  position: number,
) => Result<LiteralTokenNode>;
export type NamedTokenParser = (
  text: string,
  position: number,
) => Result<NamedTokenNode>;

export function concat(
  parentTokenType: TokenType,
  parsers: Parser[],
): NamedTokenParser {
  if (parsers.length === 0) {
    new FatalError("parsers must have at least 1 parser");
  }

  const parser = (text: string, position: number): Result<NamedTokenNode> => {
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
