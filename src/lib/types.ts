
export type LoadType = "point" | "distributed" | "moment";
export type SupportType = "fixed" | "pinned" | "roller";
export type DiagramType = "SFD" | "BMD" | "AFD";

export interface Load {
  type: LoadType;
  position: number;
  magnitude: number;
  length?: number; // For distributed loads
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
