import express from 'express'
import type {Router} from 'express'
import { loginUser, registerUser } from '../controllers/auth.controller.js'
import passport from 'passport';

function authRoutes(): Router {
  const authRouter:Router = express.Router()

  authRouter.route('/register-user').post(registerUser);
  authRouter.route("/google").get( passport.authenticate("google", {scope: ["profile", "email"]}));
  authRouter.route("/google/callback").get(passport.authenticate("google", {
    session: false
  }),loginUser)
 
  

  return authRouter;
}

export const authRouter =  authRoutes()
