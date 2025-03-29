
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Load } from "@/lib/types";

interface LoadsListProps {
  loads: Load[];
  removeLoad: (index: number) => void;
}

const LoadsList = ({ loads, removeLoad }: LoadsListProps) => {
  if (loads.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>No loads added yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Position</th>
            <th className="px-3 py-2 text-left">Value</th>
            <th className="px-3 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {loads.map((load, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-3 py-2 capitalize">
                {load.type}
              </td>
              <td className="px-3 py-2">
                {load.position}m
                {load.type === "distributed" && load.length && 
                  ` to ${load.position + load.length}m`
                }
              </td>
              <td className="px-3 py-2">
                {load.magnitude}
                {load.type === "moment" ? "kNm" : 
                  load.type === "distributed" ? "kN/m" : "kN"}
              </td>
              <td className="px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLoad(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoadsList;
