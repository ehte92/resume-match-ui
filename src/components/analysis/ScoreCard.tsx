import { ReactNode } from 'react';
import { CircularProgress } from './CircularProgress';
import { getScoreColor, getScoreInterpretation } from '@/lib/scoreUtils';
import { cn } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';
import { Tooltip } from '@/components/retroui/Tooltip';

interface ScoreCardProps {
  title: string;
  score: number;
  type: 'match' | 'ats' | 'semantic';
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export const ScoreCard = ({
  title,
  score,
  type,
  description,
  icon,
  className,
}: ScoreCardProps) => {
  const { textClass, borderClass } = getScoreColor(score);
  const interpretation = getScoreInterpretation(score, type);

  return (
    <div
      className={cn(
        'p-6 bg-white border-2 border-black rounded shadow-xl hover:shadow-2xl transition-shadow',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
        {description && (
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <button className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors">
                  <InfoIcon className="h-5 w-5 text-gray-500" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="left"
                className="max-w-xs border-2 border-black shadow-md"
              >
                <p className="text-sm">{description}</p>
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        )}
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-4">
        <CircularProgress value={score} color={textClass} size={140} strokeWidth={10} />
      </div>

      {/* Interpretation */}
      <div
        className={cn(
          'p-3 border-2 rounded text-sm font-medium text-center',
          borderClass,
          'bg-white'
        )}
      >
        {interpretation}
      </div>
    </div>
  );
};
