import { FatalError } from "../utils/errors.ts";
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
