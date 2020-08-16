import cors from "cors";
import express from "express";

const app = express();
app.use(cors());

app.set("port", process.env.PORT || 3000);
app.get("/ping", (_req, res) => res.send({ status: "ok" }));

export default app;
