import {
  isLiteralTokenNode,
  LiteralTokenNode,
  NamedTokenNode,
  TokenNode,
} from "../token.ts";

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
