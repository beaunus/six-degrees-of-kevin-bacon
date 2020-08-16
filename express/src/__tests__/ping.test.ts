import status from "http-status";
import request from "supertest";

import app from "../app";

describe("/ping", () => {
  describe("GET", () => {
    it("should respond with an OK status message", async () => {
      const actual = await request(app).get("/ping");
      expect(actual.status).toBe(status.OK);
      expect(actual.body).toStrictEqual({ status: "ok" });
    });
  });
});
