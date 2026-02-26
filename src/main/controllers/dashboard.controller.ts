import type { Request, Response } from "express"
import sql from "../../utils/db.ts"
import { sendResponse } from "../../utils/response.ts";

export const dashboardData = async (req: Request,res: Response)=>{

    try{    
        const uid:string =  req.user.id;
        // const uid:string =  "101179884359405625352";

        const rows = await sql`SELECT * FROM PUBLIC.PROFILE WHERE UID=${uid}`;
        const isValidRows = await sql`SELECT ONBOARDED FROM PUBLIC.USERS WHERE UID=${uid}`;
        const isValid = isValidRows[0];
        const data = rows[0];

        if(!data){
            return sendResponse(res, 404, "User Not Found", false);
        }

        if(!isValid){
            return sendResponse(res, 406, "Not Acceptable: User is not Onboarded");
        }

        const monthlyIncome = Number(data.income);
        const needs = Number(data.needs);
        const wants = Number(data.wants)+Number(data.misc);
        const discretionaryIncome = monthlyIncome - needs;
        const expenseRatio = (needs+wants)/monthlyIncome;
        const emergencyFund = Number(data.emergency_fund);
        const targetEmergencyFund = needs*6;
        const savings = discretionaryIncome - wants;
        const targetSavings = 0.2*monthlyIncome;
        const maxNeeds = 0.5*monthlyIncome;
        const maxWants = 0.3*monthlyIncome
        

        const payload = {monthlyIncome, discretionaryIncome, expenseRatio, emergencyFund, targetEmergencyFund, savings, targetSavings, needs, wants, maxNeeds, maxWants};

        return sendResponse(res, 200, "Succesfully calculated dashboard data", payload, true);
    }

    catch(error){
        return sendResponse(res, 400, "Error", error, false);
    }

}