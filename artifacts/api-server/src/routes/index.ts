import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import storiesRouter from "./stories";
import collectionsRouter from "./collections";
import guestbookRouter from "./guestbook";
import authorRouter from "./author";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(storiesRouter);
router.use(collectionsRouter);
router.use(guestbookRouter);
router.use(authorRouter);

export default router;
