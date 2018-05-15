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
      const personId = await getPersonId(actor);
      console.log(personId);
      console.log(await getMovies(personId));
    }
  }
  console.log(await getActors(978));
  res.status(200).json(result);
});

module.exports = app;

async function getPersonId(personName) {
  let query = "/search/person";
  let url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
    process.env.THE_MOVIE_DB_API_KEY
  }&query=${encodeURI(personName)}`;
  return (await axios.get(url)).data.results[0].id;
}

async function getMovies(personId) {
  let query = `/person/${personId}/combined_credits`;
  let url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
    process.env.THE_MOVIE_DB_API_KEY
  }`;
  const allData = (await axios.get(url)).data.cast;
  const result = [];
  for (const work of allData) {
    if (work.original_title) {
      result.push({
        movieId: work.id,
        character: work.character,
        originalTitle: work.original_title
      });
    }
  }
  return result;
}

async function getActors(movieId) {
  let query = `/movie/${movieId}/credits`;
  let url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
    process.env.THE_MOVIE_DB_API_KEY
  }`;
  const allData = (await axios.get(url)).data.cast;
  const result = [];
  for (const person of allData) {
    result.push({
      personId: person.id,
      character: person.character,
      name: person.name
    });
  }
  return result;
}
