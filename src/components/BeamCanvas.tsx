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
      if (type === "none") return; // Don't draw anything for no support
      
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
      } else if (type === "cantilever") {
        // Draw fixed support the same as fixed
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
      }
    };
    
    // Special handling for cantilever beam
    const isCantileverLeft = supports.left === "fixed" && supports.right === "none";
    const isCantileverRight = supports.right === "fixed" && supports.left === "none";

    // Draw the appropriate cantilever end if needed
    if (isCantileverLeft) {
      // Draw a small diagonal line at the free end (right)
      const freeEndX = padding + beamWidth;
      ctx.beginPath();
      ctx.moveTo(freeEndX, beamY - 10);
      ctx.lineTo(freeEndX + 5, beamY);
      ctx.lineTo(freeEndX, beamY + 10);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (isCantileverRight) {
      // Draw a small diagonal line at the free end (left)
      const freeEndX = padding;
      ctx.beginPath();
      ctx.moveTo(freeEndX, beamY - 10);
      ctx.lineTo(freeEndX - 5, beamY);
      ctx.lineTo(freeEndX, beamY + 10);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    drawSupport("left", supports.left);
    drawSupport("right", supports.right);
    
    // Draw loads
    loads.forEach(load => {
      // Skip if load is not visible
      if (load.visible === false) return;
      
      const x = padding + (load.position * scale);
      
      if (load.type === "point") {
        // Get angle in radians (default 0 = vertical downward)
        const angleRad = ((load.angle || 0) * Math.PI) / 180;
        
        // Calculate arrow length and end point
        const arrowLength = 40;
        const arrowEndX = x + arrowLength * Math.sin(angleRad);
        const arrowEndY = beamY - 10 - arrowLength * Math.cos(angleRad);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(x, beamY - 10);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#e11d48";
        ctx.stroke();
        
        // Calculate arrow head points
        const headSize = 10;
        const headAngle = Math.PI / 6; // 30 degrees
        
        // Arrow direction angle (pointing toward the beam)
        const arrowAngle = angleRad + Math.PI;
        
        // Arrow head left point
        const headLeftX = arrowEndX + headSize * Math.cos(arrowAngle - headAngle);
        const headLeftY = arrowEndY + headSize * Math.sin(arrowAngle - headAngle);
        
        // Arrow head right point
        const headRightX = arrowEndX + headSize * Math.cos(arrowAngle + headAngle);
        const headRightY = arrowEndY + headSize * Math.sin(arrowAngle + headAngle);
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(headLeftX, headLeftY);
        ctx.lineTo(headRightX, headRightY);
        ctx.closePath();
        ctx.fillStyle = "#e11d48";
        ctx.fill();
        
        // Draw value with correct angle
        ctx.font = "12px Arial";
        ctx.fillStyle = "#e11d48";
        ctx.textAlign = "center";
        
        // Position the text slightly away from the arrow end
        const textOffset = 15;
        const textX = arrowEndX + textOffset * Math.sin(angleRad);
        const textY = arrowEndY - textOffset * Math.cos(angleRad);
        
        let angleText = "";
        if (load.angle && load.angle !== 0) {
          angleText = ` (${load.angle}°)`;
        }
        
        ctx.fillText(`${load.magnitude}kN${angleText}`, textX, textY);
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
          
          // Draw arrowhead - now pointing downward
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
