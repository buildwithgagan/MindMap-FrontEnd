import { Skeleton } from "@/components/ui/skeleton";

export function StoriesTraySkeleton() {
  return (
    <div className="relative">
      <div className="flex w-full space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex flex-shrink-0 flex-col items-center gap-2"
          >
            <div className="relative">
              <Skeleton className="h-16 w-16 rounded-full" />
              {i === 0 && (
                <Skeleton className="absolute bottom-0 right-0 h-6 w-6 rounded-full" />
              )}
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
