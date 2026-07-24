"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface Activity {
  id: string;
  action: string;
  createdAt: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchActivities = async (currentCursor?: string | null) => {
    if (loading || (!hasMore && currentCursor)) return;
    setLoading(true);

    try {
      const url = currentCursor
        ? `/api/activities?cursor=${currentCursor}`
        : `/api/activities`;
      const res = await fetch(url);
      const data = await res.json();

      setActivities((prev) => 
        currentCursor ? [...prev, ...data.activities] : data.activities
      );
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && cursor) {
          fetchActivities(cursor);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, cursor]
  );

  return (
    <div className="space-y-4 max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold">Activity Feed</h2>
      
      {activities.map((activity, index) => {
        const isLast = activities.length === index + 1;
        return (
          <div 
            ref={isLast ? lastElementRef : null} 
            key={activity.id} 
            className="p-4 border rounded-lg shadow-sm bg-card"
          >
            <p>{activity.action}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(activity.createdAt).toLocaleDateString()}
            </span>
          </div>
        );
      })}

      {loading && <p className="text-center text-sm text-muted-foreground">Loading more activities...</p>}
      {!hasMore && <p className="text-center text-sm text-muted-foreground">You have reached the end of your activity feed.</p>}
    </div>
  );
}
