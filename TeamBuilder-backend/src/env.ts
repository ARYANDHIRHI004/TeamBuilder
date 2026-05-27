import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({
    path: "./src/.env"
});



const envSchema = z.object({
    PORT: z.string().optional(),
    DATABASE_URL: z.string()
   
})


function createEnv(env: NodeJS.ProcessEnv){
    const validationResult = envSchema.safeParse(env);
    if(!validationResult.success){
        throw new Error(validationResult.error.message)
    }
    return validationResult.data;
}

export const env = createEnv(process.env);