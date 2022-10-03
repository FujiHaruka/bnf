import { assertEquals, describe, it } from "../../deps-test.ts";
import { NamedTokenNode, TokenType } from "../token.ts";
import { removeEmptyNodes } from "./removeEmptyNodes.ts";

describe(removeEmptyNodes.name, () => {
  it("works", () => {
    const tokenType = new TokenType("test");
    const node = new NamedTokenNode({
      type: tokenType,
      startAt: 0,
      endAt: 1,
      children: [
        new NamedTokenNode({
          type: tokenType,
          startAt: 0,
          endAt: 1,
          children: [
            new NamedTokenNode({
              type: tokenType,
              startAt: 0,
              endAt: 0,
              children: [
                new NamedTokenNode({
                  type: tokenType,
                  startAt: 0,
                  endAt: 0,
                  children: [],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    const expected = new NamedTokenNode({
      type: tokenType,
      startAt: 0,
      endAt: 1,
      children: [
        new NamedTokenNode({
          type: tokenType,
          startAt: 0,
          endAt: 1,
          children: [],
        }),
      ],
    });
    assertEquals(removeEmptyNodes(node), expected);
  });
});
