import type { Request, Response } from "express"
import { onboardingWrite } from "../db/db.controller.ts";
import { sendResponse } from "../utils/response.ts";

export type onboardingData = {
    uid: string,
    monthlyIncome: number,
    monthlyNeeds: number,
    miscNeeds: number,
    monthlyWants: number,
    emergencyFund: number,
    riskProfile: 5 | 8 | 11,
    hasDebts: boolean
}

export const onboardingController = async (req: Request,res: Response)=>{

    const uid = req.user.id;
    const monthlyIncome = req.body.monthlyIncome;
    const monthlyNeeds = req.body.monthlyNeeds;
    const miscNeeds = req.body.miscNeeds;
    const monthlyWants = req.body.monthlyWants;
    const emergencyFund = req.body.emergencyFund;
    const riskProfile = req.body.riskProfile;
    const hasDebts = req.body.hasDebts;

    const payload = {uid, monthlyIncome, monthlyNeeds, miscNeeds, monthlyWants, emergencyFund, riskProfile, hasDebts};

    const data = await onboardingWrite(payload);

    sendResponse(res, 200, "Succesfully Onboarded", data, true);


}