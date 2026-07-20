import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Actionables from "./pages/Actionables";
import Stats from "./pages/Stats";
import PlanPage from "./pages/plan/Index";
import PlanDetail from "./pages/plan/Detail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/actionables" element={<Actionables />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/plan/:id" element={<PlanDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
