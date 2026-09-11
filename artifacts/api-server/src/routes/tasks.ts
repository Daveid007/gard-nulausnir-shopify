import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, membersTable, projectsTable, activityTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  ListTasksQueryParams,
  ListProjectTasksParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichTask(task: typeof tasksTable.$inferSelect) {
  let assigneeName: string | null = null;
  let assigneeColor: string | null = null;
  let projectName: string | null = null;

  if (task.assigneeId) {
    const [m] = await db.select().from(membersTable).where(eq(membersTable.id, task.assigneeId));
    assigneeName = m?.name ?? null;
    assigneeColor = m?.avatarColor ?? null;
  }
  const [p] = await db.select().from(projectsTable).where(eq(projectsTable.id, task.projectId));
  projectName = p?.name ?? null;

  return {
    ...task,
    assigneeName,
    assigneeColor,
    projectName,
    createdAt: task.createdAt.toISOString(),
  };
}

router.get("/tasks", async (req, res) => {
  const query = ListTasksQueryParams.parse({
    status: req.query.status,
    assigneeId: req.query.assigneeId ? Number(req.query.assigneeId) : undefined,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
  });

  const conditions = [];
  if (query.status) conditions.push(eq(tasksTable.status, query.status));
  if (query.assigneeId) conditions.push(eq(tasksTable.assigneeId, query.assigneeId));
  if (query.projectId) conditions.push(eq(tasksTable.projectId, query.projectId));

  const tasks = conditions.length > 0
    ? await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.createdAt)
    : await db.select().from(tasksTable).orderBy(tasksTable.createdAt);

  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

router.post("/tasks", async (req, res) => {
  const body = CreateTaskBody.parse(req.body);
  const [task] = await db.insert(tasksTable).values(body).returning();

  // Log activity
  const actor = body.assigneeId
    ? (await db.select().from(membersTable).where(eq(membersTable.id, body.assigneeId)))[0]
    : null;
  await db.insert(activityTable).values({
    taskId: task.id,
    memberId: actor?.id ?? null,
    action: "created",
  });

  res.status(201).json(await enrichTask(task));
});

router.get("/projects/:id/tasks", async (req, res) => {
  const { id } = ListProjectTasksParams.parse({ id: Number(req.params.id) });
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, id)).orderBy(tasksTable.createdAt);
  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

router.get("/tasks/:id", async (req, res) => {
  const { id } = GetTaskParams.parse({ id: Number(req.params.id) });
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  res.json(await enrichTask(task));
});

router.patch("/tasks/:id", async (req, res) => {
  const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });
  const body = UpdateTaskBody.parse(req.body);

  const [before] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!before) { res.status(404).json({ error: "Task not found" }); return; }

  const [task] = await db.update(tasksTable).set(body).where(eq(tasksTable.id, id)).returning();

  // Log activity for status changes
  if (body.status && body.status !== before.status) {
    const actorId = body.assigneeId ?? task.assigneeId ?? null;
    await db.insert(activityTable).values({
      taskId: task.id,
      memberId: actorId,
      action: `moved to ${body.status.replace("_", " ")}`,
    });
  }

  res.json(await enrichTask(task));
});

router.delete("/tasks/:id", async (req, res) => {
  const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.status(204).send();
});

export default router;
