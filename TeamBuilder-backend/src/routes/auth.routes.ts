import express from 'express'
import type {Router} from 'express'
import { getMe, loginUser, registerUser } from '../controllers/auth.controller.js'
import passport from 'passport';
import { verifyJwt } from '../middlewares/auth.middleware.js';

function authRoutes(): Router {
  const authRouter:Router = express.Router()

  authRouter.route('/register-user').post(registerUser);
  authRouter.route("/google").get( passport.authenticate("google", {scope: ["profile", "email"]}));
  authRouter.route("/google/callback").get(passport.authenticate("google", {
    session: false
  }),loginUser)
  authRouter.route('/get-me').get(verifyJwt, getMe);
 
  

  return authRouter;
}

export const authRouter =  authRoutes()
