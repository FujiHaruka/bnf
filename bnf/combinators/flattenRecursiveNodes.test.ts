import { assertEquals, describe, it } from "../../deps-test.ts";
import { LiteralTokenNode, NamedTokenNode, TokenType } from "../token.ts";
import { flattenRecursiveNodes } from "./flattenRecursiveNodes.ts";

describe(flattenRecursiveNodes.name, () => {
  it("does not change a literal token node", () => {
    const node = new LiteralTokenNode({
      value: "#",
      startAt: 0,
      endAt: 0,
    });
    assertEquals(flattenRecursiveNodes(node), node);
  });

  it("does not change non-recursive node", () => {
    const node = new NamedTokenNode({
      type: new TokenType("a"),
      startAt: 0,
      endAt: 1,
      children: [
        new NamedTokenNode({
          type: new TokenType("b"),
          startAt: 0,
          endAt: 1,
          children: [
            new NamedTokenNode({
              type: new TokenType("c"),
              startAt: 0,
              endAt: 1,
              children: [
                new LiteralTokenNode({
                  value: "#",
                  startAt: 0,
                  endAt: 0,
                }),
              ],
            }),
          ],
        }),
      ],
    });

    assertEquals(flattenRecursiveNodes(node), node);
  });

  it("flatten recursive node", () => {
    const tokenType = new TokenType("a");
    const node = new NamedTokenNode({
      type: tokenType,
      startAt: 0,
      endAt: 0,
      children: [
        new LiteralTokenNode({
          value: "0",
          startAt: 0,
          endAt: 0,
        }),
        new NamedTokenNode({
          type: tokenType,
          startAt: 0,
          endAt: 0,
          children: [
            new LiteralTokenNode({
              value: "1",
              startAt: 0,
              endAt: 0,
            }),
            new NamedTokenNode({
              type: tokenType,
              startAt: 0,
              endAt: 0,
              children: [
                new LiteralTokenNode({
                  value: "2",
                  startAt: 0,
                  endAt: 0,
                }),
              ],
            }),
          ],
        }),
        new LiteralTokenNode({
          value: "3",
          startAt: 0,
          endAt: 0,
        }),
      ],
    });

    assertEquals(
      flattenRecursiveNodes(node),
      new NamedTokenNode({
        type: tokenType,
        startAt: 0,
        endAt: 0,
        children: [
          new LiteralTokenNode({
            value: "0",
            startAt: 0,
            endAt: 0,
          }),
          new LiteralTokenNode({
            value: "1",
            startAt: 0,
            endAt: 0,
          }),
          new LiteralTokenNode({
            value: "2",
            startAt: 0,
            endAt: 0,
          }),
          new LiteralTokenNode({
            value: "3",
            startAt: 0,
            endAt: 0,
          }),
        ],
      }),
    );
  });
});
