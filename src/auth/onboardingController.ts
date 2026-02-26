import type { Request, Response } from "express"
import { checkUser, onboardingWrite } from "../db/db.controller.ts";
import { sendResponse } from "../utils/response.ts";
import sql from "../utils/db.ts";

export type onboardingData = {
    uid: string,
    monthlyIncome: number,
    monthlyNeeds: number,
    miscNeeds: number,
    monthlyWants: number,
    emergencyFund: number,
    riskProfile: 5 | 8 | 11,
}

export const onboardingController = async (req: Request,res: Response)=>{

    const uid = req.user.id;
    const monthlyIncome = req.body.monthlyIncome;
    const monthlyNeeds = req.body.monthlyNeeds;
    const miscNeeds = req.body.miscNeeds;
    const monthlyWants = req.body.monthlyWants;
    const emergencyFund = req.body.emergencyFund;
    const riskProfile = req.body.riskProfile;

    const userData: any = await checkUser(uid);

    if(userData.length > 0){
        if(userData[0].onboarded){
            return sendResponse(res, 409, "User already Onboarded", false);
        }
    }

    const payload = {uid, monthlyIncome, monthlyNeeds, miscNeeds, monthlyWants, emergencyFund, riskProfile};

    const data = await onboardingWrite(payload);

    await sql`UPDATE PUBLIC.USERS SET ONBOARDED = TRUE WHERE UID = ${uid}`

    sendResponse(res, 200, "Succesfully Onboarded", data, true);


}