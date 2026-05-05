import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Save, AlertCircle, CheckCircle2, User, Lock, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const DEFAULT_CREDS = { username: "admin", password: "admin123" };

function getStoredCreds() {
  try {
    const raw = localStorage.getItem("admin_credentials");
    return raw ? JSON.parse(raw) : DEFAULT_CREDS;
  } catch {
    return DEFAULT_CREDS;
  }
}

function isSessionValid(): boolean {
  try {
    const raw = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
    if (!raw) return false;
    const s = JSON.parse(raw);
    return !!(s.username && s.loginTime);
  } catch { return false; }
}

function PasswordInput({ value, onChange, placeholder, show, onToggle, id }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  show: boolean; onToggle: () => void; id: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        dir="ltr"
        className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  // Form state
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReady(true);
    const creds = getStoredCreds();
    setCurrentUsername(creds.username);
  }, []);

  useEffect(() => {
    if (ready && !isSessionValid()) navigate("/admin/login");
  }, [ready, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 300));

    try {
      const stored = getStoredCreds();

      // 1. Verify current password
      if (currentPassword !== stored.password) {
        setError("كلمة المرور الحالية غير صحيحة");
        return;
      }

      // 2. At least one change must be provided
      if (!newUsername && !newPassword) {
        setError("يجب إدخال اسم مستخدم جديد أو كلمة مرور جديدة على الأقل");
        return;
      }

      // 3. Validate new username
      if (newUsername) {
        if (newUsername.length < 3) { setError("اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل"); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) { setError("اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط"); return; }
      }

      // 4. Validate new password
      if (newPassword) {
        if (newPassword.length < 6) { setError("كلمة المرور الجديدة يجب أن تحتوي على 6 أحرف على الأقل"); return; }
        if (newPassword !== confirmPassword) { setError("كلمتا المرور الجديدتان غير متطابقتين"); return; }
        if (newPassword === stored.password) { setError("كلمة المرور الجديدة يجب أن تختلف عن الحالية"); return; }
      }

      // 5. Save updated credentials
      const updated = {
        username: newUsername || stored.username,
        password: newPassword || stored.password,
      };
      localStorage.setItem("admin_credentials", JSON.stringify(updated));

      // 6. Update active session to reflect new username
      const sessionData = JSON.stringify({ username: updated.username, loginTime: Date.now() });
      if (localStorage.getItem("admin_session")) localStorage.setItem("admin_session", sessionData);
      if (sessionStorage.getItem("admin_session")) sessionStorage.setItem("admin_session", sessionData);

      // 7. Reset form
      setCurrentUsername(updated.username);
      setCurrentPassword("");
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("تم حفظ التغييرات بنجاح ✓");
    } catch {
      setError("حدث خطأ غير متوقع — يُرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_session");
    navigate("/admin/login");
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-foreground">الإعدادات</h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة بيانات الدخول والأمان</p>
          </div>
          <Link
            to="/admin"
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            لوحة التحكم
          </Link>
        </div>

        {/* Current Account Info */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-black text-2xl shadow-lg">
            {currentUsername.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-lg text-foreground">{currentUsername}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> مدير النظام
            </p>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-3 rounded-2xl mb-5 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />{success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-2xl mb-5 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />{error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Current Password — required always */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <Lock className="w-5 h-5 text-primary" /> التحقق من الهوية
            </h3>
            <div className="space-y-1.5">
              <label htmlFor="currentPwd" className="text-sm font-bold text-foreground">كلمة المرور الحالية *</label>
              <PasswordInput
                id="currentPwd"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="أدخل كلمة المرور الحالية"
                show={showCurrent}
                onToggle={() => setShowCurrent(v => !v)}
              />
            </div>
          </div>

          {/* Change Username */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <User className="w-5 h-5 text-primary" /> تغيير اسم المستخدم
              <span className="text-xs font-normal text-muted-foreground mr-auto">(اختياري)</span>
            </h3>
            <div className="space-y-1.5">
              <label htmlFor="newUser" className="text-sm font-bold text-foreground">اسم المستخدم الجديد</label>
              <input
                id="newUser"
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder={`الحالي: ${currentUsername}`}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <Lock className="w-5 h-5 text-primary" /> تغيير كلمة المرور
              <span className="text-xs font-normal text-muted-foreground mr-auto">(اختياري)</span>
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="newPwd" className="text-sm font-bold text-foreground">كلمة المرور الجديدة (6 أحرف على الأقل)</label>
              <PasswordInput id="newPwd" value={newPassword} onChange={setNewPassword} placeholder="••••••••" show={showNew} onToggle={() => setShowNew(v => !v)} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPwd" className="text-sm font-bold text-foreground">تأكيد كلمة المرور الجديدة</label>
              <PasswordInput id="confirmPwd" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              {newPassword && confirmPassword && (
                <p className={`text-xs font-bold mt-1 ${newPassword === confirmPassword ? "text-emerald-600" : "text-destructive"}`}>
                  {newPassword === confirmPassword ? "✓ كلمتا المرور متطابقتان" : "✗ كلمتا المرور غير متطابقتين"}
                </p>
              )}
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={loading || !currentPassword}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            حفظ التغييرات
          </button>
        </form>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 border border-destructive/40 text-destructive rounded-xl font-bold text-sm hover:bg-destructive/10 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}