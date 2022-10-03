import {
  isLiteralTokenNode,
  LiteralTokenNode,
  NamedTokenNode,
  TempTokenType,
  TokenNode,
} from "../token.ts";

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
      const children: TokenNode[] = node.children.flatMap((child) => {
        if (child.type === TempTokenType) {
          return (child as NamedTokenNode).children;
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
    children: node.children.map(cleanupTempTokenNodes),
  });

  return node;
}
