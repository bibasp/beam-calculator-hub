
import React from "react";
import { FormulaDescription } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FormulaDisplayProps {
  formula: FormulaDescription;
}

const FormulaDisplay = ({ formula }: FormulaDisplayProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{formula.name}</CardTitle>
        <CardDescription>{formula.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
          <div className="text-center font-serif text-lg italic">{formula.formula}</div>
        </div>
        
        {formula.variables.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Where:</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Symbol</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formula.variables.map((variable, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium font-serif">{variable.symbol}</TableCell>
                    <TableCell>{variable.meaning}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormulaDisplay;
