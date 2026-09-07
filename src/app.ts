import express from "express";
import { dogRouter } from "./routes/dog.routes.js";
import { sessionRouter } from "./routes/session.routes.js";

const app = express();

app.use(express.json());


app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
});

app.use("/dogs", dogRouter);
app.use("/sessions", sessionRouter);

export default app;