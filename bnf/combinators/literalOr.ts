import { LiteralTokenNode, NamedTokenNode, TokenType } from "../token.ts";
import { FatalError, UnexpectedTokenError } from "../utils/errors.ts";
import { Result } from "../utils/Result.ts";
import { NamedTokenParser } from "./types.ts";

export function literalOr(tokenType: TokenType, literals: string[]) {
  const literalLen = literals[0].length;
  const literalSet = new Set(literals);

  if (literals.some((literal) => literal.length !== literalLen)) {
    throw new FatalError("All literals must have same length");
  }

  const parser: NamedTokenParser = (text, position) => {
    const startAt = position;
    const endAt = position + literalLen;
    const slice = text.slice(startAt, endAt);
    if (literalSet.has(slice)) {
      const literalNode = new LiteralTokenNode({
        value: slice,
        startAt,
        endAt,
      });
      return Result.Ok(
        new NamedTokenNode({
          type: tokenType,
          startAt,
          endAt,
          children: [literalNode],
        }),
      );
    } else {
      return Result.Err(
        new UnexpectedTokenError({
          ruleName: tokenType.name,
          char: text.charAt(position),
          position,
        }),
      );
    }
  };

  Object.defineProperty(parser, "name", {
    value: `LiteralOr(${literals.join("|")})`,
    configurable: true,
  });

  return parser;
}
