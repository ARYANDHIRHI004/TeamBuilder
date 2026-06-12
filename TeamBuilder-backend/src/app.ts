import Express, { urlencoded } from 'express'
import type { Application } from 'express'
import passport from './utils/passport.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import {authRouter} from './routes/auth.routes.js'
import { courseRouter } from './routes/courses.routes.js'
import teamRouter from './routes/team.routes.js'
import notesRouter from './routes/notes.routes.js'




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
  app.use(Express.static("public"))
  app.use(Express.urlencoded({ extended: false }))
  app.use(cookieParser());

  app.use(passport.initialize())
  

  app.use('/api/v1/auth/', authRouter)
  app.use('/api/v1/courses/', courseRouter)
  app.use('/api/v1/team/', teamRouter)
  app.use('/api/v1/notes/', notesRouter)

  return app
}

export const app =  createApp()
