
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
import { Check, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // New states for temporary values
  const [tempBeamLength, setTempBeamLength] = useState<number>(beamLength);
  const [tempSupports, setTempSupports] = useState<{
    left: SupportType;
    right: SupportType;
  }>(supports);
  
  // State to track if we're in cantilever mode
  const [beamType, setBeamType] = useState<"regular" | "cantilever-left" | "cantilever-right">(
    supports.left === "cantilever" || supports.right === "none" ? "cantilever-left" :
    supports.right === "cantilever" || supports.left === "none" ? "cantilever-right" : "regular"
  );

  const handleBeamLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value > 0) {
      setTempBeamLength(value);
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
      setTempSupports({ ...tempSupports, left: supportType });
    } else {
      setTempSupports({ ...tempSupports, right: supportType });
    }
  };

  // New function to apply beam settings
  const applyBeamSettings = () => {
    let leftSupport = tempSupports.left;
    let rightSupport = tempSupports.right;
    
    // Update supports based on beam type
    if (beamType === "cantilever-left") {
      leftSupport = "fixed";
      rightSupport = "none";
    } else if (beamType === "cantilever-right") {
      leftSupport = "none";
      rightSupport = "fixed";
    }
    
    setBeamLength(tempBeamLength);
    updateSupports(leftSupport, rightSupport);
  };

  // Function to handle beam type change
  const handleBeamTypeChange = (type: "regular" | "cantilever-left" | "cantilever-right") => {
    setBeamType(type);
    
    // Update temp supports based on beam type
    if (type === "cantilever-left") {
      setTempSupports({ left: "fixed", right: "none" });
    } else if (type === "cantilever-right") {
      setTempSupports({ left: "none", right: "fixed" });
    } else {
      // If switching from cantilever to regular, set default supports
      if (beamType !== "regular") {
        setTempSupports({ left: "fixed", right: "roller" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Beam Properties</h3>
        
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="beamType">Beam Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={beamType === "regular" ? "default" : "outline"}
                onClick={() => handleBeamTypeChange("regular")}
                className="w-full"
              >
                Regular
              </Button>
              
              <Button
                variant={beamType === "cantilever-left" ? "default" : "outline"}
                onClick={() => handleBeamTypeChange("cantilever-left")}
                className="w-full"
              >
                Cantilever (Left)
              </Button>
              
              <Button
                variant={beamType === "cantilever-right" ? "default" : "outline"}
                onClick={() => handleBeamTypeChange("cantilever-right")}
                className="w-full"
              >
                Cantilever (Right)
              </Button>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    <span>What's a cantilever?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A cantilever beam is fixed at only one end, with the other end completely free.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beamLength">Beam Length (m)</Label>
            <Input
              id="beamLength"
              type="number"
              min={1}
              step={0.5}
              value={tempBeamLength}
              onChange={handleBeamLengthChange}
            />
          </div>
          
          {beamType === "regular" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="leftSupport">Left Support</Label>
                <Select 
                  value={tempSupports.left} 
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
                  value={tempSupports.right} 
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
            </>
          )}
          
          {beamType !== "regular" && (
            <div className="space-y-2">
              <Label>Support Configuration</Label>
              <div className="bg-gray-100 p-2 rounded text-sm">
                {beamType === "cantilever-left" 
                  ? "Fixed support on left, free end on right" 
                  : "Free end on left, fixed support on right"}
              </div>
            </div>
          )}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={applyBeamSettings} 
                className="w-full mt-4"
                variant="default"
              >
                <Check className="mr-2 h-4 w-4" /> Apply Beam Settings
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Apply beam length and support changes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleAddLoad} 
                  className="w-full"
                  variant="default"
                >
                  <Check className="mr-2 h-4 w-4" /> Add Load
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add this load to the beam</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default BeamControls;
