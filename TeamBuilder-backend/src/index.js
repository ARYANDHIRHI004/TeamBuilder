import app from "./app.js";
import { environment } from "./constents.js";

const PORT = environment.PORT|| 3000

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
})