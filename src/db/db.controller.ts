import type { onboardingData } from "../auth/onboardingController.ts";
import sql from "../utils/db.ts";


export const checkUser = async (id: string) => {
  return await sql`SELECT * FROM PUBLIC.USERS WHERE uid=${id}`;
};

export const createUser = async (
  id: string,
  name: string,
  email: string,
  picture: string,
) => {
  return await sql`INSERT INTO PUBLIC.USERS (uid, name, email, picture) VALUES (${id}, ${name}, ${email}, ${picture})`;
};

export const onboardingWrite = async (payload: onboardingData) => {
  return await sql`INSERT INTO PUBLIC.PROFILE(uid, income, needs, misc, wants, emergency_fund, risk_profile, debts) VALUES (${payload.uid}, ${payload.monthlyIncome}, ${payload.monthlyNeeds}, ${payload.miscNeeds}, ${payload.monthlyWants}, ${payload.emergencyFund}, ${payload.riskProfile})`;
};
