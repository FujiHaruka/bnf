import { assertSnapshot, assertThrows } from "../deps-test.ts";
import { parse } from "./parser.ts";

const testsSuccess: string[] = [];

testsSuccess.forEach((text) => {
  Deno.test(`parse / success "${text}"`, (t) => {
    assertSnapshot(t, parse(text));
  });
});

const testsFailure: string[] = [];
testsFailure.forEach((text) => {
  Deno.test(`parse / failure "${text}"`, () => {
    assertThrows(() => parse(text));
  });
});
