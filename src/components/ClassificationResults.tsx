import { ClassificationResult, getSkinTypeDescription } from "@/lib/skinAnalysis";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplet, Sun, Sparkles } from "lucide-react";

interface ClassificationResultsProps {
  classification: ClassificationResult;
}

const skinTypeIcons: Record<string, React.ReactNode> = {
  dry: <Droplet className="w-6 h-6" />,
  oily: <Sun className="w-6 h-6" />,
  normal: <Sparkles className="w-6 h-6" />,
};

const skinTypeLabels: Record<string, string> = {
  dry: "Dry Skin",
  oily: "Oily Skin",
  normal: "Normal Skin",
};

export function ClassificationResults({ classification }: ClassificationResultsProps) {
  return (
    <div className="space-y-4">
      {/* Main Result */}
      <div className="p-6 bg-card border-2 border-primary">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center bg-primary/10 text-primary">
            {skinTypeIcons[classification.skinType]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">
                {skinTypeLabels[classification.skinType]}
              </h3>
              <Badge className="tabular-nums">
                {Math.round(classification.confidence * 100)}% match
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getSkinTypeDescription(classification.skinType)}
            </p>
          </div>
        </div>
      </div>

      {/* Probability Distribution */}
      <div className="space-y-3">
        <h4 className="font-semibold">Probability Distribution</h4>
        <div className="space-y-3">
          {(["dry", "oily", "normal"] as const).map((type) => (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {skinTypeIcons[type]}
                  {skinTypeLabels[type]}
                </span>
                <span className="font-medium tabular-nums">
                  {Math.round(classification.probabilities[type] * 100)}%
                </span>
              </div>
              <Progress
                value={classification.probabilities[type] * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
