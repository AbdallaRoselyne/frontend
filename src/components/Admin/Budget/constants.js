export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const departments = ["LEED", "BIM", "MEP", "Architecture", "Structural"];

export const stages = [
  "Preparation",
  "Concept Design",
  "Development",
  "Technical Design",
  "Construction",
  "Completion"
];

export const projectFields = [
  { label: "Project Code", name: "code", type: "text" },
  { label: "Project Name", name: "name", type: "text" },
  { label: "Budget ($)", name: "budget", type: "number" },
  { label: "Estimated Hours", name: "hours", type: "number" },
  { label: "Team Leader", name: "teamLeader", type: "text" },
  { label: "Director", name: "director", type: "text" },
];