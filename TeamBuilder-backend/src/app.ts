import Express, { urlencoded } from 'express'
import type { Application } from 'express'

import cors from 'cors'
import authRouter from './routes/auth.routes'

function createApp(): Application {
  const app: Application = Express()

  app.use(
    cors({
      origin: '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    }),
  )
  app.use(Express.json())
  app.use(urlencoded({ extended: false }))

  app.use('/api/v1/auth/', authRouter)

  return app
}

export default createApp()
