/* eslint-disable @typescript-eslint/naming-convention */
import { menuController } from "@ionic/core";
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonPage,
  IonRange,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { film, person } from "ionicons/icons";
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
  const [actorNames, setActorNames] = useState(["Robert De Niro", "Al Pacino"]);
  const [graph, setGraph] = useState(defaultGraph);
  const [minMoviePopularity, setMinMoviePopularity] = useState(30);
  const [maxCastPosition, setMaxCastPosition] = useState(10);

  return (
    <IonApp>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar class="ion-text-center" color="primary">
            <IonText>Six Degrees of Kevin Bacon</IonText>
          </IonToolbar>
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
                  setActorNames([
                    ...actorNames.slice(0, 1),
                    e.detail.value || "",
                  ])
                }
                value={actorNames[1]}
              />
            </IonItem>
            <IonRange
              max={0}
              min={30}
              onIonChange={(e) => setMinMoviePopularity(Number(e.detail.value))}
              value={minMoviePopularity}
            >
              <IonIcon icon={film} size="small" slot="start" />
              <IonIcon icon={film} slot="end" />
            </IonRange>
            <IonRange
              max={100}
              min={1}
              onIonChange={(e) => setMaxCastPosition(Number(e.detail.value))}
              value={maxCastPosition}
            >
              <IonIcon icon={person} size="small" slot="start" />
              <IonIcon icon={person} slot="end" />
            </IonRange>
          </IonList>
          <IonButton expand="block" onClick={handleGoClick}>
            GO
          </IonButton>
        </IonContent>
      </IonMenu>
      <IonPage id="main-content">
        <IonButton expand="block" onClick={() => menuController.open()}>
          Open Menu
        </IonButton>
        <IonContent>
          <Graph {...graph} />
        </IonContent>
      </IonPage>
    </IonApp>
  );

  async function handleGoClick() {
    menuController.close();
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

setTimeout(() => menuController.open(), 500);

setTimeout(() => document.querySelector("IonButton")?.click(), 500);

export default Home;
