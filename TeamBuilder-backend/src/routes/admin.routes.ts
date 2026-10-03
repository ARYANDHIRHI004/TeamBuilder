import { Router } from 'express';
import { systemRoles, verifyJwt } from '../middlewares/auth.middleware.js';
import {
  getAllStudentsAdmin,
  getAllTeamsAdmin,
  setTeamBlockStatus,
  setUserBlockStatus,
} from '../controllers/admin.controller.js';

const adminRouter = Router();

adminRouter.use(verifyJwt);
adminRouter.use(systemRoles(['ADMIN', 'SUPERADMIN']));

adminRouter.route('/students').get(getAllStudentsAdmin);
adminRouter.route('/teams').get(getAllTeamsAdmin);
adminRouter.route('/users/:userId/block-status').patch(setUserBlockStatus);
adminRouter.route('/teams/:teamId/block-status').patch(setTeamBlockStatus);

export default adminRouter;
