import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "text" | "circle";
}

/**
 * Skeleton component for loading states
 *
 * Provides animated placeholder elements that match the retro design system
 * while content is loading, improving perceived performance.
 *
 * Variants:
 * - default: Basic rectangular skeleton
 * - card: Skeleton with card-like dimensions and border
 * - text: Text-height skeleton for single line text
 * - circle: Circular skeleton for avatars/icons
 */
export const Skeleton = ({
  variant = "default",
  className,
  ...props
}: SkeletonProps) => {
  const baseClasses = "animate-pulse bg-gray-200";

  const variantClasses = {
    default: "rounded h-4 w-full",
    card: "rounded border-2 border-black h-48 w-full",
    text: "rounded h-4 w-full",
    circle: "rounded-full h-12 w-12",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
};

/**
 * Skeleton Card component for loading card layouts
 * Matches the retro design system with borders and shadows
 */
export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "border-2 border-black bg-white shadow-xl rounded overflow-hidden",
        className
      )}
    >
      {/* Header skeleton */}
      <div className="bg-gray-100 p-6 border-b-2 border-black">
        <Skeleton variant="text" className="w-3/4 h-6 mb-2" />
        <Skeleton variant="text" className="w-1/2 h-4" />
      </div>

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-4/6" />

        <div className="flex gap-2 mt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};

/**
 * Analysis Card Skeleton - matches AnalysisCard component structure
 */
export const SkeletonAnalysisCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "border-2 border-black bg-white shadow-xl rounded overflow-hidden",
        className
      )}
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-primary to-primary-hover p-4">
        <Skeleton variant="text" className="w-3/4 h-6 mb-2 bg-white/30" />
        <Skeleton variant="text" className="w-1/2 h-4 bg-white/20" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Score display */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-24 h-8" />
          <Skeleton variant="circle" className="h-16 w-16" />
        </div>

        {/* Meta info */}
        <div className="space-y-2">
          <Skeleton variant="text" className="w-full h-3" />
          <Skeleton variant="text" className="w-3/4 h-3" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
};

/**
 * Resume Card Skeleton - matches ResumeCard component structure
 */
export const SkeletonResumeCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "border-2 border-black bg-white shadow-xl rounded overflow-hidden",
        className
      )}
    >
      {/* Header with icon */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 flex items-center gap-3">
        <Skeleton variant="circle" className="h-12 w-12 bg-white/30" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4 h-5 bg-white/30" />
          <Skeleton variant="text" className="w-1/2 h-3 bg-white/20" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-full h-3" />
          <Skeleton variant="text" className="w-5/6 h-3" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
};

/**
 * List of skeleton items for lists/grids
 */
export const SkeletonList = ({
  count = 3,
  variant = "card",
  className,
}: {
  count?: number;
  variant?: "card" | "analysis" | "resume";
  className?: string;
}) => {
  const SkeletonComponent = {
    card: SkeletonCard,
    analysis: SkeletonAnalysisCard,
    resume: SkeletonResumeCard,
  }[variant];

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} className={className} />
      ))}
    </>
  );
};
