import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simple admin auth check (stored in siteSettings)
      const storedAdmin = localStorage.getItem("admin_credentials");
      
      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin);
        if (username === admin.username && password === admin.password) {
          // Set session
          if (rememberMe) {
            localStorage.setItem("admin_session", JSON.stringify({ username, loginTime: Date.now() }));
          } else {
            sessionStorage.setItem("admin_session", JSON.stringify({ username, loginTime: Date.now() }));
          }
          navigate("/admin");
          return;
        }
      }

      // Check default admin (first time setup)
      if (!storedAdmin && username === "admin" && password === "admin123") {
        const adminData = { username: "admin", password: "admin123" };
        localStorage.setItem("admin_credentials", JSON.stringify(adminData));
        if (rememberMe) {
          localStorage.setItem("admin_session", JSON.stringify({ username, loginTime: Date.now() }));
        } else {
          sessionStorage.setItem("admin_session", JSON.stringify({ username, loginTime: Date.now() }));
        }
        navigate("/admin");
        return;
      }

      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    } catch (err) {
      setError("حدث خطأ يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  // Check if already logged in
  const adminSession = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
  if (adminSession) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="RC Nuts" 
            className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg" 
          />
          <h1 className="text-2xl font-bold text-primary font-serif">RC Nuts</h1>
          <p className="text-sm text-muted-foreground mt-1">لوحة تحكم المدير</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">تسجيل الدخول</h2>
          
          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="أدخل اسم المستخدم"
                required
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                  placeholder="أدخل كلمة المرور"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <label htmlFor="rememberMe" className="text-sm text-foreground cursor-pointer">
                تذكرني
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              تسجيل الدخول
            </button>
          </form>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← العودة للمتجر
          </Link>
        </div>
      </div>
    </div>
  );
}