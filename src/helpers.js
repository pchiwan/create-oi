export function uB (word) {
  return word >> 8;
}

export function lB (word) {
  return word & 0x000000ff;
}

export function logger(message, verbose) {
  if (verbose) {
    console.log(message);
  }
}

export function noop() {}
