export class TokenNode {
  readonly type: TokenType;
  readonly children: TokenNode[];
  readonly startAt: number;
  readonly endAt: number;

  constructor({
    type,
    children,
    startAt,
    endAt,
  }: {
    type: TokenType;
    children: TokenNode[];
    startAt: number;
    endAt: number;
  }) {
    this.type = type;
    this.children = children;
    this.startAt = startAt;
    this.endAt = endAt;
  }
}

export interface TokenNodeJson {
  type: string;
  children: TokenNodeJson[];
  startAt: number;
  endAt: number;
}

export class FatalError extends Error {}

export class ScanContext {
  #cursor = 0;

  constructor(
    readonly text: string,
  ) {}

  get cursor(): number {
    return this.#cursor;
  }

  nextCursor(): void {
    this.#cursor++;
  }

  prevCursor(): void {
    if (this.#cursor === 0) {
      throw new FatalError("Tried to decrement cursor, but cursor points to 0");
    }

    this.#cursor--;
  }

  get scanFinished(): boolean {
    return this.text.length <= this.cursor;
  }

  get currentChar(): string | null {
    const char = this.text.charAt(this.cursor);
    if (!char) {
      return null;
    }
    return char;
  }
}

export class UnexpectedTokenError extends Error {
  constructor(ctx: ScanContext) {
    super(`Unexpected token ${ctx.currentChar} at position ${ctx.cursor}`);
  }
}

export class TokenType {
  constructor(readonly name: string) {}

  toJSON() {
    return this.name;
  }

  toString() {
    return this.name;
  }
}
