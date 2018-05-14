//During the test the env variable is set to test
process.env.NODE_ENV = "test";

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe("API server", () => {
  describe("GET /api", () => {
    it("it should return an array of objects", done => {
      chai
        .request(server)
        .get("/api")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});
