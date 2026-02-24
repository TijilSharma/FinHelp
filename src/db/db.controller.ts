import sql from "../utils/db.ts";

export const checkUser = async (id: string)=>{
    return await sql`SELECT * FROM PUBLIC.USERS WHERE uid=${id}`
}

export const createUser = async (id:string, name:string, email:string, picture:string) => {
    return await sql`INSERT INTO PUBLIC.USERS (uid, name, email, picture) VALUES (${id}, ${name}, ${email}, ${picture})`
}