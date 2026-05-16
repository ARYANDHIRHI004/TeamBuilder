import Express, { urlencoded } from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';

const app = Express();

app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
app.use(Express.json());
app.use(urlencoded({ extended: false }));

app.use("/api/v1/auth/", authRouter)


export default app;
