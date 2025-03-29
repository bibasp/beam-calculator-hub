
import { Load } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface LoadsListProps {
  loads: Load[];
  removeLoad: (index: number) => void;
  toggleLoadVisibility: (index: number) => void;
}

const LoadsList = ({ loads, removeLoad, toggleLoadVisibility }: LoadsListProps) => {
  const getLoadDescription = (load: Load) => {
    if (load.type === "point") {
      let angleInfo = "";
      if (load.angle && load.angle !== 0) {
        angleInfo = ` at ${load.angle}°`;
      }
      return `${load.magnitude} kN${angleInfo} at ${load.position}m`;
    } else if (load.type === "distributed") {
      return `${load.magnitude} kN/m × ${load.length}m at ${load.position}m`;
    } else {
      return `${load.magnitude} kNm at ${load.position}m`;
    }
  };

  const getLoadTypeLabel = (type: Load["type"]) => {
    if (type === "point") return "Point Load";
    if (type === "distributed") return "Distributed Load";
    return "Moment";
  };
  
  const getLoadColor = (type: Load["type"]) => {
    if (type === "point") return "bg-red-100 text-red-800";
    if (type === "distributed") return "bg-orange-100 text-orange-800";
    return "bg-purple-100 text-purple-800";
  };

  return (
    <div className="space-y-2">
      {loads.length === 0 ? (
        <p className="text-gray-500 text-sm">No loads added yet</p>
      ) : (
        <ul className="space-y-2">
          {loads.map((load, index) => (
            <li key={index} className="flex items-center gap-3 p-2 border rounded-md">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`load-${index}`}
                  checked={load.visible !== false}
                  onCheckedChange={() => toggleLoadVisibility(index)}
                />
                <div className={`flex-1 ${load.visible === false ? "opacity-50" : ""}`}>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getLoadColor(load.type)}`}>
                    {getLoadTypeLabel(load.type)}
                  </span>
                  <p className="text-sm">{getLoadDescription(load)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLoad(index)}
                className="ml-auto h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LoadsList;
