import type { Debt } from "./debt.functions.ts";
import type { onboardingData } from "../../../auth/onboardingController.ts";
import { runAvalanche, runSnowball } from "./debt.functions.ts";

export const generatePhases = (
    profile: onboardingData,
    freeCapital: number,
    priorityDebts: Debt[],
    lowPriorityDebts: Debt[]
) => {

    const phases: any[] = []
    const monthlyNeeds = Number(profile.needs)
    const efTarget1Month = monthlyNeeds
    const efTarget3Month = monthlyNeeds * 3
    let currentEF = Number(profile.emergency_fund)

    // ── PHASE 1 ──────────────────────────────────────────────
    // Condition: EF is less than 1 month of needs
    // Goal: Aggressively build emergency fund to 1 month
    // Debt: minimum payments only, zero surplus

    if (currentEF < efTarget1Month) {

        const efNeeded = efTarget1Month - currentEF

        // how many months to fill 1 month EF at full freeCapital
        const monthsToComplete = Math.ceil(efNeeded / freeCapital)

        // how much EF will be built by end of this phase
        // cap it at 3 month target in case freeCapital overshoots
        const efByEndOfPhase = Math.min(
            currentEF + (freeCapital * monthsToComplete),
            efTarget3Month
        )

        phases.push({
            phase: 1,
            goal: "Build 1 month emergency fund",
            duration_months: monthsToComplete,
            monthly_allocation: {
                emergency_fund: Math.round(freeCapital),
                debt_surplus: 0,
                investment: 0
            },
            end_state: {
                emergency_fund_balance: Math.round(efByEndOfPhase),
                emergency_fund_months: parseFloat((efByEndOfPhase / monthlyNeeds).toFixed(1)),
                note: "Minimum payments only on all debts during this phase"
            }
        })

        // update currentEF for next phase calculation
        currentEF = efByEndOfPhase
    }

    // ── PHASE 2 ──────────────────────────────────────────────
    // Condition: EF >= 1 month AND priority debts exist
    // Goal: Clear priority debts with 70% surplus
    //       Build EF with 30% surplus simultaneously

    if (priorityDebts.length > 0 && currentEF >= efTarget1Month) {

        const debtSurplus = freeCapital * 0.70
        const efContribution = freeCapital * 0.30

        // run avalanche only on priority debts with 70% surplus
        const avalancheResult = runAvalanche(priorityDebts, debtSurplus)
        const phase2Months = avalancheResult.total_months

        // how much EF gets built during phase 2
        const efBuiltDuringPhase2 = efContribution * phase2Months
        const efByEndOfPhase2 = Math.min(
            currentEF + efBuiltDuringPhase2,
            efTarget3Month
        )

        phases.push({
            phase: 2,
            goal: "Clear priority debts while building emergency fund",
            duration_months: phase2Months,
            monthly_allocation: {
                emergency_fund: Math.round(efContribution),
                debt_surplus: Math.round(debtSurplus),
                investment: 0
            },
            avalanche_on_priority_debts: {
                total_months: avalancheResult.total_months,
                total_interest: avalancheResult.total_interest
            },
            end_state: {
                emergency_fund_balance: Math.round(efByEndOfPhase2),
                emergency_fund_months: parseFloat((efByEndOfPhase2 / monthlyNeeds).toFixed(1)),
                priority_debts_status: "cleared",
                note: "Low priority debts on minimum payments throughout"
            }
        })

        // update currentEF for next phase
        currentEF = efByEndOfPhase2
    }

    // edge case: priority debts exist but EF is still below 1 month
    // this happens if phase 1 was skipped (EF was already > 0 but < 1 month
    // and freeCapital was enough to cover it in 0 months — shouldn't happen
    // but guard it anyway)
    if (priorityDebts.length > 0 && currentEF < efTarget1Month) {

        // just run phase 2 anyway with full surplus to debt
        // since EF is close to 1 month target
        const avalancheResult = runAvalanche(priorityDebts, freeCapital * 0.70)

        phases.push({
            phase: 2,
            goal: "Clear priority debts",
            duration_months: avalancheResult.total_months,
            monthly_allocation: {
                emergency_fund: Math.round(freeCapital * 0.30),
                debt_surplus: Math.round(freeCapital * 0.70),
                investment: 0
            },
            end_state: {
                priority_debts_status: "cleared"
            }
        })

        currentEF = Math.min(
            currentEF + (freeCapital * 0.30 * avalancheResult.total_months),
            efTarget3Month
        )
    }

    // ── PHASE 3 ──────────────────────────────────────────────
    // Condition: Priority debts cleared, EF still incomplete
    // Goal: Complete emergency fund with 100% freeCapital
    // Debt: minimum payments only on low priority debts

    if (currentEF < efTarget3Month) {

        const efNeeded = efTarget3Month - currentEF
        const monthsToComplete = Math.ceil(efNeeded / freeCapital)

        phases.push({
            phase: 3,
            goal: "Complete emergency fund",
            duration_months: monthsToComplete,
            monthly_allocation: {
                emergency_fund: Math.round(freeCapital),
                debt_surplus: 0,
                investment: 0
            },
            end_state: {
                emergency_fund_balance: efTarget3Month,
                emergency_fund_months: 3,
                note: "Emergency fund fully funded. Minimum payments on low priority debts."
            }
        })

        currentEF = efTarget3Month
    }

    // ── PHASE 4 ──────────────────────────────────────────────
    // Condition: Always runs — this is the end goal
    // Goal: 100% freeCapital to investment
    // Debt: low priority debts run to natural end on minimums

    const lowPriorityNote = lowPriorityDebts.length > 0
        ? `${lowPriorityDebts.length} low priority debt(s) continue on minimum payments`
        : "Debt free — full capital invested"

    phases.push({
        phase: 4,
        goal: "Full investment mode",
        duration_months: "ongoing",
        monthly_allocation: {
            emergency_fund: 0,
            debt_surplus: 0,
            investment: Math.round(freeCapital)
        },
        end_state: {
            note: lowPriorityNote
        }
    })

    return phases
}
