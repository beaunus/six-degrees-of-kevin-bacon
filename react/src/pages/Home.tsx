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
import MovieDB from "node-themoviedb";
import qs from "qs";
import React, { useState } from "react";
import Graph from "../components/Graph";
import "./Home.css";

const URI = `http://localhost:3000/api`;

function getLinksAndNodes(moviesByActorName: {
  [actorName: string]: Array<string>;
}) {
  return {
    links: [
      ...flatMap(
        Object.entries(moviesByActorName).map(([actorName, movieNames]) =>
          movieNames.map((movieName) => ({
            source: actorName,
            target: movieName,
            value: 1,
          }))
        )
      ),
    ],
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
    movieQueue = flatten(nextEntries.map(([, movieName]) => movieName)).filter(
      (movieName) => !visitedMovies.has(movieName)
    );
    visitedActors.push(...nextEntries.map(([actorName]) => actorName));

    if (actorNames.every((actorName) => visitedActors.includes(actorName)))
      return true;
  }
  return false;
}

function trimGraph(
  moviesByActorName: { [actorName: string]: Array<string> },
  actorNames: Array<string>
) {
  const graph = Object.entries(moviesByActorName).reduce(
    (acc, [actorName, movieNames]) => {
      acc[actorName] = acc[actorName] || new Set();
      movieNames.forEach((movieName) => {
        acc[actorName].add(movieName);
        acc[movieName] = acc[movieName] || new Set();
        acc[movieName].add(actorName);
      });
      return acc;
    },
    {} as { [k: string]: Set<string> }
  );

  let queue = [actorNames[0]];

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

  const trimmedMoviesByActorName = {} as { [actorName: string]: Array<string> };

  let isActor = true;
  queue = [actorNames[1]];
  while (queue.length) {
    let next = Array<string>();
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

const defaultGraph = { links: [], nodes: [] } as {
  links: { source: string; target: string; value: number }[];
  nodes: { group: number; id: string }[];
};

const Home: React.FC = () => {
  const [actorNames, setActorNames] = useState(["Al Pacino", "Robert DeNiro"]);
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
            const realActorNames = persons.map(({ name }) => name);

            while (!areActorsConnected(moviesByActorName, realActorNames)) {
              // for (let i = 0; i < 3; ++i)
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
                        .map(({ title }) => title)
                        .filter(Boolean),
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
                const newMovieThing = {} as {
                  [actorName: string]: Array<string>;
                };
                edgePersons.clear();
                for (const credits of movieCredits) {
                  credits.cast.forEach(({ id, name }) => {
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
              }
            }
            setGraph(
              getLinksAndNodes(trimGraph(moviesByActorName, realActorNames))
            );
          }}
        >
          GO
        </IonButton>
        <Graph links={links} nodes={nodes} />
      </IonContent>
    </IonPage>
  );

  async function getMovieCredits(...movieIds: Array<number>) {
    return Promise.all(
      _.chunk(movieIds, 100).map((movie_ids) =>
        axios
          .get<Array<MovieDB.Responses.Movie.GetCredits>>(
            `${URI}/movie_credits?${qs.stringify({ movie_ids })}`
          )
          .then(({ data }) => data)
      )
    ).then(flatten);
  }

  async function getPersonCredits(...personIds: Array<number>) {
    return Promise.all(
      _.chunk(personIds, 100).map((person_ids) =>
        axios
          .get<Array<MovieDB.Responses.Person.GetCombinedCredits>>(
            `${URI}/movies?${qs.stringify({ person_ids })}`
          )
          .then(({ data }) => data)
      )
    )
      .then(flatten)
      .then((x) =>
        x.map(({ cast }) => ({ cast: cast.filter((z) => z.popularity > 9.9) }))
      );
  }

  async function getPersons(...actorsNames: Array<string>) {
    return Promise.all(
      _.chunk(actorsNames, 100).map((actor_names) =>
        axios
          .get<Array<MovieDB.Objects.Person>>(
            `${URI}/persons?${qs.stringify({ actor_names })}`
          )
          .then(({ data }) => data)
      )
    ).then(flatten);
  }
};

setTimeout(() => document.querySelector("ion-button")?.click(), 500);

export default Home;
