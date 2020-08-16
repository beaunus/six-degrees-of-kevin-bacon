import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React from "react";

import { generateRandomGraph } from "../../../lib/src/graph";
import Graph from "../components/Graph";
import "./Home.css";

const Home: React.FC = () => {
  const { links, nodes } = generateRandomGraph();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hello</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Graph
          height={window.innerHeight}
          links={links}
          nodes={nodes}
          width={window.innerWidth}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
