
import { useEffect, useRef } from "react";
import { Load, SupportType } from "@/lib/types";

interface BeamCanvasProps {
  beamLength: number;
  loads: Load[];
  supports: {
    left: SupportType;
    right: SupportType;
  };
}

const BeamCanvas = ({ beamLength, loads, supports }: BeamCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions and scaling
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const padding = 50;
    const beamY = canvasHeight / 2;
    const beamWidth = canvasWidth - (padding * 2);
    const scale = beamWidth / beamLength;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw beam
    ctx.beginPath();
    ctx.moveTo(padding, beamY);
    ctx.lineTo(padding + beamWidth, beamY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0f172a";
    ctx.stroke();
    
    // Draw measurement tick marks
    ctx.font = "12px Arial";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    
    for (let i = 0; i <= beamLength; i++) {
      const x = padding + (i * scale);
      ctx.beginPath();
      ctx.moveTo(x, beamY);
      ctx.lineTo(x, beamY + 10);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#64748b";
      ctx.stroke();
      
      ctx.fillText(`${i}m`, x, beamY + 25);
    }
    
    // Draw supports
    const drawSupport = (position: "left" | "right", type: SupportType) => {
      const x = position === "left" ? padding : padding + beamWidth;
      
      if (type === "fixed") {
        // Draw fixed support
        ctx.beginPath();
        ctx.moveTo(position === "left" ? x : x - 20, beamY - 20);
        ctx.lineTo(position === "left" ? x : x - 20, beamY + 20);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#2563eb";
        ctx.stroke();
        
        // Draw multiple small lines
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(position === "left" ? x : x - 20, beamY - 15 + (i * 8));
          ctx.lineTo(position === "left" ? x + 10 : x - 10, beamY - 15 + (i * 8));
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#2563eb";
          ctx.stroke();
        }
      } else if (type === "pinned") {
        // Draw pinned support (triangle)
        ctx.beginPath();
        ctx.moveTo(x, beamY);
        ctx.lineTo(position === "left" ? x - 15 : x + 15, beamY + 20);
        ctx.lineTo(position === "left" ? x + 15 : x - 15, beamY + 20);
        ctx.closePath();
        ctx.fillStyle = "#2563eb";
        ctx.fill();
      } else if (type === "roller") {
        // Draw roller support (triangle with circles)
        ctx.beginPath();
        ctx.moveTo(x, beamY);
        ctx.lineTo(position === "left" ? x - 15 : x + 15, beamY + 15);
        ctx.lineTo(position === "left" ? x + 15 : x - 15, beamY + 15);
        ctx.closePath();
        ctx.fillStyle = "#2563eb";
        ctx.fill();
        
        // Draw circles
        const cx1 = position === "left" ? x - 7 : x + 7;
        const cx2 = position === "left" ? x + 7 : x - 7;
        
        ctx.beginPath();
        ctx.arc(cx1, beamY + 20, 5, 0, Math.PI * 2);
        ctx.arc(cx2, beamY + 20, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
      }
    };
    
    drawSupport("left", supports.left);
    drawSupport("right", supports.right);
    
    // Draw loads
    loads.forEach(load => {
      const x = padding + (load.position * scale);
      
      if (load.type === "point") {
        // Draw point load
        ctx.beginPath();
        ctx.moveTo(x, beamY - 10);
        ctx.lineTo(x, beamY - 40);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#e11d48";
        ctx.stroke();
        
        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(x - 10, beamY - 30);
        ctx.lineTo(x, beamY - 40);
        ctx.lineTo(x + 10, beamY - 30);
        ctx.fillStyle = "#e11d48";
        ctx.fill();
        
        // Draw value
        ctx.font = "12px Arial";
        ctx.fillStyle = "#e11d48";
        ctx.textAlign = "center";
        ctx.fillText(`${load.magnitude}kN`, x, beamY - 50);
      } else if (load.type === "distributed") {
        const endX = padding + ((load.position + (load.length || 0)) * scale);
        
        // Draw distributed load
        ctx.beginPath();
        ctx.moveTo(x, beamY - 10);
        ctx.lineTo(x, beamY - 30);
        ctx.lineTo(endX, beamY - 30);
        ctx.lineTo(endX, beamY - 10);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#e11d48";
        ctx.stroke();
        
        // Fill the distributed load area
        ctx.fillStyle = "rgba(225, 29, 72, 0.2)";
        ctx.fill();
        
        // Draw arrows
        const arrowCount = Math.max(2, Math.floor((endX - x) / 30));
        const arrowSpacing = (endX - x) / (arrowCount - 1);
        
        for (let i = 0; i < arrowCount; i++) {
          const arrowX = x + (i * arrowSpacing);
          
          ctx.beginPath();
          ctx.moveTo(arrowX, beamY - 30);
          ctx.lineTo(arrowX, beamY - 10);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#e11d48";
          ctx.stroke();
          
          // Draw arrowhead
          ctx.beginPath();
          ctx.moveTo(arrowX - 5, beamY - 20);
          ctx.lineTo(arrowX, beamY - 10);
          ctx.lineTo(arrowX + 5, beamY - 20);
          ctx.fillStyle = "#e11d48";
          ctx.fill();
        }
        
        // Draw value
        ctx.font = "12px Arial";
        ctx.fillStyle = "#e11d48";
        ctx.textAlign = "center";
        ctx.fillText(`${load.magnitude}kN/m`, (x + endX) / 2, beamY - 40);
      } else if (load.type === "moment") {
        // Draw moment
        ctx.beginPath();
        ctx.arc(x, beamY, 20, 0, Math.PI * 1.5);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#7c3aed";
        ctx.stroke();
        
        // Draw arrowhead
        const arrowX = x + 20 * Math.cos(Math.PI * 1.5);
        const arrowY = beamY + 20 * Math.sin(Math.PI * 1.5);
        
        ctx.beginPath();
        ctx.moveTo(arrowX - 5, arrowY - 5);
        ctx.lineTo(arrowX, arrowY);
        ctx.lineTo(arrowX + 5, arrowY + 5);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#7c3aed";
        ctx.stroke();
        
        // Draw value
        ctx.font = "12px Arial";
        ctx.fillStyle = "#7c3aed";
        ctx.textAlign = "center";
        ctx.fillText(`${load.magnitude}kNm`, x, beamY - 30);
      }
    });
    
  }, [beamLength, loads, supports]);
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-3">Beam Configuration</h3>
      <div className="border rounded-md p-2 bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

export default BeamCanvas;
