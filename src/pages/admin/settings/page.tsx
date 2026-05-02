import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Save, AlertCircle, CheckCircle, User, Lock, LogOut } from "lucide-react";
import { useAdminAuth, logout as adminLogout } from "@/hooks/use-admin-auth";

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdminAuth();
  
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const storedAdmin = localStorage.getItem("admin_credentials");
      if (!storedAdmin) {
        setError("لم يتم العثور على بيانات المسؤول");
        return;
      }

      const admin = JSON.parse(storedAdmin);

      // Verify current password
      if (currentPassword !== admin.password) {
        setError("كلمة المرور الحالية غير صحيحة");
        setLoading(false);
        return;
      }

      // Validate username
      if (newUsername && newUsername.length < 3) {
        setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
        setLoading(false);
        return;
      }

      // Validate password
      if (newPassword && newPassword.length < 4) {
        setError("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
        setLoading(false);
        return;
      }

      // Check password match
      if (newPassword && newPassword !== confirmPassword) {
        setError("كلمات المرور غير متطابقة");
        setLoading(false);
        return;
      }

      // Update admin credentials
      const updatedAdmin = {
        username: newUsername || currentUsername,
        password: newPassword || admin.password
      };
      
      localStorage.setItem("admin_credentials", JSON.stringify(updatedAdmin));
      localStorage.setItem("admin_session", JSON.stringify({ username: updatedAdmin.username, loginTime: Date.now() }));
      
      setSuccess("تم تحديث الإعدادات بنجاح");
      setCurrentPassword("");
      setNewUsername("");
      setConfirmPassword("");
    } catch (err) {
      setError("حدث خطأ يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">إعدادات المدير</h1>
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← العودة للوحة التحكم
          </Link>
        </div>

        {/* Settings Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          {success && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Update Username */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <User className="w-5 h-5" />
                تغيير اسم المستخدم
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    اسم المستخدم الجديد
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="أدخل اسم المستخدم الجديد (اتركه فارغاً إذا لم تريد التغيير)"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Section: Update Password */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <Lock className="w-5 h-5" />
                تغيير كلمة المرور
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    كلمة المرور الحالية *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                      placeholder="أدخل كلمة المرور الحالية"
                      required
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                      placeholder="أدخل كلمة المرور الجديدة"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              حفظ التغييرات
            </button>
          </form>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 px-4 border border-destructive text-destructive rounded-lg font-semibold hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}