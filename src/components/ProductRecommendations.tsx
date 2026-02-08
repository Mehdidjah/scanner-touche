import { RecommendationResult } from "@/lib/recommendations";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { getConditionDisplayName } from "@/lib/skinAnalysis";

interface ProductRecommendationsProps {
  recommendations: RecommendationResult[];
}

export function ProductRecommendations({ recommendations }: ProductRecommendationsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">
          Top {recommendations.length} Recommendations
        </h4>
        <span className="text-sm text-muted-foreground">
          Based on your skin profile
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.product.id}
            className="group border border-border bg-card overflow-hidden hover:border-primary/50 transition-all"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img
                src={rec.product.imageUrl}
                alt={rec.product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge className="text-xs tabular-nums">
                  {Math.round(rec.similarityScore * 100)}% match
                </Badge>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {rec.product.brand}
                </p>
                <h5 className="font-semibold line-clamp-2 mt-1">
                  {rec.product.name}
                </h5>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-medium">{rec.product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({rec.product.reviewsCount.toLocaleString()} reviews)
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {rec.product.description}
              </p>

              {/* Matching Concerns */}
              {rec.matchingConcerns.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {rec.matchingConcerns.map((concern) => (
                    <Badge key={concern} variant="outline" className="text-xs">
                      {getConditionDisplayName(concern)}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-lg font-bold">
                  ${rec.product.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
