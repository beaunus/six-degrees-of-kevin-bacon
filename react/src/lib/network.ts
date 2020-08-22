/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import _ from "lodash";
import MovieDB from "node-themoviedb";
import qs from "qs";

const BATCH_SIZE = 100;
const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL;

export function getMovieCredits(...movieIds: number[]) {
  return Promise.all(
    _.chunk(movieIds, BATCH_SIZE).map((movie_ids) =>
      axios
        .get<MovieDB.Responses.Movie.GetCredits[]>(
          `${MOVIE_SERVICE_URL}/movie_credits?${qs.stringify({ movie_ids })}`
        )
        .then(({ data }) => data)
    )
  ).then((batches) => batches.flat());
}

export function getPersonCredits(...personIds: number[]) {
  return Promise.all(
    _.chunk(personIds, BATCH_SIZE).map((person_ids) =>
      axios
        .get<MovieDB.Responses.Person.GetCombinedCredits[]>(
          `${MOVIE_SERVICE_URL}/movies?${qs.stringify({ person_ids })}`
        )
        .then(({ data }) => data)
    )
  ).then((batches) =>
    batches
      .flat()
      .map(({ cast }) => ({
        cast: cast.filter(({ popularity }) => popularity > 9.9),
      }))
      .filter(({ cast }) => cast.length)
  );
}

export function getPersons(...actorsNames: string[]) {
  return Promise.all(
    _.chunk(actorsNames, BATCH_SIZE).map((actor_names) =>
      axios
        .get<MovieDB.Objects.Person[]>(
          `${MOVIE_SERVICE_URL}/persons?${qs.stringify({ actor_names })}`
        )
        .then(({ data }) => data)
    )
  ).then((batches) => batches.flat());
}
