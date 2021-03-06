/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import _ from "lodash";
import MovieDB from "node-themoviedb";
import qs from "qs";

const THE_MOVIE_DB_URL = process.env.THE_MOVIE_DB_URL;
const THE_MOVIE_DB_API_READ_ACCESS_TOKEN =
  process.env.THE_MOVIE_DB_API_READ_ACCESS_TOKEN;

const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 1000;
axios.get = _.memoize(axios.get);

const requestTheMovieDB = <T>(path: string, query?: _.Dictionary<unknown>) =>
  axios
    .get<T>(`${THE_MOVIE_DB_URL}${path}?${qs.stringify(query)}`, {
      headers: {
        Authorization: `Bearer ${THE_MOVIE_DB_API_READ_ACCESS_TOKEN}`,
      },
    })
    .then(({ data }) => data)
    .catch(() => (null as unknown) as T);

const requestInBatches = <T, U>(
  elements: U[],
  iteratee: (element: U) => Promise<T>,
  batchSize = BATCH_SIZE
) =>
  _.chunk(elements, batchSize).reduce<Promise<T[]>>(
    async (acc, cur) => [
      ...(await acc),
      ...(await Promise.all(cur.map(iteratee))),
    ],
    Promise.resolve(Array<T>())
  );

export const getMovieCredits = (
  movieIds: number[],
  options?: { maxOrder?: number }
) =>
  requestInBatches<MovieDB.Responses.Movie.GetCredits, number>(
    movieIds,
    (movieId: number) =>
      requestTheMovieDB<MovieDB.Responses.Movie.GetCredits>(
        `/movie/${movieId}/credits`
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

export const getPersonCredits = (
  personIds: number[],
  options?: { minPopularity?: number }
) =>
  requestInBatches<MovieDB.Responses.Person.GetCombinedCredits, number>(
    personIds,
    (personId) =>
      requestTheMovieDB<MovieDB.Responses.Person.GetCombinedCredits>(
        `/person/${personId}/combined_credits`
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

export const getPersons = (actorsNames: string[]) =>
  requestInBatches<MovieDB.Objects.Person, string>(actorsNames, (actorName) =>
    requestTheMovieDB<MovieDB.Responses.Search.People>("/search/person", {
      query: actorName,
    }).then(({ results }) => results[0])
  );
