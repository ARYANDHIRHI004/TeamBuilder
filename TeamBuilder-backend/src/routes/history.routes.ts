import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getUsersHistory } from "../controllers/history.contoller.js";

const historyRouter = Router();

historyRouter.use(verifyJwt)

historyRouter.route('/:userId/get-history').get(getUsersHistory)

export default historyRouter                       