import { motion } from "framer-motion";

export function Skeleton({ className = "", rounded = "rounded-xl" }) {
  return (
    <motion.div
      className={`bg-foreground/5 ${rounded} overflow-hidden relative ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-surface/40 to-transparent"
        animate={{ translateX: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'} rounded-md`} 
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-5 w-full pt-6">
      {/* Hero */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-12 w-48 mb-3" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
      
      {/* Pills */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      
      {/* List */}
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-5 w-full pt-8">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-10 w-48 mb-4" />
      <Skeleton className="h-16 w-full mb-8" />
      
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
