import cors from "cors";
import express from "express";
import MovieDB from "node-themoviedb";
import winston from "winston";

const app = express();
app.use(cors());

const api = express.Router();

const mdb = new MovieDB(process.env.THE_MOVIE_DB_API_KEY as string);

api.get<
  {},
  Array<MovieDB.Responses.Movie.GetCredits>,
  {},
  { movie_ids: { [k: string]: string } }
>("/movie_credits", async (req, res) =>
  Promise.all(
    Object.values(req.query.movie_ids).map((movie_id) =>
      mdb.movie
        .getCredits({ pathParameters: { movie_id } })
        .then(({ data }) => data)
        .catch((e) => {
          console.log(e);
          return (null as unknown) as MovieDB.Responses.Movie.GetCredits;
        })
    )
  )
    .then((credits) => res.json(credits.filter(Boolean)))
    .catch((e) => {
      console.error(e);
    })
);

api.get<
  {},
  Array<MovieDB.Responses.Person.GetCombinedCredits>,
  {},
  { person_ids: Array<number> }
>("/movies", async (req, res) =>
  Promise.all(
    Object.values(req.query.person_ids).map((person_id) =>
      mdb.person
        .getCombinedCredits({ pathParameters: { person_id } })
        .then(({ data }) => data)
    )
  ).then((combinedCredits) => res.json(combinedCredits))
);

api.get<{}, Array<MovieDB.Objects.Person>, {}, { actor_names: Array<string> }>(
  "/persons",
  async (req, res) =>
    Promise.all(
      req.query.actor_names.map((actorName) =>
        mdb.search
          .people({ query: { query: actorName } })
          .then(({ data }) => data.results[0])
      )
    ).then((persons) => res.json(persons))
);

app.use(express.json());
app.use("/api", api);

app.set("port", process.env.PORT || 3000);
app.get("/ping", (_req, res) => res.send({ status: "ok" }));

export default app;

const loggerFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple()
);

const logger = winston.createLogger({
  format: loggerFormat,
  level: "debug",
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production")
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.combine(winston.format.colorize(), loggerFormat)
      ),
    })
  );
