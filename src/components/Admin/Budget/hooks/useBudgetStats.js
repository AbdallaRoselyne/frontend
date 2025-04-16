import { useMemo } from "react";

export const useBudgetStats = (projects) => {
  return useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (parseFloat(p.budgetSpent) || 0), 0);
    const totalHours = projects.reduce((sum, p) => sum + (parseFloat(p.hours) || 0), 0);
    const totalLogged = projects.reduce((sum, p) => sum + (parseFloat(p.hoursLogged) || 0), 0);
    const remainingBudget = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      totalHours,
      totalLogged,
      remainingBudget,
      budgetSpentPercentage: (totalSpent / totalBudget) * 100 || 0,
      hoursLoggedPercentage: (totalLogged / totalHours) * 100 || 0,
    };
  }, [projects]);
};