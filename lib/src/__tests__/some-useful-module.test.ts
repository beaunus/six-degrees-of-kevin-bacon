import { ok } from "assert";

import _ from "lodash";

import * as SomeUsefulModule from "../some-useful-module";

jest.mock("assert");

describe("some-useful-module", () => {
  describe("someFunction", () => {
    const arg = _.uniqueId("arg");

    it("should return true", () => {
      expect(SomeUsefulModule.someFunction(arg)).toBe(true);
    });

    it("should call someOtherFunction", () => {
      jest.spyOn(SomeUsefulModule, "someOtherFunction");
      SomeUsefulModule.someFunction(arg);
      expect(SomeUsefulModule.someOtherFunction).toHaveBeenCalledWith();
    });

    it("should call someThirdPartyFunction", () => {
      SomeUsefulModule.someFunction(arg);
      expect(ok).toHaveBeenCalledWith(arg);
    });
  });
});
