import { Router, type IRouter } from "express";
import healthRouter from "./health";
import membersRouter from "./members";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";
import checkoutRouter from "./checkout";
import shopifyCatalogRouter from "./shopifyCatalog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(membersRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(dashboardRouter);
router.use(checkoutRouter);
router.use(shopifyCatalogRouter);

export default router;
