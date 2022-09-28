import { assertSnapshot, assertThrows } from "../deps-test.ts";
import { parse } from "./parser.ts";

Deno.test("parse / success", async (t) => {
  const tests: string[] = [
    "0",
    "1",
    "10",
    "11",
    "100",
    "101",
    "110",
    "111",
    "1.01",
    "1.10",
    "-1",
    "0",
    "-10.10",
  ];

  for (const test of tests) {
    await t.step(`"${test}"`, async (t) => {
      await assertSnapshot(t, parse(test));
    });
  }
});

Deno.test("parse / failure", async (t) => {
  const tests: string[] = [
    "",
    "a",
    "01",
    "10a",
  ];

  for (const test of tests) {
    await t.step(`"${test}"`, async () => {
      await assertThrows(() => parse(test));
    });
  }
});
