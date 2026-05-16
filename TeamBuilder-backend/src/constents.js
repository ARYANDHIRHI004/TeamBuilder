import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});


export const environment = {
    PORT: process.env.PORT,
}