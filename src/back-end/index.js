require("dotenv").config();
const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
const axios = require("axios");

const app = express();
const bodyParser = require("body-parser");

const THE_MOVIE_DB_ENDPOINT = "https://api.themoviedb.org/3";

app.use("/", serveStatic(path.join(`${__dirname}/../front-end`)));
app.use(bodyParser.json());

app.route("/api").get(async (req, res) => {
  let result;
  if (Array.isArray(req.query.actor)) {
    console.log(`${new Date()} - API QUERY REQUESTED - ${req.query.actor}`);
    result = await getShortestPaths(req.query.actor);
  }
  res.status(200).json(result);
});

module.exports = app;

function logFunctionCall(callee, args) {
  console.log(
    `${new Date()}:${new Date().getMilliseconds()} - ${callee.name} CALLED - `,
    args
  );
}

async function getShortestPaths(actorNames) {
  logFunctionCall(arguments.callee, arguments);
  // Create a hashmap of accessible nodes from each actor.
  const personToMovies = {};
  const movieToPeople = {};
  const nodesToExamine = [];
  for (const actorName of actorNames) {
    const person = await getPerson(actorName);
    personToMovies[person.id] = undefined;
    nodesToExamine.push(person);
  }
  let commonMovies = getCommonMovies(personToMovies);
  while (commonMovies.size < 1) {
    for (person in personToMovies) {
      if (personToMovies[person] === undefined) {
        personToMovies[person] = await getMovies(person);
      }
    }
    commonMovies = getCommonMovies(personToMovies);
  }
  return getPaths(actorNames, commonMovies);
}

function getPaths(actorNames, commonMovies) {
  logFunctionCall(arguments.callee, arguments);
  const result = {
    nodes: [],
    links: []
  };
  for (actorName of actorNames) {
    result.nodes.push({ id: actorName, group: 1 });
    for (movieJSON of commonMovies) {
      const movie = JSON.parse(movieJSON);
      result.links.push({
        source: actorName,
        target: movie.name,
        value: 1
      });
    }
  }
  for (movieJSON of commonMovies) {
    const movie = JSON.parse(movieJSON);
    result.nodes.push({ id: movie.name, group: 2 });
  }
  return result;
}

function getCommonMovies(personToMovies) {
  logFunctionCall(arguments.callee, arguments);
  const personIds = Object.keys(personToMovies);
  let arrayOfMovies = personToMovies[personIds[0]];
  if (arrayOfMovies === undefined) return new Set();
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
  logFunctionCall(arguments.callee, arguments);
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
  logFunctionCall(arguments.callee, arguments);
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
  logFunctionCall(arguments.callee, arguments);
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
