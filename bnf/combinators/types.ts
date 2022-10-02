import type { LiteralTokenNode, NamedTokenNode, TokenNode } from "../token.ts";
import type { Result } from "../utils/Result.ts";

export type Parser = (text: string, position: number) => Result<TokenNode>;
export type LiteralTokenParser = (
  text: string,
  position: number,
) => Result<LiteralTokenNode>;
export type NamedTokenParser = (
  text: string,
  position: number,
) => Result<NamedTokenNode>;
