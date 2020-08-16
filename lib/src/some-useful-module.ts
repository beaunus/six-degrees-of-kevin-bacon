import assert from "assert";

export function someFunction(arg: string): boolean {
  exports.someOtherFunction();
  assert.ok(arg);
  return true;
}

export function someOtherFunction(): void {
  return;
}
