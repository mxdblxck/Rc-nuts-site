import { 
  ShoppingCart, TrendingUp, Clock, CheckCircle, Package, Users, 
  ArrowUp, ArrowDown, MapPin, XCircle, Activity, Star, Eye, Truck, AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useVisitorTracker } from "@/hooks/use-visitor-tracker";
import { motion } from "framer-motion";

type Props = {
  stats: any;
  products: any[];
  orders: any[];
};

// months in Arabic (Algerian)
const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

export default function DashboardTab({ stats, products, orders }: Props) {
  const visitorStats = useVisitorTracker();
  
  if (!stats || !visitorStats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    );
  }

  // Stock Alerts
  const lowStock = (products ?? []).filter((p) => p.inStock && (p.stockQuantity ?? 0) < 5 && (p.stockQuantity ?? 0) > 0);
  const outOfStock = (products ?? []).filter((p) => !p.inStock);
  const recentOrders = (orders ?? []).slice(0, 6);

  // Sales Trends calculation
  const revenueTrend = calculateTrend(stats.revenueToday || 0, stats.revenueYesterday || 0);
  const ordersTrend = calculateTrend(stats.ordersToday || 0, stats.ordersYesterday || 0);

  // Conversion Rate (Total Orders this month / Total Visitors this month)
  // Approximate based on all time orders vs this month visitors, but better: 
  // We can calculate this month's orders
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthOrders = (orders ?? []).filter((order: any) => {
    const orderDate = new Date(order._creationTime);
    return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
  }).length;
  
  const conversionRate = visitorStats.visitorsThisMonth > 0 
    ? ((thisMonthOrders / visitorStats.visitorsThisMonth) * 100).toFixed(1) 
    : "0.0";

  // Monthly Sales Data for Area Chart
  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthOrders = (orders ?? []).filter((order: any) => {
      const orderDate = new Date(order._creationTime);
      return orderDate.getFullYear() === currentYear && orderDate.getMonth() === i;
    });
    const total = monthOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    return { month: months[i], sales: total, orders: monthOrders.length };
  });

  // KPI Cards Data
  const kpis = [
    { 
      title: "إجمالي المبيعات", 
      value: `${stats.totalRevenue.toLocaleString("ar-DZ")} دج`, 
      trend: calculateTrend(stats.revenueMonth, stats.revenueMonth - stats.revenueWeek), // simplified trend
      icon: <TrendingUp className="w-5 h-5" />, 
      color: "blue" 
    },
    { 
      title: "مبيعات اليوم", 
      value: `${stats.revenueToday.toLocaleString("ar-DZ")} دج`, 
      trend: revenueTrend,
      icon: <Activity className="w-5 h-5" />, 
      color: "emerald" 
    },
    { 
      title: "إجمالي الطلبات", 
      value: stats.totalOrders, 
      trend: ordersTrend,
      icon: <ShoppingCart className="w-5 h-5" />, 
      color: "purple" 
    },
    { 
      title: "الزوار (الشهر)", 
      value: visitorStats.visitorsThisMonth, 
      trend: { value: visitorStats.changePercent, isPositive: visitorStats.isPositive },
      icon: <Users className="w-5 h-5" />, 
      color: "orange" 
    },
  ];

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-lg">
          <p className="font-bold text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold">{entry.value.toLocaleString("ar-DZ")}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">نظرة عامة</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            أداء المتجر وإحصائيات المبيعات الفورية
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">{new Intl.DateTimeFormat('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())}</span>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Background Glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${kpi.color}-500/10 rounded-full blur-2xl group-hover:bg-${kpi.color}-500/20 transition-colors`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-sm font-bold text-muted-foreground">{kpi.title}</p>
              <div className={`p-2 rounded-xl bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30 text-${kpi.color}-600 dark:text-${kpi.color}-400`}>
                {kpi.icon}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-foreground tracking-tight">{kpi.value}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${kpi.trend.isPositive ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"}`}>
                  {kpi.trend.isPositive ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
                  {kpi.trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">مقارنة بالسابق</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Evolution Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-foreground">تطور المبيعات</h3>
              <p className="text-xs text-muted-foreground mt-1">الإيرادات الشهرية لعام {currentYear}</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888888', fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888888' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  name="المبيعات (دج)"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Wilayas Donut Chart */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
          <div>
            <h3 className="font-bold text-lg text-foreground">الولايات الأكثر طلباً</h3>
            <p className="text-xs text-muted-foreground mt-1">التوزيع الجغرافي للطلبات</p>
          </div>
          
          <div className="flex-1 min-h-[250px] relative mt-4">
            {stats.wilayaStats && stats.wilayaStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.wilayaStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.wilayaStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    content={(props) => {
                      const { payload } = props;
                      return (
                        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                          {payload?.map((entry, index) => (
                            <li key={`item-${index}`} className="flex items-center text-xs font-bold">
                              <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }}></span>
                              {entry.value}
                            </li>
                          ))}
                        </ul>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-bold">
                لا توجد بيانات كافية
              </div>
            )}
            
            {/* Center Text for Donut */}
            {stats.wilayaStats && stats.wilayaStats.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <MapPin className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-xs font-bold text-muted-foreground">{stats.wilayaStats.length} ولايات</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Secondary Metrics Row (Funnel & Visitors) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Status Funnel */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-foreground mb-6">مسار الطلبات (Funnel)</h3>
          
          <div className="space-y-4">
            {[
              { label: "قيد الانتظار", count: stats.pendingOrders, color: "bg-amber-500", icon: <Clock className="w-4 h-4 text-white" /> },
              { label: "تم التأكيد", count: stats.confirmedOrders, color: "bg-blue-500", icon: <CheckCircle className="w-4 h-4 text-white" /> },
              { label: "مشحون", count: stats.shippedOrders, color: "bg-purple-500", icon: <Package className="w-4 h-4 text-white" /> },
              { label: "مكتمل", count: stats.deliveredOrders, color: "bg-emerald-500", icon: <Star className="w-4 h-4 text-white" /> },
              { label: "ملغى", count: stats.cancelledOrders, color: "bg-rose-500", icon: <XCircle className="w-4 h-4 text-white" /> },
            ].map((status, i) => {
              const maxVal = Math.max(stats.totalOrders, 1);
              const percentage = Math.round((status.count / maxVal) * 100);
              
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${status.color}`}>
                    {status.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold">{status.label}</span>
                      <span className="text-xs font-bold text-muted-foreground">{status.count} طلب</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${status.color}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visitors Area Chart */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-foreground">الزوار الفعليون</h3>
              <p className="text-xs text-muted-foreground mt-1">آخر 7 أيام</p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-black">
              معدل التحويل: {conversionRate}%
            </div>
          </div>
          
          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorStats.dailyVisits} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888888', fontWeight: 600 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  name="عدد الزوار"
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVisitors)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products List */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-foreground mb-6">المنتجات الأكثر مبيعاً</h3>
          
          <div className="space-y-4">
            {stats.productSales && stats.productSales.slice(0, 5).map((product: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-sm line-clamp-1">{product.name}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-lg border border-border shadow-sm">
                  <span className="font-black text-sm">{product.quantity}</span>
                  <span className="text-[10px] text-muted-foreground">قطعة</span>
                </div>
              </div>
            ))}
            
            {(!stats.productSales || stats.productSales.length === 0) && (
              <div className="text-center py-8 text-sm font-bold text-muted-foreground">
                لا توجد مبيعات بعد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders — Real-Time Feed */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-lg text-foreground">آخر الطلبات</h3>
            <p className="text-xs text-muted-foreground mt-0.5">يتحدث تلقائياً في الوقت الفعلي</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            مباشر
          </span>
        </div>

        <div className="space-y-3">
          {recentOrders.slice(0, 3).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm font-bold">لا توجد طلبات بعد</div>
          ) : recentOrders.slice(0, 3).map((order: any) => {
            const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
              pending:   { label: "قيد الانتظار", className: "bg-amber-100 text-amber-700 border-amber-200",        icon: <Clock className="w-3.5 h-3.5" /> },
              confirmed: { label: "تم التأكيد",   className: "bg-blue-100 text-blue-700 border-blue-200",          icon: <CheckCircle className="w-3.5 h-3.5" /> },
              shipped:   { label: "مشحون",        className: "bg-purple-100 text-purple-700 border-purple-200",    icon: <Truck className="w-3.5 h-3.5" /> },
              delivered: { label: "مكتمل",        className: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
              cancelled: { label: "ملغى",         className: "bg-rose-100 text-rose-700 border-rose-200",          icon: <XCircle className="w-3.5 h-3.5" /> },
            };
            const s = statusConfig[order.status] ?? { label: order.status, className: "bg-muted text-muted-foreground border-border", icon: <AlertCircle className="w-3.5 h-3.5" /> };
            const wilaya = order.customerCity?.split("-")[0]?.trim() ?? "—";
            const shortId = String(order._id).slice(-6).toUpperCase();
            const diff = Date.now() - order._creationTime;
            const mins = Math.floor(diff / 60000);
            const timeAgo = mins < 1 ? "الآن" : mins < 60 ? `منذ ${mins} د` : mins < 1440 ? `منذ ${Math.floor(mins/60)} س` : `منذ ${Math.floor(mins/1440)} يوم`;

            return (
              <div key={order._id} className="flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted/50 transition-colors rounded-2xl border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm text-foreground truncate">{order.customerName}</p>
                    <p className="font-black text-sm shrink-0">{order.total?.toLocaleString("ar-DZ")} <span className="text-[10px] text-muted-foreground font-normal">دج</span></p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{wilaya}
                      <span className="mx-1 text-border">·</span>
                      <span className="font-mono text-[10px]">#{shortId}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.className}`}>
                        {s.icon}{s.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
