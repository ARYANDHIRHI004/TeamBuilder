import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { systemRoles } from '../middlewares/auth.middleware.js';
import {
  createReview,
  getAllReviewsAdmin,
  getMyReviews,
  getReviewsForUser,
} from '../controllers/review.controller.js';

const reviewRouter = Router();

reviewRouter.use(verifyJwt);

reviewRouter.route('/create').post(createReview);
reviewRouter.route('/mine').get(getMyReviews);
reviewRouter.route('/user/:userId').get(getReviewsForUser);
reviewRouter.route('/all').get(systemRoles(['ADMIN', 'SUPERADMIN']), getAllReviewsAdmin);

export default reviewRouter;
