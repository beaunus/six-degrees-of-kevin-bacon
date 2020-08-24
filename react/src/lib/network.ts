/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import _ from "lodash";
import MovieDB from "node-themoviedb";
import qs from "qs";

const THE_MOVIE_DB_URL = process.env.THE_MOVIE_DB_URL;
const THE_MOVIE_DB_API_KEY = process.env.THE_MOVIE_DB_API_KEY;
const THE_MOVIE_DB_API_READ_ACCESS_TOKEN =
  process.env.THE_MOVIE_DB_API_READ_ACCESS_TOKEN;

function requestTheMovieDB<T>(path: string, query?: _.Dictionary<unknown>) {
  return axios
    .get<T>(
      `${THE_MOVIE_DB_URL}${path}?${qs.stringify({
        ...query,
        api_key: THE_MOVIE_DB_API_KEY,
      })}`,
      {
        headers: {
          Authorization: `Bearer ${THE_MOVIE_DB_API_READ_ACCESS_TOKEN}`,
        },
      }
    )
    .then(({ data }) => data)
    .catch(() => (null as unknown) as T);
}

export function getMovieCredits(
  movieIds: number[],
  options?: { maxOrder?: number }
) {
  return Promise.all(
    movieIds.map((movieId) =>
      requestTheMovieDB<MovieDB.Responses.Movie.GetCredits>(
        `/movie/${movieId}/credits`
      )
    )
  ).then((results) =>
    results
      .filter(Boolean)
      .map((credits) => ({
        ...credits,
        cast: credits.cast.filter(({ order }) =>
          options?.maxOrder ? order <= options.maxOrder : true
        ),
      }))
      .filter(({ cast }) => cast.length)
  );
}

export function getPersonCredits(
  personIds: number[],
  options?: { minPopularity?: number }
) {
  return Promise.all(
    personIds.map((personId) =>
      requestTheMovieDB<MovieDB.Responses.Person.GetCombinedCredits>(
        `/person/${personId}/combined_credits`
      )
    )
  ).then((data) =>
    data
      .flat()
      .filter(Boolean)
      .map(({ cast }) => ({
        cast: cast.filter(({ popularity }) =>
          options?.minPopularity ? popularity >= options.minPopularity : true
        ),
      }))
      .filter(({ cast }) => cast.length)
  );
}

export function getPersons(actorsNames: string[]) {
  return Promise.all(
    actorsNames.map((actorName) =>
      requestTheMovieDB<MovieDB.Responses.Search.People>("/search/person", {
        query: actorName,
      }).then(({ results }) => results[0])
    )
  );
}
