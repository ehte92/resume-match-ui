import { cn } from '@/lib/utils';

interface KeywordMatchBarProps {
  matchedCount: number;
  totalCount: number;
  className?: string;
  showPercentage?: boolean;
  showCounts?: boolean;
}

export const KeywordMatchBar = ({
  matchedCount,
  totalCount,
  className,
  showPercentage = true,
  showCounts = true,
}: KeywordMatchBarProps) => {
  const percentage = totalCount > 0 ? (matchedCount / totalCount) * 100 : 0;
  const missingCount = totalCount - matchedCount;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Visual bar */}
      <div className="relative h-8 border-2 border-black rounded overflow-hidden shadow-md bg-white">
        <div className="absolute inset-0 flex">
          {/* Matched section */}
          <div
            className="bg-green-500 transition-all duration-500 ease-out flex items-center justify-center"
            style={{ width: `${percentage}%` }}
          >
            {matchedCount > 0 && showCounts && (
              <span className="text-sm font-bold text-white px-2">{matchedCount}</span>
            )}
          </div>
          {/* Missing section */}
          <div
            className="bg-red-500 transition-all duration-500 ease-out flex items-center justify-center"
            style={{ width: `${100 - percentage}%` }}
          >
            {missingCount > 0 && showCounts && (
              <span className="text-sm font-bold text-white px-2">{missingCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 border border-black rounded" />
            <span className="font-medium">Matched: {matchedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 border border-black rounded" />
            <span className="font-medium">Missing: {missingCount}</span>
          </div>
        </div>
        {showPercentage && (
          <div className="font-bold text-foreground">
            {Math.round(percentage)}% Match
          </div>
        )}
      </div>
    </div>
  );
};
