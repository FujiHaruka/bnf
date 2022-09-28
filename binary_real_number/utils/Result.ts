const ResultOk = Symbol("ok");
const ResultErr = Symbol("err");
type ResultType = typeof ResultOk | typeof ResultErr;

export class Result<T, E = Error> {
  private readonly type: ResultType;
  private readonly ok: T | null;
  private readonly err: E | null;

  private constructor(init: ({ ok: T } | { err: E }) & { type: ResultType }) {
    this.type = init.type;
    this.ok = (init as { ok: T }).ok ?? null;
    this.err = (init as { err: E }).err ?? null;
  }

  static Ok<T, E = Error>(value: T): Result<T, E> {
    return new Result({ type: ResultOk, ok: value });
  }

  static Err<T, E = Error>(err: E): Result<T, E> {
    return new Result({ type: ResultErr, err });
  }

  isOk(): boolean {
    return this.type === ResultOk;
  }

  isErr(): boolean {
    return this.type === ResultErr;
  }

  unwrap(): T {
    switch (this.type) {
      case ResultOk:
        return this.ok!;
      case ResultErr:
        throw this.err;
    }
  }

  unwrapErr(): E {
    switch (this.type) {
      case ResultOk:
        throw new Error("cannot unwrapErr");
      case ResultErr:
        return this.err!;
    }
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    switch (this.type) {
      case ResultOk:
        return Result.Ok(fn(this.ok!));
      case ResultErr:
        return this.as<U, E>();
    }
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    switch (this.type) {
      case ResultOk:
        return fn(this.ok!);
      case ResultErr:
        return this.as<U, E>();
    }
  }

  private as<U, E>(): Result<U, E> {
    switch (this.type) {
      case ResultOk:
        throw new Error("cannot as");
      case ResultErr:
        return (this as unknown) as Result<U, E>;
    }
  }
}
