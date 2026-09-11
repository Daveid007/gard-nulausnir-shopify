import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, membersTable, projectsTable, activityTable } from "@workspace/db";
import { eq, lt, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const [projects, tasks, members] = await Promise.all([
    db.select().from(projectsTable),
    db.select().from(tasksTable),
    db.select().from(membersTable),
  ]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const openTasks = tasks.filter(t => t.status !== "done").length;
  const overdueTasks = tasks.filter(t =>
    t.dueDate && t.dueDate < today && t.status !== "done"
  ).length;
  const totalMembers = members.length;

  res.json({ totalProjects, activeProjects, totalTasks, openTasks, overdueTasks, completedTasks, totalMembers });
});

router.get("/dashboard/activity", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  const activities = await db
    .select({
      id: activityTable.id,
      taskId: activityTable.taskId,
      taskTitle: tasksTable.title,
      action: activityTable.action,
      memberName: membersTable.name,
      memberColor: membersTable.avatarColor,
      projectName: projectsTable.name,
      timestamp: activityTable.timestamp,
    })
    .from(activityTable)
    .leftJoin(tasksTable, eq(activityTable.taskId, tasksTable.id))
    .leftJoin(membersTable, eq(activityTable.memberId, membersTable.id))
    .leftJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
    .orderBy(sql`${activityTable.timestamp} DESC`)
    .limit(limit);

  res.json(activities.map(a => ({
    ...a,
    taskTitle: a.taskTitle ?? "Unknown task",
    memberName: a.memberName ?? "Unknown",
    memberColor: a.memberColor ?? "#6366f1",
    projectName: a.projectName ?? "Unknown project",
    timestamp: a.timestamp instanceof Date ? a.timestamp.toISOString() : a.timestamp,
  })));
});

router.get("/dashboard/progress", async (req, res) => {
  const projects = await db.select().from(projectsTable);
  const tasks = await db.select().from(tasksTable);

  const progress = projects.map(p => {
    const projectTasks = tasks.filter(t => t.projectId === p.id);
    const totalTasks = projectTasks.length;
    const doneTasks = projectTasks.filter(t => t.status === "done").length;
    const inProgressTasks = projectTasks.filter(t => t.status === "in_progress").length;
    const todoTasks = projectTasks.filter(t => t.status === "todo").length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      projectId: p.id,
      projectName: p.name,
      status: p.status,
      totalTasks,
      doneTasks,
      inProgressTasks,
      todoTasks,
      progress,
    };
  });

  res.json(progress);
});

export default router;
