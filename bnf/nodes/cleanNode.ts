import { NamedTokenNode } from "../token.ts";
import { cleanupTempTokenNodes } from "./cleanupTempTokenNodes.ts";
import { flattenRecursiveNodes } from "./flattenRecursiveNodes.ts";
import { removeEmptyNodes } from "./removeEmptyNodes.ts";

export function cleanNode(node: NamedTokenNode): NamedTokenNode {
  node = cleanupTempTokenNodes(node);
  node = flattenRecursiveNodes(node);
  node = removeEmptyNodes(node);
  return node;
}
