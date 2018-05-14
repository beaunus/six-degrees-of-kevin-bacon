//During the test the env variable is set to test
process.env.NODE_ENV = "test";
const PORT = process.env.PORT || 3000;

let chai = require("chai");
let chaiHttp = require("chai-http");
let app = require("../server");
let should = chai.should();
const chalk = require("chalk");

const server = app.listen(PORT, () =>
  console.log(
    chalk.yellow.bold("Test server listening on port: ") + chalk.cyan.bold(PORT)
  )
);

chai.use(chaiHttp);
//Our parent block
describe("API server", () => {
  describe("GET /api", () => {
    it("it should return an object", done => {
      chai
        .request(server)
        .get("/api")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          done();
        });
    });
    it("it should return an object with nodes and links arrays", done => {
      chai
        .request(server)
        .get("/api")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.nodes.should.be.an("array");
          res.body.links.should.be.an("array");
          done();
        });
    });
    it("it should return an object whose nodes contain the given actors", done => {
      chai
        .request(server)
        .get("/api")
        .send(["Brad Pitt", "Edward Norton"])
        .end((err, res) => {
          res.should.have.status(200);
          res.body.nodes.should.contain("Brad Pitt");
          res.body.nodes.should.contain("Edward Norton");
          done();
        });
    });
  });
});
