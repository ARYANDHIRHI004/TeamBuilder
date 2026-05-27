import express from 'express'
import type {Router} from 'express'
import { registerUser } from '../controllers/auth.controller'

function authRoutes(): Router {
  const authRouter:Router = express.Router()

  authRouter.route('/register-user').post(registerUser);

  return authRouter;
}

export default authRoutes
