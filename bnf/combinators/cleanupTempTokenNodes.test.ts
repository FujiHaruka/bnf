import { assertEquals, describe, it } from "../../deps-test.ts";
import { cleanupTempTokenNodes } from "./cleanupTempTokenNodes.ts";
import { NamedTokenNode, TempTokenType, TokenType } from "../token.ts";

describe(cleanupTempTokenNodes.name, () => {
  it("cleanup $temp nodes", () => {
    const tokenType = new TokenType("test");
    const node = new NamedTokenNode({
      type: tokenType,
      startAt: 0,
      endAt: 0,
      children: [
        new NamedTokenNode({
          type: tokenType,
          startAt: 0,
          endAt: 0,
          children: [
            new NamedTokenNode({
              type: TempTokenType,
              startAt: 0,
              endAt: 0,
              children: [
                new NamedTokenNode({
                  type: tokenType,
                  startAt: 0,
                  endAt: 0,
                  children: [],
                }),
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
      endAt: 0,
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
            new NamedTokenNode({
              type: tokenType,
              startAt: 0,
              endAt: 0,
              children: [],
            }),
          ],
        }),
      ],
    });
    assertEquals(cleanupTempTokenNodes(node), expected);
  });
});
