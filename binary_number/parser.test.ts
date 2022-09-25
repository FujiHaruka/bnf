import { parse } from "./parser.ts";

Deno.test("parse / success", async (t) => {
  const tests = [
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
    await t.step(test, () => {
      // TODO:
      console.log(JSON.stringify(parse(test), null, 2));
    });
  }
});

Deno.test("parse / failure", () => {
  // TODO:
});
