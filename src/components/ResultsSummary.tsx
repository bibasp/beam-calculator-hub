
import { BeamResult, Load, SupportType } from "@/lib/types";
import { getRelevantFormulas } from "@/lib/beamFormulas";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import FormulaDisplay from "./FormulaDisplay";

interface ResultsSummaryProps {
  results: BeamResult;
  loads: Load[];
  supports: {
    left: SupportType;
    right: SupportType;
  };
}

const ResultsSummary = ({ results, loads, supports }: ResultsSummaryProps) => {
  // Find maximum values and their positions
  const findMaxAndPosition = (data: number[], positions: number[]) => {
    let maxIndex = 0;
    let maxValue = Math.abs(data[0]);
    
    for (let i = 1; i < data.length; i++) {
      const absValue = Math.abs(data[i]);
      if (absValue > maxValue) {
        maxValue = absValue;
        maxIndex = i;
      }
    }
    
    return {
      value: data[maxIndex],
      position: positions[maxIndex]
    };
  };
  
  const maxShear = findMaxAndPosition(results.shearForce, results.positions);
  const maxMoment = findMaxAndPosition(results.bendingMoment, results.positions);
  const maxAxial = findMaxAndPosition(results.axialForce, results.positions);
  
  // Get relevant formulas for the current beam configuration
  const relevantFormulas = getRelevantFormulas(supports, loads);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Results Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <h4 className="text-blue-800 font-medium mb-2">Maximum Shear Force</h4>
          <p className="text-2xl font-semibold text-blue-700">{maxShear.value.toFixed(2)} kN</p>
          <p className="text-sm text-blue-600 mt-1">at position {maxShear.position.toFixed(2)} m</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-100 rounded-md p-4">
          <h4 className="text-purple-800 font-medium mb-2">Maximum Bending Moment</h4>
          <p className="text-2xl font-semibold text-purple-700">{maxMoment.value.toFixed(2)} kNm</p>
          <p className="text-sm text-purple-600 mt-1">at position {maxMoment.position.toFixed(2)} m</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
          <h4 className="text-amber-800 font-medium mb-2">Maximum Axial Force</h4>
          <p className="text-2xl font-semibold text-amber-700">{maxAxial.value.toFixed(2)} kN</p>
          <p className="text-sm text-amber-600 mt-1">at position {maxAxial.position.toFixed(2)} m</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-lg font-medium mb-2">Support Reactions</h4>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Support</th>
                <th className="px-4 py-2 text-left">Vertical Reaction (kN)</th>
                <th className="px-4 py-2 text-left">Horizontal Reaction (kN)</th>
                <th className="px-4 py-2 text-left">Moment Reaction (kNm)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-medium">Left Support</td>
                <td className="px-4 py-2">{results.reactions.left.vertical.toFixed(2)}</td>
                <td className="px-4 py-2">{results.reactions.left.horizontal.toFixed(2)}</td>
                <td className="px-4 py-2">{results.reactions.left.moment.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Right Support</td>
                <td className="px-4 py-2">{results.reactions.right.vertical.toFixed(2)}</td>
                <td className="px-4 py-2">{results.reactions.right.horizontal.toFixed(2)}</td>
                <td className="px-4 py-2">{results.reactions.right.moment.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formulas">
            <AccordionTrigger className="text-lg font-medium">Applied Formulas</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {relevantFormulas.map((formula, index) => (
                  <FormulaDisplay key={index} formula={formula} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ResultsSummary;
