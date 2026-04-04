import { weavers } from "./lib/mock-data";

const patternData = { weaveType: "ยกดอก (Yok Dok)", complexity: 50 };
const normalizedComplexity = (patternData.complexity || 50) / 10;

console.log("weavers", weavers.length);
const filtered = weavers.filter(weaver => {
  const techniqueMatch = !patternData.weaveType || 
    weaver.techniques.some(t => patternData.weaveType?.toLowerCase().includes(t.toLowerCase()));
  
  const complexityMatch = weaver.complexityLimit >= normalizedComplexity;

  console.log("Weaver: ", weaver.name);
  console.log(" - techniques:", weaver.techniques);
  console.log(" - techniqueMatch:", techniqueMatch);
  console.log(" - complexityLimit:", weaver.complexityLimit, " >= ", normalizedComplexity, complexityMatch);
  return techniqueMatch && complexityMatch;
});

console.log("Filtered Length: ", filtered.length);
