
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BeamCanvas from "./BeamCanvas";
import BeamControls from "./BeamControls";
import LoadsList from "./LoadsList";
import ResultDiagrams from "./ResultDiagrams";
import ResultsSummary from "./ResultsSummary";
import { calculateBeamResults } from "@/lib/beamCalculations";
import { toast } from "@/components/ui/use-toast";
import { 
  Load, 
  BeamResult, 
  SupportType, 
  DiagramType 
} from "@/lib/types";

const BeamCalculator = () => {
  const [beamLength, setBeamLength] = useState<number>(10);
  const [loads, setLoads] = useState<Load[]>([]);
  const [supports, setSupports] = useState<{
    left: SupportType;
    right: SupportType;
  }>({
    left: "fixed",
    right: "roller"
  });
  const [results, setResults] = useState<BeamResult | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType>("SFD");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Calculate results when beam properties change
  useEffect(() => {
    if (loads.length > 0) {
      calculateResults();
    }
  }, [beamLength, loads, supports]);

  const addLoad = (load: Load) => {
    if (load.position > beamLength) {
      toast({
        title: "Invalid load position",
        description: `Position cannot be greater than beam length (${beamLength}m)`,
        variant: "destructive"
      });
      return;
    }
    
    setLoads([...loads, load]);
    toast({
      title: "Load added",
      description: `${load.type} load added at position ${load.position}m`
    });
  };

  const removeLoad = (index: number) => {
    setLoads(loads.filter((_, i) => i !== index));
  };

  const updateSupports = (leftSupport: SupportType, rightSupport: SupportType) => {
    setSupports({
      left: leftSupport,
      right: rightSupport
    });
  };

  const calculateResults = () => {
    setIsCalculating(true);
    try {
      const calculatedResults = calculateBeamResults(beamLength, loads, supports);
      setResults(calculatedResults);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate beam results",
        variant: "destructive"
      });
      setResults(null);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <BeamControls 
              beamLength={beamLength}
              setBeamLength={setBeamLength}
              addLoad={addLoad}
              supports={supports}
              updateSupports={updateSupports}
            />
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Applied Loads</h3>
              <LoadsList loads={loads} removeLoad={removeLoad} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <BeamCanvas 
              beamLength={beamLength} 
              loads={loads} 
              supports={supports} 
            />
          </CardContent>
        </Card>
        
        <Tabs defaultValue="diagrams" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagrams">Force Diagrams</TabsTrigger>
            <TabsTrigger value="results">Results Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagrams">
            <Card>
              <CardContent className="pt-6">
                {results ? (
                  <ResultDiagrams 
                    results={results} 
                    selectedDiagram={selectedDiagram}
                    setSelectedDiagram={setSelectedDiagram}
                  />
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    {isCalculating ? (
                      <p>Calculating results...</p>
                    ) : (
                      <p>Add loads to see force diagrams</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            <Card>
              <CardContent className="pt-6">
                {results ? (
                  <ResultsSummary results={results} />
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    {isCalculating ? (
                      <p>Calculating results...</p>
                    ) : (
                      <p>Add loads to see results summary</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BeamCalculator;
