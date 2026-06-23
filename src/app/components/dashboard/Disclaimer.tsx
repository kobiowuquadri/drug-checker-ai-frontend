import { AlertTriangle } from "lucide-react";
import Card from "@/app/components/ui/Card";

export default function Disclaimer() {
  return (
    <Card className="border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">Medical Disclaimer</h3>
          <p className="mt-1 text-xs leading-relaxed text-amber-700/90 font-medium">
            Drug Checker AI provides educational information only and is not a
            substitute for professional medical advice, diagnosis, or treatment.
            Always consult a qualified healthcare provider before making
            medication decisions.
          </p>
        </div>
      </div>
    </Card>
  );
}
