import type { Request, Response } from "express";
import sql from "../../utils/db.ts";
import { sendResponse } from "../../utils/response.ts";
import { fixedLoan, flexibleLoan, runAvalanche, runSnowball } from "./functions/debt.functions.ts";
import type { Debt } from "./functions/debt.functions.ts";
import type { onboardingData } from "../../auth/onboardingController.ts";

export const addDebt = async (req: Request, res: Response) => {
    try{
        // const uid = req.user.id;
        const uid = "101179884359405625352";
        const check = await sql`SELECT * FROM PUBLIC.DEBTS WHERE UID=${uid}`;

        if(check.length ===0){
            await sql`UPDATE PUBLIC.PROFILE SET DEBTS=TRUE WHERE UID=${uid}`;
        }
    

        const newDebt =
            await sql`INSERT INTO PUBLIC.DEBTS (UID, DEBT_NAME, DEBT_TYPE, PRINCIPLE, OUTSTANDING, ANNUALINTEREST, TENURE, EMI) VALUES (${uid}, ${req.body.debtName}, ${req.body.debtType}, ${req.body.principle}, ${req.body.outstanding}, ${req.body.annualinterest}, ${req.body.tenure}, ${req.body.emi})`;
            return sendResponse(res, 200, "Written data succesfully", newDebt, true);
        }
    catch(error){
        return sendResponse(res, 400, "Couldnt write to db", error, false);
    }
};

export const getDebts = async (req: Request, res: Response)=>{
    const uid = "101179884359405625352";
    const debts: Debt[] = await sql`SELECT * FROM PUBLIC.DEBTS WHERE UID=${uid}`;
    const profile: onboardingData[] = await sql`SELECT * FROM PUBLIC.PROFILE WHERE UID=${uid}`;

    if(!profile[0]){
        return sendResponse(res,400,"No such user exists",false);
    }

    const discretionaryIncome = Number(profile[0]?.income)-Number(profile[0]?.needs)-Number(profile[0]?.wants)-Number(profile[0]?.misc);

    if(debts.length===0){
        return sendResponse(res, 200, "No Debts", true);
    }

    const newDebts: Debt[] = debts.map((item: Debt)=>{
        if(item.debt_type === 'fixed'){
            const calcData = fixedLoan(item);
            item["emi"] = calcData.emi

            return{
                ...item,
                totalInterest: calcData.totalInterest
            }
        }
        else{
            const calcData = flexibleLoan(item);
            item["tenure"] = calcData.months/12
            return{
                ...item,
                totalInterest: calcData.totalInterest
            }
        }
    })

    let minEMI = 0;

    for(let debt of newDebts){
        minEMI = minEMI + Number(debt.emi);

    }

    if(discretionaryIncome < minEMI){
        return sendResponse(res, 406, "NOT SUFFICIENT FUNDS TO PAY MINIMUM BALANCE", {minEMI, discretionaryIncome}, false);
    }

    const freeCapital = discretionaryIncome - minEMI;

    const avalancheResult = runAvalanche(newDebts, freeCapital);
    const snowballResult = runSnowball(newDebts, freeCapital);

    return sendResponse(res, 200, "Successful", {
        newDebts,
        discretionaryIncome,
        minEMI,
        freeCapital,
        avalanche: avalancheResult,
        snowball: snowballResult
    }, true)    

}
