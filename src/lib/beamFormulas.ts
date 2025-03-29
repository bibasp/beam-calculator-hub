
import { FormulaDescription } from "./types";

export const BEAM_FORMULAS: Record<string, FormulaDescription> = {
  "equilibrium": {
    name: "Equilibrium Equations",
    formula: "ΣF_y = 0, ΣF_x = 0, ΣM = 0",
    description: "Static equilibrium requires that the sum of forces and moments equal zero",
    variables: [
      { symbol: "ΣF_y", meaning: "Sum of vertical forces" },
      { symbol: "ΣF_x", meaning: "Sum of horizontal forces" },
      { symbol: "ΣM", meaning: "Sum of moments about a point" }
    ]
  },
  "shearForce": {
    name: "Shear Force",
    formula: "V(x) = ∫w(x)dx",
    description: "Shear force is the integral of the distributed load function",
    variables: [
      { symbol: "V(x)", meaning: "Shear force at position x" },
      { symbol: "w(x)", meaning: "Distributed load function" }
    ]
  },
  "bendingMoment": {
    name: "Bending Moment",
    formula: "M(x) = ∫V(x)dx",
    description: "Bending moment is the integral of the shear force function",
    variables: [
      { symbol: "M(x)", meaning: "Bending moment at position x" },
      { symbol: "V(x)", meaning: "Shear force at position x" }
    ]
  },
  "pointLoad": {
    name: "Point Load Effect",
    formula: "V(x) = P · H(x - a)",
    description: "A point load P at position a causes a jump in the shear force diagram",
    variables: [
      { symbol: "P", meaning: "Magnitude of point load" },
      { symbol: "a", meaning: "Position of point load" },
      { symbol: "H(x - a)", meaning: "Heaviside step function (0 if x < a, 1 if x ≥ a)" }
    ]
  },
  "distributedLoad": {
    name: "Distributed Load Effect",
    formula: "V(x) = ∫_a^b w(x) dx",
    description: "A distributed load w(x) from position a to b affects the shear force gradually",
    variables: [
      { symbol: "w(x)", meaning: "Distributed load function" },
      { symbol: "a", meaning: "Start position of distributed load" },
      { symbol: "b", meaning: "End position of distributed load" }
    ]
  },
  "momentLoad": {
    name: "Moment Load Effect",
    formula: "M(x) = M₀ · H(x - a)",
    description: "A concentrated moment M₀ at position a causes a jump in the moment diagram",
    variables: [
      { symbol: "M₀", meaning: "Magnitude of applied moment" },
      { symbol: "a", meaning: "Position of applied moment" },
      { symbol: "H(x - a)", meaning: "Heaviside step function (0 if x < a, 1 if x ≥ a)" }
    ]
  },
  "cantilever": {
    name: "Cantilever Beam",
    formula: "R_A = P, M_A = P·L",
    description: "For a cantilever with fixed support at A and a point load P at the end",
    variables: [
      { symbol: "R_A", meaning: "Reaction force at support A" },
      { symbol: "M_A", meaning: "Moment reaction at support A" },
      { symbol: "P", meaning: "Applied load" },
      { symbol: "L", meaning: "Distance from support to load" }
    ]
  },
  "simpleBeam": {
    name: "Simple Beam (Pinned-Roller)",
    formula: "R_A = P·(L-a)/L, R_B = P·a/L",
    description: "For a simple beam with supports at A and B, and a point load P at distance a from A",
    variables: [
      { symbol: "R_A", meaning: "Reaction at support A" },
      { symbol: "R_B", meaning: "Reaction at support B" },
      { symbol: "P", meaning: "Applied load" },
      { symbol: "a", meaning: "Distance from A to load P" },
      { symbol: "L", meaning: "Total beam length" }
    ]
  },
  "fixedBeam": {
    name: "Fixed-Fixed Beam",
    formula: "M_A = P·a·b²/L², M_B = P·a²·b/L²",
    description: "For a fixed-fixed beam with a point load P at distance a from the left end",
    variables: [
      { symbol: "M_A", meaning: "Moment at left support" },
      { symbol: "M_B", meaning: "Moment at right support" },
      { symbol: "P", meaning: "Applied load" },
      { symbol: "a", meaning: "Distance from left support to load" },
      { symbol: "b", meaning: "Distance from load to right support (L-a)" },
      { symbol: "L", meaning: "Total beam length" }
    ]
  },
  "axialForce": {
    name: "Axial Force",
    formula: "N(x) = ∫q_x(x)dx",
    description: "Axial force is the integral of the horizontal distributed load function",
    variables: [
      { symbol: "N(x)", meaning: "Axial force at position x" },
      { symbol: "q_x(x)", meaning: "Horizontal distributed load function" }
    ]
  }
};

// Get relevant formulas based on beam configuration and load types
export const getRelevantFormulas = (
  supports: { left: string; right: string },
  loads: { type: string }[]
): FormulaDescription[] => {
  const formulas: FormulaDescription[] = [];
  
  // Always include the basic formulas
  formulas.push(BEAM_FORMULAS.equilibrium);
  formulas.push(BEAM_FORMULAS.shearForce);
  formulas.push(BEAM_FORMULAS.bendingMoment);
  
  // Add support-specific formulas
  if (
    (supports.left === "fixed" && supports.right === "none") ||
    (supports.left === "none" && supports.right === "fixed")
  ) {
    formulas.push(BEAM_FORMULAS.cantilever);
  } else if (
    ((supports.left === "pinned" || supports.left === "roller") &&
     (supports.right === "pinned" || supports.right === "roller"))
  ) {
    formulas.push(BEAM_FORMULAS.simpleBeam);
  } else if (supports.left === "fixed" && supports.right === "fixed") {
    formulas.push(BEAM_FORMULAS.fixedBeam);
  }
  
  // Add load-specific formulas
  const hasPointLoad = loads.some(load => load.type === "point");
  const hasDistributedLoad = loads.some(load => load.type === "distributed");
  const hasMomentLoad = loads.some(load => load.type === "moment");
  
  if (hasPointLoad) {
    formulas.push(BEAM_FORMULAS.pointLoad);
  }
  
  if (hasDistributedLoad) {
    formulas.push(BEAM_FORMULAS.distributedLoad);
  }
  
  if (hasMomentLoad) {
    formulas.push(BEAM_FORMULAS.momentLoad);
  }
  
  // If there are horizontal forces, include axial force formula
  const hasHorizontalForces = loads.some(load => 
    load.type === "point" && load.angle && load.angle > 0
  );
  
  if (hasHorizontalForces) {
    formulas.push(BEAM_FORMULAS.axialForce);
  }
  
  return formulas;
};
