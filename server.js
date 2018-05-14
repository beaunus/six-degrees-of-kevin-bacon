require("dotenv").config();
const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
const axios = require("axios");

const app = express();
const bodyParser = require("body-parser");

const THE_MOVIE_DB_ENDPOINT = "https://api.themoviedb.org/3";

app.use("/", serveStatic(path.join(__dirname)));
app.use(bodyParser.json());

app.route("/api").get(async (req, res) => {
  const result = {
    nodes: [],
    links: []
  };
  if (Array.isArray(req.body)) {
    for (const actor of req.body) {
      let query = "/search/person";
      let url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
        process.env.THE_MOVIE_DB_API_KEY
      }&query=${encodeURI(actor)}`;
      axios
        .get(url)
        .then(response => response.data.results[0].id)
        .then(person_id => {
          query = `/person/${person_id}/movie_credits`;
          url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
            process.env.THE_MOVIE_DB_API_KEY
          }`;
          console.log;
          return axios.get(url);
        })
        .then(response => console.log(response.data))
        .catch(error => {
          console.log(error);
        });

      result.nodes.push(actor);
    }
  }
  res.status(200).json(result);
});

module.exports = app;
