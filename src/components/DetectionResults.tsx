import { DetectedCondition, getConditionDisplayName, getConditionDescription } from "@/lib/skinAnalysis";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DetectionResultsProps {
  imagePreview: string;
  detections: DetectedCondition[];
}

export function DetectionResults({ imagePreview, detections }: DetectionResultsProps) {
  return (
    <div className="space-y-4">
      {/* Annotated Image */}
      <div className="relative overflow-hidden border-2 border-border bg-card">
        <img
          src={imagePreview}
          alt="Analyzed facial image"
          className="w-full h-auto"
        />
        
        {/* Bounding boxes overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {detections.map((detection, index) => {
            const colors = [
              "#ef4444", "#f97316", "#eab308", "#22c55e", 
              "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6366f1"
            ];
            const color = colors[index % colors.length];
            const { x, y, width, height } = detection.boundingBox;
            
            return (
              <g key={index}>
                <rect
                  x={x * 100}
                  y={y * 100}
                  width={width * 100}
                  height={height * 100}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  strokeDasharray="2 1"
                />
                <rect
                  x={x * 100}
                  y={y * 100 - 4}
                  width={width * 100}
                  height="4"
                  fill={color}
                />
                <text
                  x={x * 100 + 1}
                  y={y * 100 - 1}
                  fill="white"
                  fontSize="2.5"
                  fontFamily="sans-serif"
                >
                  {getConditionDisplayName(detection.name)} ({Math.round(detection.confidence * 100)}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detected Conditions List */}
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Detected Conditions ({detections.length})
        </h4>
        
        <div className="grid gap-2">
          {detections.map((detection, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{getConditionDescription(detection.name)}</p>
                  </TooltipContent>
                </Tooltip>
                <span className="font-medium">
                  {getConditionDisplayName(detection.name)}
                </span>
              </div>
              
              <Badge
                variant={detection.confidence > 0.8 ? "default" : "secondary"}
                className="tabular-nums"
              >
                {Math.round(detection.confidence * 100)}%
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
