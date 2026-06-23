import { AlertCircle } from "lucide-react";
import Card from "@/app/components/ui/Card";

export default function Disclaimer() {
  return (
    <Card className="border-warning-orange/25 bg-warning-orange/5 dark:bg-warning-orange/10 dark:border-warning-orange/20 transition-colors p-5">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-warning-orange shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-warning-orange text-sm">Clinical Disclaimer</h4>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary dark:text-gray-300">
            This tool is for educational purposes and provides information based on a limited demo database. It does not replace professional medical advice. Always consult your doctor or pharmacist before making any decisions about your medications.
          </p>
        </div>
      </div>
    </Card>
  );
}
