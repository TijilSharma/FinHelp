import dotenv from "dotenv"
dotenv.config();
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
console.log(connectionString)
if(!connectionString){
    throw new Error("Database url is not defined");
}
const sql = postgres(connectionString, {ssl: "require"})

export default sql