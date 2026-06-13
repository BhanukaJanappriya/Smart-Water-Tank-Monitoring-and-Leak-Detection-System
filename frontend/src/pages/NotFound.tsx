import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-fade-in-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Droplets className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">This page sprang a leak and drifted away.</p>
      </div>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
