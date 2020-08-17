import MovieDB from "node-themoviedb";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import axios from "axios";
import _, { flatMap, flatten } from "lodash";
import qs from "qs";
import React, { useState } from "react";
import Graph from "../components/Graph";
import "./Home.css";

// const actorNames = Array.from({ length: 10 }, () => _.uniqueId("actor"));
// const movieNames = Array.from({ length: 10 }, () => _.uniqueId("movie"));

// const moviesByActorName = Object.fromEntries(
//   actorNames.map((actorName) => [
//     actorName,
//     _.sampleSize(movieNames, _.random(0, 5)),
//   ])
// );

function getLinksAndNodes(moviesByActorName: {
  [actorName: string]: Array<string>;
}) {
  return {
    links: flatMap(
      Object.entries(moviesByActorName).map(([actorName, movieNames]) =>
        movieNames.map((movieName) => ({
          source: actorName,
          target: movieName,
          value: 1,
        }))
      )
    ),
    nodes: [
      ...Object.keys(moviesByActorName).map((name) => ({ group: 1, id: name })),
      ..._.uniq(flatten(Object.values(moviesByActorName))).map((name) => ({
        group: 2,
        id: name,
      })),
    ],
  };
}

function areActorsConnected(
  moviesByActorName: { [actorName: string]: Array<string> },
  actorNames: Array<string>
) {
  console.log({ moviesByActorName, actorNames });

  if (actorNames.length <= 1) return true;
  const visitedActors = [actorNames[0]];
  const visitedMovies = new Set<string>();
  let movieQueue = moviesByActorName[actorNames[0]];

  console.log({ movieQueue });

  while (movieQueue.length) {
    const nextEntries = Object.entries(moviesByActorName).filter(
      ([actorName, movieNames]) =>
        !visitedActors.includes(actorName) &&
        movieNames.some((movieName) => movieQueue.includes(movieName))
    );

    movieQueue.forEach((movieName) => visitedMovies.add(movieName));
    movieQueue = flatten(nextEntries.map(([, movieName]) => movieName)).filter(
      (movieName) => !visitedMovies.has(movieName)
    );
    visitedActors.push(...nextEntries.map(([actorName]) => actorName));

    if (actorNames.every((actorName) => visitedActors.includes(actorName)))
      return true;
  }
  return false;
}

const defaultGraph = { links: [], nodes: [] } as {
  links: { source: string; target: string; value: number }[];
  nodes: { group: number; id: string }[];
};

const Home: React.FC = () => {
  const [actorNames, setActorNames] = useState(["Beau", "Heather"]);
  const [graph, setGraph] = useState(defaultGraph);
  let moviesByActorName: { [actorName: string]: Array<string> };

  const { links, nodes } = graph;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>Six Degrees of Kevin Bacon</IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="floating">Actor 1</IonLabel>
            <IonInput
              clearInput
              onIonChange={(e) =>
                setActorNames([e.detail.value || "", ...actorNames.slice(1)])
              }
              value={actorNames[0]}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Actor 2</IonLabel>
            <IonInput
              clearInput
              onIonChange={(e) =>
                setActorNames([...actorNames.slice(0, 1), e.detail.value || ""])
              }
              value={actorNames[1]}
            />
          </IonItem>
        </IonList>
        <IonButton
          expand="full"
          onClick={async () => {
            setGraph(defaultGraph);
            const persons = await getPersons(...actorNames);
            moviesByActorName = Object.fromEntries(
              persons.map(({ name }) => [name, []])
            );
            setGraph(getLinksAndNodes(moviesByActorName));
            const edgePersons = new Set<{ id: number; name: string }>(persons);
            const edgeMovies = new Set<{
              id: number;
              name: string;
              title: string;
            }>();
            // const realActorNames = persons.map(({ name }) => name);

            // while (!areActorsConnected(moviesByActorName, realActorNames)) {
            for (let i = 0; i < 3; ++i)
              if (edgePersons.size) {
                const personCredits = await getPersonCredits(
                  ...[...edgePersons].map(({ id }) => id)
                );
                moviesByActorName = {
                  ...moviesByActorName,
                  ...Object.fromEntries(
                    [...edgePersons].map(({ name }, index) => [
                      name,
                      personCredits[index].cast
                        .slice(0, 5)
                        .map(({ title }) => title)
                        .filter(Boolean),
                    ])
                  ),
                };

                setGraph(getLinksAndNodes(moviesByActorName));
                edgeMovies.clear();
                personCredits.forEach(({ cast }) =>
                  cast.slice(0, 5).forEach((x) => edgeMovies.add(x))
                );
                edgePersons.clear();
              } else {
                const movieCredits = await getMovieCredits(
                  ...[...edgeMovies].map(({ id }) => id)
                );
                const edgeMoviesById = _.keyBy([...edgeMovies], "id");
                console.log({ movieCredits });
                const newMovieThing = {} as {
                  [actorName: string]: Array<string>;
                };
                edgePersons.clear();
                for (const credits of movieCredits) {
                  credits.cast.slice(0, 5).forEach(({ id, name }) => {
                    newMovieThing[name] = newMovieThing[name] || [];
                    newMovieThing[name].push(
                      edgeMoviesById[credits.id].title ||
                        edgeMoviesById[credits.id].name
                    );
                    edgePersons.add({ id, name });
                  });
                }
                edgeMovies.clear();
                moviesByActorName = _.merge(moviesByActorName, newMovieThing);
                setGraph(getLinksAndNodes(moviesByActorName));
              }
          }}
        >
          GO
        </IonButton>
        <Graph links={links} nodes={nodes} />
      </IonContent>
    </IonPage>
  );

  async function getMovieCredits(...movieIds: Array<number>) {
    console.log({ movieIds });
    return axios
      .get<Array<MovieDB.Responses.Movie.GetCredits>>(
        `http://localhost:3000/api/movie_credits?${qs.stringify({
          movie_ids: movieIds,
        })}`
      )
      .then(({ data }) => data);
  }

  async function getPersonCredits(...personIds: Array<number>) {
    return axios
      .get<Array<MovieDB.Responses.Person.GetCombinedCredits>>(
        `http://localhost:3000/api/movies?${qs.stringify({
          person_ids: personIds,
        })}`
      )
      .then(({ data }) => data);
  }

  async function getPersons(...actorsNames: Array<string>) {
    return axios
      .get<Array<MovieDB.Objects.Person>>(
        `http://localhost:3000/api/persons?${qs.stringify({
          actor_names: actorsNames,
        })}`
      )
      .then(({ data }) => data);
  }
};

export default Home;
