import _ from "lodash";

export function generateRandomGraph(
  numActors = 2,
  numMovies = _.random(10, 20),
  numLinks = _.random(numActors + numMovies, numActors * numMovies)
) {
  const actors = Array.from({ length: numActors }, () => ({
    group: 1,
    id: _.uniqueId("actor"),
  }));
  const movies = Array.from({ length: numMovies }, () => ({
    group: 2,
    id: _.uniqueId("movie"),
  }));

  const links = Array.from({ length: numLinks }, () => ({
    source: _.sampleSize(actors, 1)[0].id,
    target: _.sampleSize(movies, 1)[0].id,
    value: 1,
  }));

  return {
    links,
    nodes: [
      ...actors,
      ...movies.filter(
        ({ id }) => links.findIndex(({ target }) => target === id) >= 0
      ),
    ],
  };
}
