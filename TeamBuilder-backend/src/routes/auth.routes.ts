import express from 'express'
import type {Router} from 'express'
import { getAdmins, getMe, getMyReviews, getUserProfile, loginUser, logoutUser, registerUser, updateMyProfile } from '../controllers/auth.controller.js'
import { systemRoles } from '../middlewares/auth.middleware.js';
import passport from 'passport';
import { verifyJwt } from '../middlewares/auth.middleware.js';

function authRoutes(): Router {
  const authRouter:Router = express.Router()

  authRouter.route("/google").get( passport.authenticate("google", {scope: ["profile", "email"]}));
  authRouter.route("/google/callback").get(passport.authenticate("google", {
    session: false
  }),loginUser)
  authRouter.route('/logout').get(verifyJwt, logoutUser);
  authRouter.route('/get-me').get(verifyJwt, getMe);
  authRouter.route('/get-admins').get(verifyJwt, systemRoles(['ADMIN', 'SUPERADMIN']), getAdmins);
  authRouter.route('/get-my-reviews').get(verifyJwt, getMyReviews);
  authRouter.route('/users/me/profile').patch(verifyJwt, updateMyProfile);
  authRouter.route('/users/:userId/profile').get(verifyJwt, getUserProfile);

  return authRouter;
}

export const authRouter =  authRoutes()
