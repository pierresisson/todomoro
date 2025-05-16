import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { itemSchema, type Item } from "../schema/item";

type Bindings = {
  DB: D1Database;
};

export const itemsRoute = new Hono<{ Bindings: Bindings }>();

itemsRoute.get("/", async (c) => {
  const db = c.env.DB;
  try {
    const { results, success, error } = await db
      .prepare("SELECT * FROM items")
      .all<Item>();

    if (!success) {
      console.error("D1 Error fetching items:", error);
      return c.json({ message: "Failed to fetch items", error }, 500);
    }
    return c.json(results ?? [], 200);
  } catch (e: any) {
    console.error("Error in GET /items:", e.message);
    return c.json({ message: "Internal server error", error: e.message }, 500);
  }
});

itemsRoute.post("/", async (c) => {
  const db = c.env.DB;
  let body;
  try {
    body = await c.req.json();
  } catch (error) {
    return c.json({ message: "Invalid JSON body" }, 400);
  }

  const validationResult = itemSchema.safeParse(body);

  if (!validationResult.success) {
    return c.json(
      {
        message: "Validation failed",
        errors: validationResult.error.flatten(),
      },
      400
    );
  }

  const validatedData = validationResult.data;
  const id = uuidv4();

  const itemToInsert = {
    id,
    title: validatedData.title,
    description: validatedData.description,
    due_date: validatedData.due_date,
    priority: validatedData.priority,
    status: validatedData.status,
    reminder_date: validatedData.reminder_date,
    tags: validatedData.tags,
    project_id: validatedData.project_id,
    list_id: validatedData.list_id,
    completed: validatedData.completed,
  };

  await db
    .prepare(
      `INSERT INTO items (
      id, title, description, due_date, priority, status, reminder_date, tags, project_id, list_id, completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      itemToInsert.id,
      itemToInsert.title,
      itemToInsert.description,
      itemToInsert.due_date,
      itemToInsert.priority,
      itemToInsert.status,
      itemToInsert.reminder_date,
      itemToInsert.tags,
      itemToInsert.project_id,
      itemToInsert.list_id,
      itemToInsert.completed
    )
    .run();

  return c.json(itemToInsert, 201);
});

export type ItemsAppType = typeof itemsRoute;
