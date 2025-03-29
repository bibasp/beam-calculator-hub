import { Load, BeamResult, SupportType, SupportReaction } from "./types";

// Number of points to use for diagrams
const DIAGRAM_POINTS = 100;

export const calculateBeamResults = (
  beamLength: number,
  loads: Load[],
  supports: {
    left: SupportType;
    right: SupportType;
  }
): BeamResult => {
  // Generate positions along the beam for diagram points
  const positions: number[] = [];
  for (let i = 0; i <= DIAGRAM_POINTS; i++) {
    positions.push((i / DIAGRAM_POINTS) * beamLength);
  }

  // Check for cantilever beam configuration
  const isCantileverLeft = supports.left === "fixed" && supports.right === "none";
  const isCantileverRight = supports.right === "fixed" && supports.left === "none";
  const isCantilever = isCantileverLeft || isCantileverRight;

  // Calculate support reactions
  const reactions = calculateReactions(beamLength, loads, supports);

  // Initialize arrays for forces at each position
  const shearForce: number[] = Array(positions.length).fill(0);
  const bendingMoment: number[] = Array(positions.length).fill(0);
  const axialForce: number[] = Array(positions.length).fill(0);

  // Add support reactions to forces
  for (let i = 0; i < positions.length; i++) {
    const x = positions[i];
    
    // Left support reactions (if not cantilever with right support)
    if (!isCantileverRight && x > 0) {
      // Vertical reaction affects shear
      shearForce[i] += reactions.left.vertical;
      
      // Horizontal reaction affects axial force
      axialForce[i] += reactions.left.horizontal;
      
      // Moment reaction affects bending moment
      bendingMoment[i] += reactions.left.moment;
    }
    
    // Right support reactions (if not cantilever with left support)
    if (!isCantileverLeft && x > beamLength) {
      // Vertical reaction affects shear
      shearForce[i] -= reactions.right.vertical;
      
      // Horizontal reaction affects axial force
      axialForce[i] -= reactions.right.horizontal;
      
      // Moment reaction affects bending moment
      bendingMoment[i] -= reactions.right.moment;
    }
  }

  // Apply loads to get forces at each position
  for (let i = 0; i < positions.length; i++) {
    const x = positions[i];
    
    loads.forEach(load => {
      if (load.type === "point") {
        if (x > load.position) {
          // Check if this is a horizontal component (angle = 90)
          if (load.angle === 90) {
            // Horizontal load affects axial force
            axialForce[i] += load.magnitude;
          } else {
            // Vertical or angled load affects shear force (vertical component)
            shearForce[i] -= load.magnitude;
            
            // Vertical or angled load affects bending moment
            bendingMoment[i] -= load.magnitude * (x - load.position);
          }
        }
      } else if (load.type === "distributed" && load.length) {
        const loadEnd = load.position + load.length;
        
        if (x > load.position) {
          // If position is within the distributed load
          if (x <= loadEnd) {
            const distanceFromStart = x - load.position;
            
            // Distributed load affects shear force 
            // (area of the distributed load up to this point)
            shearForce[i] -= load.magnitude * distanceFromStart;
            
            // Distributed load affects bending moment
            // (moment arm at centroid of the partial distributed load)
            bendingMoment[i] -= load.magnitude * distanceFromStart * (distanceFromStart / 2);
          } else {
            // If position is after the distributed load
            
            // Distributed load affects shear force
            // (total area of the distributed load)
            shearForce[i] -= load.magnitude * load.length;
            
            // Distributed load affects bending moment
            // (total force times distance from centroid)
            const totalForce = load.magnitude * load.length;
            const centroid = load.position + (load.length / 2);
            bendingMoment[i] -= totalForce * (x - centroid);
          }
        }
      } else if (load.type === "moment") {
        if (x > load.position) {
          // Moment load directly affects bending moment
          bendingMoment[i] -= load.magnitude;
        }
      }
    });
  }

  // Calculate bending moment from shear force (integration)
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i] - positions[i - 1];
    // Trapezoidal rule for integration
    bendingMoment[i] = bendingMoment[i - 1] + (shearForce[i] + shearForce[i - 1]) * dx / 2;
  }

  return {
    positions,
    shearForce,
    bendingMoment,
    axialForce,
    reactions
  };
};

const calculateReactions = (
  beamLength: number,
  loads: Load[],
  supports: {
    left: SupportType;
    right: SupportType;
  }
): {
  left: SupportReaction;
  right: SupportReaction;
} => {
  // For simplicity, we'll implement a basic static equilibrium calculation
  // This is a simplified version and would need to be expanded for more complex cases
  
  const leftReaction: SupportReaction = {
    vertical: 0,
    horizontal: 0,
    moment: 0
  };
  
  const rightReaction: SupportReaction = {
    vertical: 0,
    horizontal: 0,
    moment: 0
  };
  
  // Apply simple statics for equilibrium
  let totalVerticalForce = 0;
  let totalHorizontalForce = 0;
  let totalMomentAtLeft = 0;
  
  // Calculate forces from loads
  loads.forEach(load => {
    if (load.type === "point") {
      // Check if this is a horizontal component (angle = 90)
      if (load.angle === 90) {
        totalHorizontalForce += load.magnitude;
      } else {
        totalVerticalForce += load.magnitude;
        totalMomentAtLeft += load.magnitude * load.position;
      }
    } else if (load.type === "distributed" && load.length) {
      const totalForce = load.magnitude * load.length;
      totalVerticalForce += totalForce;
      
      // Moment is the force times the distance to centroid
      const centroid = load.position + (load.length / 2);
      totalMomentAtLeft += totalForce * centroid;
    } else if (load.type === "moment") {
      totalMomentAtLeft += load.magnitude;
    }
  });
  
  // Check for cantilever configuration
  const isCantileverLeft = supports.left === "fixed" && supports.right === "none";
  const isCantileverRight = supports.right === "fixed" && supports.left === "none";
  
  // Calculate reactions based on support types
  if (isCantileverLeft) {
    // Cantilever beam with fixed left support
    leftReaction.vertical = totalVerticalForce;
    leftReaction.horizontal = totalHorizontalForce;
    leftReaction.moment = totalMomentAtLeft;
  } else if (isCantileverRight) {
    // Cantilever beam with fixed right support
    rightReaction.vertical = totalVerticalForce;
    rightReaction.horizontal = totalHorizontalForce;
    rightReaction.moment = totalMomentAtLeft - (totalVerticalForce * beamLength);
  } else if (supports.left === "fixed" && supports.right === "fixed") {
    // For two fixed supports, we need to solve a more complex system
    // This is a simplified approach
    rightReaction.vertical = totalVerticalForce / 2;
    leftReaction.vertical = totalVerticalForce - rightReaction.vertical;
    
    leftReaction.moment = (totalMomentAtLeft - (rightReaction.vertical * beamLength)) / 2;
    rightReaction.moment = totalMomentAtLeft - leftReaction.moment - (leftReaction.vertical * beamLength);
    
    // Handle horizontal forces
    if (totalHorizontalForce !== 0) {
      leftReaction.horizontal = totalHorizontalForce / 2;
      rightReaction.horizontal = totalHorizontalForce - leftReaction.horizontal;
    }
  } else if (supports.left === "fixed") {
    // Right support takes some vertical load
    if (supports.right === "pinned" || supports.right === "roller") {
      rightReaction.vertical = totalMomentAtLeft / beamLength;
      leftReaction.vertical = totalVerticalForce - rightReaction.vertical;
      leftReaction.moment = totalMomentAtLeft - (rightReaction.vertical * beamLength);
      
      // All horizontal forces are taken by the fixed support
      leftReaction.horizontal = totalHorizontalForce;
    }
  } else if (supports.right === "fixed") {
    // Left support takes some vertical load
    if (supports.left === "pinned" || supports.left === "roller") {
      leftReaction.vertical = (totalMomentAtLeft - (totalVerticalForce * beamLength)) / (-beamLength);
      rightReaction.vertical = totalVerticalForce - leftReaction.vertical;
      rightReaction.moment = (leftReaction.vertical * beamLength) - totalMomentAtLeft;
      
      // All horizontal forces are taken by the fixed support
      rightReaction.horizontal = totalHorizontalForce;
    }
  } else {
    // Simple beam with pinned/roller supports
    rightReaction.vertical = totalMomentAtLeft / beamLength;
    leftReaction.vertical = totalVerticalForce - rightReaction.vertical;
    
    // Handle horizontal forces - pinned support takes all horizontal forces
    if (supports.left === "pinned") {
      leftReaction.horizontal = totalHorizontalForce;
    } else if (supports.right === "pinned") {
      rightReaction.horizontal = totalHorizontalForce;
    }
    // If both are rollers, horizontal equilibrium is not satisfied
  }
  
  return {
    left: leftReaction,
    right: rightReaction
  };
};
