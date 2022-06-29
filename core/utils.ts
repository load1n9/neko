export const encode = (str: string | Uint8Array): Uint8Array =>
  typeof str === "string" ? new TextEncoder().encode(str) : str;

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
  }
  return result === 1;
}

export const wrapBoolean = (value: boolean): number => (value ? 1 : 0);
