import app from "./app";
import { env } from "./env";

const PORT: number = +(env.PORT ?? 3000);

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
})