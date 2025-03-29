
import { useState } from "react";
import BeamCalculator from "@/components/BeamCalculator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-engineer-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-engineer-text mb-6">Structural Beam Calculator</h1>
        <p className="text-gray-600 mb-8">
          Calculate and visualize shear force, bending moment, and axial force diagrams for beams.
          Add supports, loads, and moments to see how they affect the beam's behavior.
        </p>
        <BeamCalculator />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
