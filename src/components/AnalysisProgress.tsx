import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisProgressProps {
  stage: "uploading" | "detecting" | "classifying" | "recommending" | "generating" | "complete";
  progress: number;
}

const stages = [
  { key: "uploading", label: "Uploading Image" },
  { key: "detecting", label: "Detecting Skin Conditions" },
  { key: "classifying", label: "Classifying Skin Type" },
  { key: "recommending", label: "Finding Products" },
  { key: "generating", label: "Generating Routine" },
  { key: "complete", label: "Analysis Complete" },
];

export function AnalysisProgress({ stage, progress }: AnalysisProgressProps) {
  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          {stage === "complete" ? (
            <CheckCircle2 className="w-6 h-6 text-primary animate-in fade-in" />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          )}
          <h3 className="text-lg font-semibold">
            {stages.find((s) => s.key === stage)?.label}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {stage === "complete"
            ? "Your personalized results are ready!"
            : "Please wait while we analyze your skin..."}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-2">
        {stages.slice(0, -1).map((s, index) => (
          <div
            key={s.key}
            className={cn(
              "flex items-center gap-3 text-sm transition-all",
              index < currentIndex
                ? "text-primary"
                : index === currentIndex
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 flex items-center justify-center border text-xs font-medium",
                index < currentIndex
                  ? "bg-primary text-primary-foreground border-primary"
                  : index === currentIndex
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              )}
            >
              {index < currentIndex ? "✓" : index + 1}
            </div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
