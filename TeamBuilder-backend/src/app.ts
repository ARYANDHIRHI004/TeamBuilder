import Express, { urlencoded } from 'express'
import type { Application } from 'express'
import passport from './utils/passport.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import {authRouter} from './routes/auth.routes.js'




function createApp(): Application {
  const app: Application = Express()
  
  app.use(
    cors({
      origin: 'http://localhost:5173',
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    }),
  )
  app.use(Express.json())
  app.use(urlencoded({ extended: false }))
  app.use(cookieParser());

  app.use(passport.initialize())
  

  app.use('/api/v1/auth/', authRouter)

  return app
}

export const app =  createApp()
