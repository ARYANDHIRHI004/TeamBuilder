import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});



const envSchema = z.object({
    PORT: z.string().optional(),
   
})

function createEnv(env: NodeJS.ProcessEnv){
    const validationResult = envSchema.safeParse(env);
    if(!validationResult.success){
        throw new Error(validationResult.error.message)
    }
    return validationResult.data;
}

export const env = createEnv(process.env);