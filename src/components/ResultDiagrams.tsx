
import { useEffect, useRef } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BeamResult, DiagramType } from "@/lib/types";

interface ResultDiagramsProps {
  results: BeamResult;
  selectedDiagram: DiagramType;
  setSelectedDiagram: (type: DiagramType) => void;
}

const ResultDiagrams = ({ 
  results, 
  selectedDiagram, 
  setSelectedDiagram 
}: ResultDiagramsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !results) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const padding = { left: 60, right: 20, top: 30, bottom: 40 };
    const graphWidth = canvasWidth - padding.left - padding.right;
    const graphHeight = canvasHeight - padding.top - padding.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Determine which data to display
    let diagramData: number[] = [];
    let maxValue = 0;
    let minValue = 0;
    let title = "";
    let yAxisLabel = "";
    
    if (selectedDiagram === "SFD") {
      diagramData = results.shearForce;
      title = "Shear Force Diagram";
      yAxisLabel = "Shear Force (kN)";
    } else if (selectedDiagram === "BMD") {
      diagramData = results.bendingMoment;
      title = "Bending Moment Diagram";
      yAxisLabel = "Bending Moment (kNm)";
    } else if (selectedDiagram === "AFD") {
      diagramData = results.axialForce;
      title = "Axial Force Diagram";
      yAxisLabel = "Axial Force (kN)";
    }
    
    // Calculate min and max values for scaling
    maxValue = Math.max(...diagramData, 0);
    minValue = Math.min(...diagramData, 0);
    
    // Add 10% padding to the min/max for better visualization
    const valueRange = Math.max(Math.abs(maxValue), Math.abs(minValue)) * 1.1;
    maxValue = valueRange;
    minValue = -valueRange;
    
    // Draw title
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.fillText(title, canvasWidth / 2, padding.top / 2);
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvasHeight - padding.bottom);
    ctx.lineTo(canvasWidth - padding.right, canvasHeight - padding.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();
    
    // Draw zero line if min and max values have different signs
    if (minValue < 0 && maxValue > 0) {
      const zeroY = padding.top + (graphHeight * (maxValue / (maxValue - minValue)));
      
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(canvasWidth - padding.right, zeroY);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#94a3b8";
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw y-axis labels
    ctx.font = "12px Arial";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    
    const yAxisSteps = 5;
    for (let i = 0; i <= yAxisSteps; i++) {
      const value = minValue + ((maxValue - minValue) * (i / yAxisSteps));
      const y = padding.top + (graphHeight - (graphHeight * (i / yAxisSteps)));
      
      ctx.fillText(value.toFixed(1), padding.left - 10, y + 4);
      
      // Draw horizontal grid line
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvasWidth - padding.right, y);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#e2e8f0";
      ctx.stroke();
    }
    
    // Draw y-axis label
    ctx.save();
    ctx.translate(padding.left - 40, padding.top + (graphHeight / 2));
    ctx.rotate(-Math.PI / 2);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.fillText(yAxisLabel, 0, 0);
    ctx.restore();
    
    // Draw x-axis labels
    ctx.font = "12px Arial";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    
    const xAxisLabelCount = Math.min(10, results.positions.length);
    for (let i = 0; i < xAxisLabelCount; i++) {
      const index = Math.floor((i / (xAxisLabelCount - 1)) * (results.positions.length - 1));
      const position = results.positions[index];
      const x = padding.left + (graphWidth * (index / (results.positions.length - 1)));
      
      ctx.fillText(position.toFixed(1) + "m", x, canvasHeight - padding.bottom + 20);
      
      // Draw vertical grid line
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, canvasHeight - padding.bottom);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#e2e8f0";
      ctx.stroke();
    }
    
    // Draw the diagram
    ctx.beginPath();
    const scaleY = graphHeight / (maxValue - minValue);
    
    // Move to first point
    const startX = padding.left;
    const startY = padding.top + graphHeight - ((diagramData[0] - minValue) * scaleY);
    ctx.moveTo(startX, startY);
    
    // Draw lines to each data point
    for (let i = 1; i < diagramData.length; i++) {
      const x = padding.left + (graphWidth * (i / (diagramData.length - 1)));
      const y = padding.top + graphHeight - ((diagramData[i] - minValue) * scaleY);
      ctx.lineTo(x, y);
    }
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = selectedDiagram === "SFD" ? "#2563eb" : 
                     selectedDiagram === "BMD" ? "#9333ea" : "#f59e0b";
    ctx.stroke();
    
    // Fill area between curve and x-axis
    const endX = padding.left + graphWidth;
    const endY = padding.top + graphHeight - ((diagramData[diagramData.length - 1] - minValue) * scaleY);
    const zeroY = padding.top + graphHeight - ((0 - minValue) * scaleY);
    
    ctx.lineTo(endX, zeroY);
    ctx.lineTo(startX, zeroY);
    ctx.closePath();
    
    ctx.fillStyle = selectedDiagram === "SFD" ? "rgba(37, 99, 235, 0.1)" : 
                   selectedDiagram === "BMD" ? "rgba(147, 51, 234, 0.1)" : "rgba(245, 158, 11, 0.1)";
    ctx.fill();
    
  }, [results, selectedDiagram]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Force Diagrams</h3>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="diagramType">Diagram Type:</Label>
          <Select 
            value={selectedDiagram} 
            onValueChange={(value) => setSelectedDiagram(value as DiagramType)}
          >
            <SelectTrigger id="diagramType" className="w-[180px]">
              <SelectValue placeholder="Select diagram" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SFD">Shear Force (SFD)</SelectItem>
              <SelectItem value="BMD">Bending Moment (BMD)</SelectItem>
              <SelectItem value="AFD">Axial Force (AFD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md p-2 bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default ResultDiagrams;
