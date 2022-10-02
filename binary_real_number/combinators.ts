import {
  isLiteralTokenNode,
  LiteralTokenNode,
  LiteralTokenType,
  NamedTokenNode,
  TempTokenType,
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

export function or(
  parentTokenType: TokenType,
  parsers: Parser[],
) {
  // Recursive parsers are not supported for now

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

export function cleanupTempTokenNodes(node: LiteralTokenNode): LiteralTokenNode;
export function cleanupTempTokenNodes(node: NamedTokenNode): NamedTokenNode;
export function cleanupTempTokenNodes(node: TokenNode): TokenNode;
export function cleanupTempTokenNodes(node: TokenNode): TokenNode {
  if (isLiteralTokenNode(node)) {
    return node;
  }

  if (node.children.length === 0) {
    return node;
  }

  while (true) {
    const hasTempChild = Boolean(
      node.children.find((child) => child.type === TempTokenType),
    );

    if (hasTempChild) {
      if (node.children.length !== 1) {
        throw new FatalError("temp node must be a only child");
      }

      const tempNode = node.children[0] as NamedTokenNode;
      node = new NamedTokenNode({
        ...node,
        children: tempNode.children,
      });
    } else {
      break;
    }
  }

  node = new NamedTokenNode({
    ...node,
    children: node.children.map(cleanupTempTokenNodes),
  });

  return node;
}

export function flattenRecursiveNodes(node: LiteralTokenNode): LiteralTokenNode;
export function flattenRecursiveNodes(node: NamedTokenNode): NamedTokenNode;
export function flattenRecursiveNodes(node: TokenNode): TokenNode;
export function flattenRecursiveNodes(node: TokenNode): TokenNode {
  if (isLiteralTokenNode(node)) {
    return node;
  }

  const parentType = node.type;

  while (true) {
    const parentTypeNodes = node.children
      .filter((child): child is NamedTokenNode => child.type === parentType);

    if (parentTypeNodes.length > 0) {
      const children: TokenNode[] = node.children
        .flatMap((child) => {
          const parentTypeChild = parentTypeNodes.find((node) =>
            node === child
          );
          if (parentTypeChild) {
            return parentTypeChild.children;
          } else {
            return [child];
          }
        });
      node = new NamedTokenNode({
        ...node,
        children,
      });
    } else {
      break;
    }
  }

  node = new NamedTokenNode({
    ...node,
    children: node.children.map(flattenRecursiveNodes),
  });

  return node;
}
