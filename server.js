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
  let result;
  if (Array.isArray(req.body)) {
    result = await getShortestPaths(req.body);
  }
  console.log(result);
  res.status(200).json(result);
});

module.exports = app;

async function getShortestPaths(actorNames) {
  // Create a hashmap of accessible nodes from each actor.
  const personToMovies = {};
  const movieToPeople = {};
  const nodesToExamine = [];
  for (const actorName of actorNames) {
    const person = await getPerson(actorName);
    personToMovies[person.id] = undefined;
    nodesToExamine.push(person);
  }
  let result = allActorsAreConnected(personToMovies, movieToPeople);
  while (!result.size > 0) {
    for (person in personToMovies) {
      if (personToMovies[person] === undefined) {
        personToMovies[person] = await getMovies(person);
      }
    }
    result = await allActorsAreConnected(personToMovies, movieToPeople);
  }
  return result;
}

function allActorsAreConnected(personToMovies, movieToPeople) {
  const personIds = Object.keys(personToMovies);
  let arrayOfMovies = personToMovies[personIds[0]];
  if (arrayOfMovies === undefined) return false;
  let commonMovies = new Set(arrayOfMovies.map(x => JSON.stringify(x)));
  for (let i = 1; i < personIds.length; ++i) {
    const movies = personToMovies[personIds[i]];
    commonMovies = new Set(
      movies
        .filter(x => commonMovies.has(JSON.stringify(x)))
        .map(x => JSON.stringify(x))
    );
  }
  return commonMovies;
}

async function getPerson(personName) {
  let query = "/search/person";
  let url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
    process.env.THE_MOVIE_DB_API_KEY
  }&query=${encodeURI(personName)}`;
  const allData = (await axios.get(url)).data.results[0];
  return {
    type: "person",
    id: allData.id,
    name: allData.name
  };
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
        type: "movie",
        id: work.id,
        name: work.original_title
      });
    }
  }
  return result;
}

async function getPeople(movieId) {
  let query = `/movie/${movieId}/credits`;
  let url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
    process.env.THE_MOVIE_DB_API_KEY
  }`;
  const allData = (await axios.get(url)).data.cast;
  const result = [];
  for (const person of allData) {
    result.push({
      type: "person",
      id: person.id,
      name: person.name
    });
  }
  return result;
}
