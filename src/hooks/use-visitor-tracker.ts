import { useState, useEffect } from "react";

// Simple client-side visitor tracking using localStorage
// For real Vercel analytics, use the Vercel Dashboard

interface VisitorData {
  visitorsToday: number;
  visitorsThisMonth: number;
  visitorsLastMonth: number;
  changePercent: number;
  isPositive: boolean;
}

export function useVisitorTracker() {
  const [data, setData] = useState<VisitorData>({
    visitorsToday: 0,
    visitorsThisMonth: 0,
    visitorsLastMonth: 0,
    changePercent: 0,
    isPositive: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get or create visitor ID
    let visitorId = localStorage.getItem("rc_visitor_id");
    if (!visitorId) {
      visitorId = `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("rc_visitor_id", visitorId);
    }

    // Get or create session ID
    let sessionId = sessionStorage.getItem("rc_session_id");
    if (!sessionId) {
      sessionId = `s-${Date.now()}`;
      sessionStorage.setItem("rc_session_id", sessionId);
      
      // New session = new visitor
      const today = new Date().toISOString().split("T")[0];
      const visits = JSON.parse(localStorage.getItem("rc_visits") || "{}");
      
      // Increment today
      visits[today] = (visits[today] || 0) + 1;
      localStorage.setItem("rc_visits", JSON.stringify(visits));
    }

    // Calculate stats
    const visits = JSON.parse(localStorage.getItem("rc_visits") || "{}");
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().getMonth();
    const lastMonth = new Date().getMonth() - 1;
    
    let thisMonthCount = 0;
    let lastMonthCount = 0;
    
    Object.entries(visits).forEach(([date, count]: [string, any]) => {
      const d = new Date(date);
      if (d.getMonth() === thisMonth && d.getFullYear() === new Date().getFullYear()) {
        thisMonthCount += count;
      }
      if (lastMonth === -1 ? (d.getMonth() === 11 && d.getFullYear() === new Date().getFullYear() - 1) : d.getMonth() === lastMonth && d.getFullYear() === new Date().getFullYear()) {
        lastMonthCount += count;
      }
    });

    const visitorsToday = visits[today] || 0;
    const changePercent = lastMonthCount > 0 
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) 
      : 0;

    setData({
      visitorsToday,
      visitorsThisMonth: thisMonthCount,
      visitorsLastMonth: lastMonthCount,
      changePercent,
      isPositive: changePercent >= 0,
    });
  }, []);

  return data;
}