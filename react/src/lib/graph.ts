import _ from "lodash";
import MovieDB from "node-themoviedb";

import { getMovieCredits, getPersonCredits } from "./network";

export async function getConnectedGraph(
  persons: MovieDB.Objects.Person[],
  moviesByActorName: { [actorName: string]: string[] },
  realActorNames: string[]
) {
  const edgePersons = new Set<{ id: number; name: string }>(persons);
  const edgeMovies = new Set<{ id: number; name: string; title: string }>();

  let result = moviesByActorName;

  while (!areActorsConnected(result, realActorNames)) {
    if (edgePersons.size) {
      const personCredits = await getPersonCredits(
        ...[...edgePersons].map(({ id }) => id)
      );
      result = {
        ...result,
        ...Object.fromEntries(
          [...edgePersons].map(({ name }, index) => [
            name,
            personCredits[index].cast.map(({ title }) => title).filter(Boolean),
          ])
        ),
      };

      edgeMovies.clear();
      personCredits.forEach(({ cast }) =>
        cast.forEach((x) => edgeMovies.add(x))
      );
      edgePersons.clear();
    } else {
      const movieCredits = await getMovieCredits(
        ...[...edgeMovies].map(({ id }) => id)
      );
      const edgeMoviesById = _.keyBy([...edgeMovies], "id");
      const newMovieThing = {} as { [actorName: string]: string[] };
      edgePersons.clear();
      movieCredits.forEach((credits) => {
        credits.cast.forEach(({ id, name }) => {
          newMovieThing[name] = newMovieThing[name] || [];
          newMovieThing[name].push(
            edgeMoviesById[credits.id].title || edgeMoviesById[credits.id].name
          );
          edgePersons.add({ id, name });
        });
      });
      edgeMovies.clear();
      result = _.merge({}, result, newMovieThing);
    }
  }
  return result;
}

export function getPrevNodeByNode(
  moviesByActorName: _.Dictionary<string[]>,
  actorNames: string[]
) {
  const graph = Object.entries(moviesByActorName).reduce(
    (acc, [actorName, movieNames]) => {
      const result = { ...acc };
      result[actorName] = result[actorName] || new Set();
      movieNames.forEach((movieName) => {
        result[actorName].add(movieName);
        result[movieName] = result[movieName] || new Set();
        result[movieName].add(actorName);
      });
      return result;
    },
    {} as _.Dictionary<Set<string>>
  );

  const queue = [actorNames[0]];

  const prevNodeByNode = Object.fromEntries(
    Object.keys(graph).map((node) => [node, new Set<string>()])
  );
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift() as string;
    visited.add(current);
    for (const neighbor of [...graph[current]].filter(
      (x) => !prevNodeByNode[current].has(x)
    )) {
      queue.push(neighbor);
      visited.add(neighbor);
      prevNodeByNode[neighbor].add(current);
    }
  }
  return prevNodeByNode;
}

export function trimGraph(
  moviesByActorName: _.Dictionary<string[]>,
  actorNames: string[]
) {
  const prevNodeByNode = getPrevNodeByNode(moviesByActorName, actorNames);

  const trimmedMoviesByActorName = {} as _.Dictionary<string[]>;

  let isActor = true;
  let queue = [actorNames[1]];
  while (queue.length) {
    const next = Array<string>();
    if (isActor) {
      while (queue.length) {
        const current = queue.shift() as string;
        next.push(...prevNodeByNode[current]);
        trimmedMoviesByActorName[current] =
          trimmedMoviesByActorName[current] || [];
        trimmedMoviesByActorName[current].push(...prevNodeByNode[current]);
      }
    } else {
      while (queue.length) {
        const current = queue.shift() as string;
        prevNodeByNode[current].forEach((actorName) => {
          trimmedMoviesByActorName[actorName] =
            trimmedMoviesByActorName[actorName] || [];
          trimmedMoviesByActorName[actorName].push(current);
          next.push(actorName);
        });
      }
    }
    queue = next;
    isActor = !isActor;
  }

  return trimmedMoviesByActorName;
}

export function areActorsConnected(
  moviesByActorName: _.Dictionary<string[]>,
  actorNames: string[]
) {
  if (actorNames.length <= 1) return true;
  const visitedActors = [actorNames[0]];
  const visitedMovies = new Set<string>();
  let movieQueue = moviesByActorName[actorNames[0]];

  while (movieQueue.length) {
    const nextEntries = Object.entries(moviesByActorName).filter(
      ([actorName, movieNames]) =>
        !visitedActors.includes(actorName) &&
        movieNames.some((movieName) => movieQueue.includes(movieName))
    );

    movieQueue.forEach((movieName) => visitedMovies.add(movieName));
    movieQueue = nextEntries
      .flatMap(([, movieName]) => movieName)
      .filter((movieName) => !visitedMovies.has(movieName));
    visitedActors.push(...nextEntries.map(([actorName]) => actorName));

    if (actorNames.every((actorName) => visitedActors.includes(actorName)))
      return true;
  }
  return false;
}

export function getLinksAndNodes(moviesByActorName: _.Dictionary<string[]>) {
  return {
    links: Object.entries(moviesByActorName).flatMap(
      ([actorName, movieNames]) =>
        movieNames.map((movieName) => ({
          source: actorName,
          target: movieName,
          value: 1,
        }))
    ),
    nodes: [
      ...Object.keys(moviesByActorName).map((name) => ({ group: 1, id: name })),
      ..._.uniq(Object.values(moviesByActorName).flat()).map((movie) => ({
        group: 2,
        id: movie,
      })),
    ],
  };
}
