/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import _ from "lodash";
import MovieDB from "node-themoviedb";
import qs from "qs";

const URI = process.env.MOVIE_SERVICE_URL;

export function getMovieCredits(...movieIds: number[]) {
  return Promise.all(
    _.chunk(movieIds, 100).map((movie_ids) =>
      axios
        .get<MovieDB.Responses.Movie.GetCredits[]>(
          `${URI}/movie_credits?${qs.stringify({ movie_ids })}`
        )
        .then(({ data }) => data)
    )
  ).then(_.flatten);
}

export function getPersonCredits(...personIds: number[]) {
  return Promise.all(
    _.chunk(personIds, 100).map((person_ids) =>
      axios
        .get<MovieDB.Responses.Person.GetCombinedCredits[]>(
          `${URI}/movies?${qs.stringify({ person_ids })}`
        )
        .then(({ data }) => data)
    )
  )
    .then(_.flatten)
    .then((x) =>
      x
        .map(({ cast }) => ({ cast: cast.filter((z) => z.popularity > 9.9) }))
        .filter(({ cast }) => cast.length)
    );
}

export function getPersons(...actorsNames: string[]) {
  return Promise.all(
    _.chunk(actorsNames, 100).map((actor_names) =>
      axios
        .get<MovieDB.Objects.Person[]>(
          `${URI}/persons?${qs.stringify({ actor_names })}`
        )
        .then(({ data }) => data)
    )
  ).then(_.flatten);
}
