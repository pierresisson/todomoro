import { Hono } from "hono";
import { itemsRoute } from "./routes/item";

const app = new Hono();

app.route("/", itemsRoute);

export default app;
