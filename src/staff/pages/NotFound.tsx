import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StaffNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-dark">Page not found</h1>
      <Button asChild variant="outline">
        <Link to="/staff">Back to shifts</Link>
      </Button>
    </div>
  );
}
