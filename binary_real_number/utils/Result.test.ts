import { assertEquals } from "../../deps-test.ts";
import { Result } from "./Result.ts";

Deno.test("Result / initialize", () => {
  const ok = Result.Ok("hey");
  assertEquals(ok.isOk(), true);
  assertEquals(ok.isErr(), false);
  assertEquals(ok.unwrap(), "hey");

  const err = Result.Err(new Error("err"));
  assertEquals(err.isOk(), false);
  assertEquals(err.isErr(), true);
  assertEquals(err.unwrapErr().message, "err");
});

Deno.test("Result / map", () => {
  const length = (value: unknown) =>
    typeof value === "string" ? value.length : 0;
  const ok = Result.Ok("hey").map(length);
  assertEquals(ok.isOk(), true);
  assertEquals(ok.isErr(), false);
  assertEquals(ok.unwrap(), 3);

  const err = Result.Err(new Error("err")).map(length);
  assertEquals(err.isOk(), false);
  assertEquals(err.isErr(), true);
  assertEquals(err.unwrapErr().message, "err");
});

Deno.test("Result / andThen", () => {
  const length = (value: unknown) =>
    Result.Ok(typeof value === "string" ? value.length : 0);
  const ok = Result.Ok("hey").andThen(length);
  assertEquals(ok.isOk(), true);
  assertEquals(ok.isErr(), false);
  assertEquals(ok.unwrap(), 3);

  const err = Result.Err(new Error("err")).andThen(length);
  assertEquals(err.isOk(), false);
  assertEquals(err.isErr(), true);
  assertEquals(err.unwrapErr().message, "err");
});
