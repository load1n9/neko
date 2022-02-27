export const encode = (str: string): Uint8Array => new TextEncoder().encode(str);

const ERROR_CODES: {
  [code: number]: string | undefined;
} = {
  2: "Window not found",
  3: "Failed to updateWithBuffer",
};

export function unwrap(result: number) {
  let error;
  if ((error = ERROR_CODES[result])) {
    throw new Error(`Unwrap called on Error Value (${result}): ${error}`);
  }
}

export function unwrapBoolean(result: number): boolean {
  if (result !== 0 && result !== 1) {
    unwrap(result);
    return false;
  } else {
    return result === 1;
  }
}
