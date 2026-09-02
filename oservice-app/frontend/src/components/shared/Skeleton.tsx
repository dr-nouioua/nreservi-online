import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('skeleton', className)}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export function JobCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="flex items-start gap-3">
            <div className="skeleton-circle w-10 h-10" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-line h-5 w-3/4" />
              <div className="skeleton-line-sm h-3 w-1/2" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2 mt-3">
            <div className="skeleton-line-sm h-3" />
            <div className="skeleton-line-sm h-3 w-2/3" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="skeleton h-6 w-16 rounded-full" />
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="skeleton-card space-y-4">
      <div className="flex items-center gap-4">
        <div className="skeleton-circle w-16 h-16" />
        <div className="space-y-2 flex-1">
          <div className="skeleton-line h-6 w-1/2" />
          <div className="skeleton-line-sm h-4 w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-line h-4" />
        <div className="skeleton-line-sm h-4 w-3/4" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-8 w-24 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-full" />
        <div className="skeleton h-8 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function ApplicantSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-3">
          <div className="skeleton-circle w-10 h-10" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-line h-4 w-2/3" />
            <div className="skeleton-line-sm h-3 w-1/3" />
          </div>
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
