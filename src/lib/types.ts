
export type LoadType = "point" | "distributed" | "moment";
export type SupportType = "fixed" | "pinned" | "roller";
export type DiagramType = "SFD" | "BMD" | "AFD";

export interface Load {
  type: LoadType;
  position: number;
  magnitude: number;
  length?: number; // For distributed loads
  angle?: number;  // For angular point loads (in degrees, 0 = vertical downward)
  visible?: boolean; // To toggle visibility of loads
}

export interface SupportReaction {
  vertical: number;
  horizontal: number;
  moment: number;
}

export interface BeamResult {
  positions: number[];
  shearForce: number[];
  bendingMoment: number[];
  axialForce: number[];
  reactions: {
    left: SupportReaction;
    right: SupportReaction;
  };
}
