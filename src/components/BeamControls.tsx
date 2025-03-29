
import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Load, SupportType, LoadType } from "@/lib/types";

interface BeamControlsProps {
  beamLength: number;
  setBeamLength: (length: number) => void;
  addLoad: (load: Load) => void;
  supports: {
    left: SupportType;
    right: SupportType;
  };
  updateSupports: (leftSupport: SupportType, rightSupport: SupportType) => void;
}

const BeamControls = ({
  beamLength,
  setBeamLength,
  addLoad,
  supports,
  updateSupports
}: BeamControlsProps) => {
  const [loadType, setLoadType] = useState<LoadType>("point");
  const [loadPosition, setLoadPosition] = useState<number>(0);
  const [loadMagnitude, setLoadMagnitude] = useState<number>(10);
  const [loadLength, setLoadLength] = useState<number>(2);
  const [loadAngle, setLoadAngle] = useState<number>(0); // 0 degrees = downward

  const handleBeamLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value > 0) {
      setBeamLength(value);
    }
  };

  const handleAddLoad = () => {
    const newLoad: Load = {
      type: loadType,
      position: loadPosition,
      magnitude: loadMagnitude,
      visible: true // New loads are visible by default
    };

    if (loadType === "distributed") {
      newLoad.length = loadLength;
    }
    
    if (loadType === "point") {
      newLoad.angle = loadAngle;
    }

    addLoad(newLoad);
  };

  const handleSupportChange = (position: "left" | "right", value: string) => {
    const supportType = value as SupportType;
    if (position === "left") {
      updateSupports(supportType, supports.right);
    } else {
      updateSupports(supports.left, supportType);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Beam Properties</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beamLength">Beam Length (m)</Label>
            <Input
              id="beamLength"
              type="number"
              min={1}
              step={0.5}
              value={beamLength}
              onChange={handleBeamLengthChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leftSupport">Left Support</Label>
            <Select 
              value={supports.left} 
              onValueChange={(value) => handleSupportChange("left", value)}
            >
              <SelectTrigger id="leftSupport">
                <SelectValue placeholder="Select support type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="pinned">Pinned</SelectItem>
                <SelectItem value="roller">Roller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Units</Label>
            <div className="bg-gray-100 p-2 rounded text-sm">kN, m, kNm</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rightSupport">Right Support</Label>
            <Select 
              value={supports.right} 
              onValueChange={(value) => handleSupportChange("right", value)}
            >
              <SelectTrigger id="rightSupport">
                <SelectValue placeholder="Select support type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="pinned">Pinned</SelectItem>
                <SelectItem value="roller">Roller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Add Load</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loadType">Load Type</Label>
              <Select 
                value={loadType} 
                onValueChange={(value) => setLoadType(value as LoadType)}
              >
                <SelectTrigger id="loadType">
                  <SelectValue placeholder="Select load type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="point">Point Load</SelectItem>
                  <SelectItem value="distributed">Distributed Load</SelectItem>
                  <SelectItem value="moment">Moment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loadPosition">Position (m)</Label>
              <Input
                id="loadPosition"
                type="number"
                min={0}
                max={beamLength}
                step={0.1}
                value={loadPosition}
                onChange={(e) => setLoadPosition(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loadMagnitude">
                Magnitude ({loadType === "moment" ? "kNm" : loadType === "distributed" ? "kN/m" : "kN"})
              </Label>
              <Input
                id="loadMagnitude"
                type="number"
                step={0.1}
                value={loadMagnitude}
                onChange={(e) => setLoadMagnitude(parseFloat(e.target.value))}
              />
            </div>
            
            {loadType === "distributed" && (
              <div className="space-y-2">
                <Label htmlFor="loadLength">Length (m)</Label>
                <Input
                  id="loadLength"
                  type="number"
                  min={0.1}
                  max={beamLength - loadPosition}
                  step={0.1}
                  value={loadLength}
                  onChange={(e) => setLoadLength(parseFloat(e.target.value))}
                />
              </div>
            )}
            
            {loadType === "point" && (
              <div className="space-y-2">
                <Label htmlFor="loadAngle">Angle (degrees)</Label>
                <Input
                  id="loadAngle"
                  type="number"
                  min={-90}
                  max={90}
                  step={5}
                  value={loadAngle}
                  onChange={(e) => setLoadAngle(parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500">0° = downward, ±90° = horizontal</p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleAddLoad} 
            className="w-full"
            variant="default"
          >
            Add Load
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BeamControls;
