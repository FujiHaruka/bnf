import {
  isLiteralTokenNode,
  LiteralTokenNode,
  NamedTokenNode,
  TokenNode,
} from "../token.ts";

function isEmptyNode(node: TokenNode): boolean {
  return node.startAt === node.endAt;
}

export function removeEmptyNodes(node: LiteralTokenNode): LiteralTokenNode;
export function removeEmptyNodes(node: NamedTokenNode): NamedTokenNode;
export function removeEmptyNodes(node: TokenNode): TokenNode;
export function removeEmptyNodes(node: TokenNode): TokenNode {
  if (isLiteralTokenNode(node)) {
    return node;
  }

  const hasEmptyNode = Boolean(node.children.find(isEmptyNode));
  if (hasEmptyNode) {
    node.children = node.children.filter((node) => !isEmptyNode(node));
  }

  node.children.forEach(removeEmptyNodes);

  return node;
}
