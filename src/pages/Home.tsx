/* eslint-disable @typescript-eslint/naming-convention */
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
import React, { useState } from "react";

import Graph from "../components/Graph";
import { getConnectedGraph, getLinksAndNodes, trimGraph } from "../lib/graph";
import { getPersons } from "../lib/network";
import "./Home.css";

const defaultGraph = { links: [], nodes: [] } as {
  links: { source: string; target: string; value: number }[];
  nodes: { group: number; id: string }[];
};

const Home: React.FC = () => {
  const [actorNames, setActorNames] = useState(["Al Pacino", "Jim Carrey"]);
  const [graph, setGraph] = useState(defaultGraph);
  const [minMoviePopularity, setMinMoviePopularity] = useState(30);
  const [maxCastPosition, setMaxCastPosition] = useState(10);

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
          <IonItem>
            <IonLabel position="floating">Minimum Movie Popularity</IonLabel>
            <IonInput
              max="30"
              min="0"
              onIonChange={(e) => setMinMoviePopularity(Number(e.detail.value))}
              type="number"
              value={minMoviePopularity}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Maximum Cast Position</IonLabel>
            <IonInput
              min="0"
              onIonChange={(e) => setMaxCastPosition(Number(e.detail.value))}
              type="number"
              value={maxCastPosition}
            />
          </IonItem>
        </IonList>
        <IonButton expand="full" onClick={handleGoClick}>
          GO
        </IonButton>
        <Graph {...graph} />
      </IonContent>
    </IonPage>
  );

  async function handleGoClick() {
    setGraph(defaultGraph);
    const persons = await getPersons(actorNames);
    const moviesByActorName = Object.fromEntries(
      persons.map(({ name }) => [name, Array<string>()])
    );
    setGraph(getLinksAndNodes(moviesByActorName));
    const realActorNames = persons.map(({ name }) => name);
    setGraph(
      getLinksAndNodes(
        trimGraph(
          await getConnectedGraph(persons, moviesByActorName, realActorNames, {
            maxCastPosition,
            minMoviePopularity,
          }),
          realActorNames
        )
      )
    );
  }
};

setTimeout(() => document.querySelector("ion-button")?.click(), 500);

export default Home;