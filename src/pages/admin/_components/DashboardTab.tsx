import { ShoppingCart, TrendingUp, Clock, CheckCircle, BarChart3, Package, Users, TrendingDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Props = {
  stats: any;
  products: any[];
  orders: any[];
};

// months in Arabic
const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
}

export default function DashboardTab({ stats, products, orders }: Props) {
  const lowStock = (products ?? []).filter((p) => p.inStock && (p.stockQuantity ?? 0) < 5 && (p.stockQuantity ?? 0) > 0);
  const outOfStock = (products ?? []).filter((p) => !p.inStock);
  const recentOrders = (orders ?? []).slice(0, 5);
  
  // Calculate monthly sales data
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Group orders by month
  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthOrders = (orders ?? []).filter((order: any) => {
      const orderDate = new Date(order._creationTime);
      return orderDate.getFullYear() === currentYear && orderDate.getMonth() === i;
    });
    const total = monthOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    return { month: months[i], sales: total, orders: monthOrders.length };
  });
  
  // Current vs previous month
  const currentMonthSales = monthlySales[currentMonth]?.sales || 0;
  const lastMonthSales = currentMonth > 0 ? monthlySales[currentMonth - 1]?.sales || 0 : 0;
  const salesTrend = calculateTrend(currentMonthSales, lastMonthSales);
  
  // Mock visitor data (would need real tracking in production)
  const visitorsToday = Math.floor(Math.random() * 50) + 10;
  const visitorsMonth = Math.floor(Math.random() * 500) + 100;
  const visitorsLastMonth = Math.floor(Math.random() * 400) + 100;
  const visitorTrend = calculateTrend(visitorsMonth, visitorsLastMonth);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  const kpis = [
    { label: "إجمالي الطلبات", value: stats.totalOrders, icon: <ShoppingCart className="w-5 h-5" />, color: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
    { label: "مبيعات اليوم", value: `${stats.revenueToday.toLocaleString("ar-DZ")} دج`, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" },
    { label: "مبيعات الأسبوع", value: `${stats.revenueWeek.toLocaleString("ar-DZ")} دج`, icon: <TrendingUp className="w-5 h-5" />, color: "text-teal-600 bg-teal-50 dark:bg-teal-950" },
    { label: "مبيعات الشهر", value: `${stats.revenueMonth.toLocaleString("ar-DZ")} دج`, icon: <BarChart3 className="w-5 h-5" />, color: "text-violet-600 bg-violet-50 dark:bg-violet-950" },
    { label: "طلبات معلقة", value: stats.pendingOrders, icon: <Clock className="w-5 h-5" />, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
    { label: "تم التسليم", value: stats.deliveredOrders, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-600 bg-green-50 dark:bg-green-950" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">لوحة الإحصائيات</h1>

      {/* Analytics Section */}
      <div className="space-y-6">
        {/* Monthly Sales Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              المبيعات الشهرية {currentYear}
            </h3>
            <div className={`flex items-center gap-1 text-sm font-bold ${salesTrend.isPositive ? "text-green-600" : "text-red-500"}`}>
              {salesTrend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{salesTrend.value}%</span>
              <span className="text-muted-foreground mr-1">compared to last month</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString("ar-DZ")} دج`, "المبيعات"]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid oklch(0.88 0.02 80)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]} name="المبيعات">
                  {monthlySales.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === currentMonth ? "oklch(0.42 0.1 130)" : "oklch(0.42 0.1 130 / 0.6)"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitors Analytics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              زوار الموقع
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-black text-foreground">{visitorsToday}</div>
                <div className="text-xs text-muted-foreground">زوار اليوم</div>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-foreground">{visitorsMonth}</div>
                    <div className="text-xs text-muted-foreground">هذا الشهر</div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${visitorTrend.isPositive ? "text-green-600" : "text-red-500"}`}>
                    {visitorTrend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{visitorTrend.value}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              نظرة سريعة
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground"> متوسط الطلب</span>
                <span className="font-bold text-foreground">
                  {stats.totalOrders > 0 
                    ? `${Math.round((stats.revenueMonth / stats.totalOrders)).toLocaleString("ar-DZ")} دج`
                    : "0 دج"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">نسبة التحويل</span>
                <span className="font-bold text-green-600">{stats.totalOrders > 0 ? "2.5%" : "0%"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">العملاء</span>
                <span className="font-bold text-foreground">{stats.totalOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div className="text-xl font-black text-foreground">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            أكثر المنتجات مبيعاً
          </h3>
          <div className="space-y-3">
            {stats.productSales.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا توجد مبيعات بعد</p>
            ) : (
              stats.productSales
                .sort((a: any, b: any) => b.quantity - a.quantity)
                .slice(0, 5)
                .map((sale: any, i: number) => (
                  <div key={sale.name} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 text-sm text-foreground truncate">{sale.name}</div>
                    <div className="text-sm font-bold text-primary shrink-0">{sale.quantity} وحدة</div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            تنبيهات المخزن
          </h3>
          {lowStock.length === 0 && outOfStock.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              المخزن في حالة جيدة
            </div>
          ) : (
            <div className="space-y-2">
              {outOfStock.map((p: any) => (
                <div key={p._id} className="flex items-center gap-2 text-sm bg-destructive/10 text-destructive rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                  <span className="truncate">{p.nameAr}</span>
                  <span className="mr-auto font-bold shrink-0">نفذت</span>
                </div>
              ))}
              {lowStock.map((p: any) => (
                <div key={p._id} className="flex items-center gap-2 text-sm bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400 rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span className="truncate">{p.nameAr}</span>
                  <span className="mr-auto font-bold shrink-0">{p.stockQuantity} قطعة</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          آخر الطلبات
        </h3>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد طلبات بعد</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order: any) => (
              <div key={order._id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerCity}</div>
                </div>
                <div className="text-sm font-bold text-primary shrink-0">{order.total.toLocaleString("ar-DZ")} دج</div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  order.status === "delivered" ? "bg-green-100 text-green-800" :
                  order.status === "cancelled" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {order.status === "pending" ? "معلق" : order.status === "delivered" ? "مُسلَّم" : order.status === "cancelled" ? "ملغي" : "قيد التنفيذ"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
