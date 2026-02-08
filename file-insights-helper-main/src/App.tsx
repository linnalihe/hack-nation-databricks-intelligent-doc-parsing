import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import Facilities from "./pages/Facilities";
import Regions from "./pages/Regions";
import Specialties from "./pages/Specialties";
import MedicalDeserts from "./pages/MedicalDeserts";
import DataQuality from "./pages/DataQuality";
import MapView from "./pages/MapView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/specialties" element={<Specialties />} />
          <Route path="/medical-deserts" element={<MedicalDeserts />} />
          <Route path="/data-quality" element={<DataQuality />} />
          <Route path="/map" element={<MapView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
