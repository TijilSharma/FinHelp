import type { onboardingData } from "../../auth/onboardingController.ts"
import type { Debt } from "./functions/debt.functions.ts"
import { sendResponse } from "../../utils/response.ts"
import type { Response, Request } from "express"
import sql from "../../utils/db.ts"
import { generatePhases } from "./functions/usp.functions.ts"
import { fixedLoan, flexibleLoan } from "./functions/debt.functions.ts"

export const getUSP = async (req: Request, res: Response) => {
    try {
        const uid = req.user.id

        // ── identical to getDebts up to here ──
        const debts: Debt[] = await sql`SELECT * FROM PUBLIC.DEBTS WHERE UID=${uid}`
        const profile: onboardingData[] = await sql`SELECT * FROM PUBLIC.PROFILE WHERE UID=${uid}`

        if (!profile[0]) {
            return sendResponse(res, 400, "No such user exists", false)
        }

        if (debts.length === 0) {
            // no debts at all — skip straight to phase 4
            return sendResponse(res, 200, "No debts", {
                phases: [{
                    phase: 4,
                    goal: "Full investment mode",
                    duration_months: "ongoing",
                    monthly_allocation: {
                        emergency_fund: 0,
                        debt_surplus: 0,
                        investment: "all free capital"
                    }
                }]
            }, true)
        }

        const discretionaryIncome = Number(profile[0].income)
                                  - Number(profile[0].needs)
                                  - Number(profile[0].wants)
                                  - Number(profile[0].misc)

        const computedDebts: Debt[] = debts.map((item: Debt) => {
            if (item.debt_type === 'fixed') {
                const calcData = fixedLoan(item)
                return { ...item, emi: calcData.emi, totalInterest: calcData.totalInterest }
            } else {
                const calcData = flexibleLoan(item)
                return { ...item, tenure: calcData.months / 12, totalInterest: calcData.totalInterest }
            }
        })

        const totalMinEMI = computedDebts.reduce((sum, d) => sum + Number(d.emi), 0)

        if (discretionaryIncome < totalMinEMI) {
            return sendResponse(res, 406, "CRITICAL_OVERRIDE", {
                totalMinEMI,
                discretionaryIncome
            }, false)
        }

        const freeCapital = discretionaryIncome - totalMinEMI

        if (freeCapital < 500) {
            return sendResponse(res, 200, "INSUFFICIENT_FREE_CAPITAL", { freeCapital }, false)
        }

        // ── THIS IS WHERE USP DIVERGES FROM getDebts ──

        // split debts by risk profile rate
        const riskProfile = Number(profile[0].risk_profile)

        const priorityDebts = computedDebts.filter(d => 
            Number(d.annualinterest) > riskProfile
        )
        const lowPriorityDebts = computedDebts.filter(d => 
            Number(d.annualinterest) <= riskProfile
        )

        // generate phases
        const phases = generatePhases(
            profile[0], 
            freeCapital, 
            priorityDebts, 
            lowPriorityDebts
        )

        // sum total months to full optimization
        const totalMonths = phases
            .filter((p: any) => p.duration_months !== "ongoing")
            .reduce((sum: number, p: any) => sum + p.duration_months, 0)

        return sendResponse(res, 200, "Successful", {
            discretionaryIncome,
            totalMinEMI,
            freeCapital,
            riskProfile,
            priorityDebts,
            lowPriorityDebts,
            totalMonths,
            phases
        }, true)

    } catch (error) {
        return sendResponse(res, 500, "Internal server error", error, false)
    }
}