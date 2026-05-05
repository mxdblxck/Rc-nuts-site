import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";
const SESSION_DURATION_HOURS = 24;

function isSessionValid(): boolean {
  try {
    const raw = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session.username || !session.loginTime) return false;
    const expired = Date.now() - session.loginTime > SESSION_DURATION_HOURS * 3600 * 1000;
    if (expired) {
      localStorage.removeItem("admin_session");
      sessionStorage.removeItem("admin_session");
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isSessionValid()) navigate("/admin");
  }, [navigate]);

  // Lock after 5 failed attempts
  useEffect(() => {
    if (attempts >= 5) {
      setLocked(true);
      setError("تم تجاوز عدد المحاولات. يُرجى الانتظار دقيقة.");
      const timer = setTimeout(() => {
        setLocked(false);
        setAttempts(0);
        setError("");
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [attempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 400)); // Prevent brute-force timing

    try {
      const storedRaw = localStorage.getItem("admin_credentials");
      let stored = storedRaw ? JSON.parse(storedRaw) : { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };

      if (username.trim() === stored.username && password === stored.password) {
        const sessionData = JSON.stringify({ username: stored.username, loginTime: Date.now() });
        if (rememberMe) {
          localStorage.setItem("admin_session", sessionData);
        } else {
          sessionStorage.setItem("admin_session", sessionData);
        }
        setAttempts(0);
        navigate("/admin");
      } else {
        setAttempts(prev => prev + 1);
        setError(`اسم المستخدم أو كلمة المرور غير صحيحة ${attempts + 1 >= 5 ? "" : `(${5 - attempts - 1} محاولات متبقية)`}`);
      }
    } catch {
      setError("حدث خطأ — يُرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-border/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md px-4"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="RC Nuts"
            className="w-24 h-24 mx-auto mb-4 rounded-3xl shadow-2xl shadow-primary/30 object-cover"
          />
          <h1 className="text-2xl font-black text-foreground tracking-tight">RC Nuts Admin</h1>
          <p className="text-sm text-muted-foreground mt-1.5">لوحة تحكم المدير </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">تسجيل الدخول</h2>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-2xl mb-5 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground" htmlFor="username">
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={locked}
                dir="ltr"
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground" htmlFor="password">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={locked}
                  dir="ltr"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                onClick={() => setRememberMe(v => !v)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? "bg-primary border-primary" : "border-border bg-background group-hover:border-primary/50"}`}
              >
                {rememberMe && <span className="text-primary-foreground text-xs font-black">✓</span>}
              </div>
              <span className="text-sm text-foreground">تذكرني لمدة 24 ساعة</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || locked}
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {locked ? "مقفل مؤقتاً..." : "دخول"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          RC Nuts © {new Date().getFullYear()} — منصة البيع الإلكتروني
        </p>
      </motion.div>
    </div>
  );
}