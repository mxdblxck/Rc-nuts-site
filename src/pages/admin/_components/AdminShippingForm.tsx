import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Search, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function AdminShippingForm() {
  const rates = useQuery(api.shipping.getShippingRates);
  const updateRate = useMutation(api.shipping.updateShippingRate);
  
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [tempHomeCost, setTempHomeCost] = useState(0);
  const [tempDeskCost, setTempDeskCost] = useState(0);
  
  const filteredRates = useMemo(() => {
    if (!rates) return [];
    return rates
      .filter(r => r.wilayaName.includes(search) || r.wilayaCode.includes(search))
      .sort((a, b) => parseInt(a.wilayaCode) - parseInt(b.wilayaCode));
  }, [rates, search]);

  if (rates === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        {Array.from({length: 10}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const startEditing = (rate: any) => {
    setEditingId(rate._id);
    setTempHomeCost(rate.homeDeliveryCost);
    setTempDeskCost(rate.deskDeliveryCost);
  };

  const handleSave = async (id: any) => {
    try {
      await updateRate({
        id,
        homeDeliveryCost: tempHomeCost,
        deskDeliveryCost: tempDeskCost,
        active: true, // We could add a toggle for active state if needed
      });
      toast.success("تم تحديث السعر بنجاح");
      setEditingId(null);
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleToggleActive = async (rate: any) => {
    try {
      await updateRate({
        id: rate._id,
        homeDeliveryCost: rate.homeDeliveryCost,
        deskDeliveryCost: rate.deskDeliveryCost,
        active: !rate.active,
      });
      toast.success(rate.active ? "تم إيقاف الشحن لهذه الولاية" : "تم تفعيل الشحن لهذه الولاية");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">إعدادات أسعار الشحن</h1>
          <p className="text-sm text-muted-foreground mt-1">قم بتحديد أسعار التوصيل للمنزل والمكتب لكل ولاية</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن ولاية أو رقم..." 
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">الولاية</th>
                <th className="px-4 py-3 font-medium">للمكتب (Stop Desk)</th>
                <th className="px-4 py-3 font-medium">للمنزل (Home)</th>
                <th className="px-4 py-3 font-medium text-center">الحالة</th>
                <th className="px-4 py-3 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRates.map((rate) => {
                const isEditing = editingId === rate._id;
                
                return (
                  <tr key={rate._id} className={`hover:bg-muted/20 transition-colors ${!rate.active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-bold">
                      <span className="text-primary ml-2">{rate.wilayaCode}</span>
                      {rate.wilayaName}
                    </td>
                    
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-24 h-8"
                            value={tempDeskCost}
                            onChange={(e) => setTempDeskCost(Number(e.target.value))}
                          />
                          <span className="text-xs text-muted-foreground">دج</span>
                        </div>
                      ) : (
                        <span className="font-bold">{rate.deskDeliveryCost} دج</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-24 h-8"
                            value={tempHomeCost}
                            onChange={(e) => setTempHomeCost(Number(e.target.value))}
                          />
                          <span className="text-xs text-muted-foreground">دج</span>
                        </div>
                      ) : (
                        <span className="font-bold">{rate.homeDeliveryCost} دج</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <Switch 
                        checked={rate.active} 
                        onCheckedChange={() => handleToggleActive(rate)}
                      />
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <Button size="sm" onClick={() => handleSave(rate._id)} className="h-8 gap-1">
                          <Save className="w-3.5 h-3.5" />
                          حفظ
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => startEditing(rate)} className="h-8">
                          تعديل
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredRates.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            لا توجد ولايات مطابقة لبحثك
          </div>
        )}
      </div>
    </div>
  );
}
