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
  const [actorNames, setActorNames] = useState(["Al Pacino", "Robert DeNiro"]);
  const [graph, setGraph] = useState(defaultGraph);

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
        <IonButton expand="full" onClick={handleGoClick}>
          GO
        </IonButton>
        <Graph links={links} nodes={nodes} />
      </IonContent>
    </IonPage>
  );

  async function handleGoClick() {
    setGraph(defaultGraph);
    const persons = await getPersons(...actorNames);
    const moviesByActorName = Object.fromEntries(
      persons.map(({ name }) => [name, Array<string>()])
    );
    setGraph(getLinksAndNodes(moviesByActorName));
    const realActorNames = persons.map(({ name }) => name);
    return getConnectedGraph(
      persons,
      moviesByActorName,
      realActorNames
    ).then((connectedGraph) =>
      setGraph(getLinksAndNodes(trimGraph(connectedGraph, realActorNames)))
    );
  }
};

setTimeout(() => document.querySelector("ion-button")?.click(), 500);

export default Home;
