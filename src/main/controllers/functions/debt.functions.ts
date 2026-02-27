export type Debt = {
    uid: string,
    debt_name: string,
    debt_type: string,
    principle: number,
    outstanding: number,
    annualinterest: number,
    tenure: number,
    emi: number,
}

export const fixedLoan:any = (debt: Debt)=>{
    const r = (Number(debt.annualinterest)/100)/12;
    const n = Number(debt.tenure)*12;
    const emi = Number(debt.outstanding)*((r*((1+r)**n))/(((1+r)**n)-1));

    const totalInterest = (emi*n)-debt.outstanding;

    return {emi, totalInterest}
}

export const flexibleLoan:any = (debt: Debt)=>{

    let months = 0;
    let interest;
    let principle = Number(debt.outstanding);
    let monthlyRate = (Number(debt.annualinterest)/100)/12;
    let EMI = Number(debt.emi);
    let totalInterest = 0;

    if(!EMI){
        return
    }

    while(principle > 0.1){
        interest = principle*monthlyRate;
        let principle_paid = EMI - interest;
        principle = principle - principle_paid;

        months++;
        totalInterest = totalInterest+interest;
    }

    return {totalInterest, months}
}

export const runAvalanche = (debts: Debt[], extraSurplus: number) => {
    
    let remaining = debts
        .map(d => ({ ...d, balance: Number(d.outstanding) }))
        .sort((a, b) => Number(b.annualinterest) - Number(a.annualinterest))

    let month = 0
    let totalInterest = 0

    while (remaining.some(d => d.balance > 0.01)) {
        month++

        remaining = remaining.map(d => {
            const monthlyRate = (Number(d.annualinterest) / 100) / 12
            const interest = d.balance * monthlyRate
            totalInterest += interest
            return { ...d, balance: d.balance + interest }
        })

        remaining = remaining.map(d => {
            const payment = Math.min(Number(d.emi), d.balance)
            return { ...d, balance: d.balance - payment }
        })

        let surplus = extraSurplus
        for (let d of remaining) {
            if (d.balance <= 0.01) continue
            const extra = Math.min(surplus, d.balance)
            d.balance -= extra
            surplus -= extra
            break
        }

        remaining = remaining.filter(d => d.balance > 0.01)
    }

    return {
        total_months: month,
        total_interest: Math.round(totalInterest)
    }
}

export const runSnowball = (debts: Debt[], extraSurplus: number) => {
    
    let remaining = debts
        .map(d => ({ ...d, balance: Number(d.outstanding) }))
        .sort((a, b) => Number(a.outstanding) - Number(b.outstanding))

    let month = 0
    let totalInterest = 0

    while (remaining.some(d => d.balance > 0.01)) {
        month++

        remaining = remaining.map(d => {
            const monthlyRate = (Number(d.annualinterest) / 100) / 12
            const interest = d.balance * monthlyRate
            totalInterest += interest
            return { ...d, balance: d.balance + interest }
        })

        remaining = remaining.map(d => {
            const payment = Math.min(Number(d.emi), d.balance)
            return { ...d, balance: d.balance - payment }
        })

        let surplus = extraSurplus
        for (let d of remaining) {
            if (d.balance <= 0.01) continue
            const extra = Math.min(surplus, d.balance)
            d.balance -= extra
            surplus -= extra
            break
        }

        remaining = remaining.filter(d => d.balance > 0.01)
    }

    return {
        total_months: month,
        total_interest: Math.round(totalInterest)
    }
}
