import { Router, type IRouter } from "express";
import healthRouter from "./health";
import exercisesRouter from "./exercises";
import recipesRouter from "./recipes";
import userActivityRouter from "./userActivity";

const router: IRouter = Router();

router.use(healthRouter);
router.use(exercisesRouter);
router.use(recipesRouter);
router.use(userActivityRouter);

export default router;
