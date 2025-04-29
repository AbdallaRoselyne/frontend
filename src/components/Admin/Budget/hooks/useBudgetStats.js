import { useMemo } from "react";

export const useBudgetStats = (projects = []) => {
  return useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    
    const totalBudget = safeProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    const totalSpent = safeProjects.reduce((sum, p) => sum + (parseFloat(p.budgetSpent) || 0), 0);
    const totalHours = safeProjects.reduce((sum, p) => sum + (parseFloat(p.hours) || 0), 0);
    const totalLogged = safeProjects.reduce((sum, p) => sum + (parseFloat(p.hoursLogged) || 0), 0);
    const remainingBudget = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      totalHours,
      totalLogged,
      remainingBudget,
      budgetSpentPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      hoursLoggedPercentage: totalHours > 0 ? (totalLogged / totalHours) * 100 : 0,
    };
  }, [projects]);
};