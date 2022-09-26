import { assertSnapshot, assertThrows } from "../deps-test.ts";
import { parse } from "./parser.ts";

function toJsonObject(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

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
  ];

  for (const test of tests) {
    await t.step(`"${test}"`, async (t) => {
      console.log(JSON.stringify(toJsonObject(parse(test))));
      await assertSnapshot(t, toJsonObject(parse(test)));
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
