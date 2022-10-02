import { assertSnapshot, assertThrows } from "../deps-test.ts";
import { parse } from "./parser.ts";

const testsSuccess: string[] = [
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

testsSuccess.forEach((text) => {
  Deno.test(`parse / success "${text}"`, (t) => {
    assertSnapshot(t, parse(text));
  });
});

const testsFailure: string[] = [
  "",
  "a",
  "01",
  "10a",
];
testsFailure.forEach((text) => {
  Deno.test(`parse / failure "${text}"`, () => {
    assertThrows(() => parse(text));
  });
});
