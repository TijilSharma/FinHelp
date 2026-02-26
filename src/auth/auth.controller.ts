import type { Request, Response } from "express";
import { sendResponse } from "../utils/response.ts";
import { checkUser, createUser } from "../db/db.controller.ts";
import { signToken } from "../utils/jwt.ts";

export type Payload = {
  token: string
}

export function googleController(req:Request, res:Response){
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        redirect_uri: "http://localhost:3000/api/auth/callback",
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(googleAuthURL);
}

export const callbackController = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    return sendResponse(res, 400, "No code provided", false);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uri: "http://localhost:3000/api/auth/callback",
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return sendResponse(res, 400, "Token exchange failed", false);
    }

    const tokenData = await tokenRes.json();
    const { id_token, access_token } = tokenData;

    if (!access_token) {
      return sendResponse(res, 400, "No access token received", false);
    }

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      return sendResponse(res, 400, "Failed to fetch user info", false);
    }

    const userData = await userResponse.json();
    const id = userData.id;
    const name = userData.name;
    const email = userData.email;
    const picture = userData.picture;

    let isOnboarded: boolean = true;

    const existingUser = await checkUser(id);
    if(existingUser.length === 0){
        await createUser(id, name, email, picture);
               
    }
    const user: any = await checkUser(id);

    const jwtToken = signToken(id);

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
    });

    if(!user[0].onboarded){
      return res.redirect(`${process.env.FRONTEND_URL}/onboarding`)
    }

    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
  } catch (error) {
    console.log(error)
    return sendResponse(res, 500, "Authentication Failed", false);
  }
};