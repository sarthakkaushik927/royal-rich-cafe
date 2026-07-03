import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#D4A24C]/10',
        className
      )}
    />
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#D4A24C]/10 bg-[#0D0B09]">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-28 rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}
