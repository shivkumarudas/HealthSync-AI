"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Apple, Dumbbell,
  MessageCircle, Stethoscope, Shield, LogOut, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/utils";

interface NavUser {
  username: string;
  role: string;
}

const NAV_LINKS = [
  { href: "/dashboard",        label: "Dashboard",  icon: LayoutDashboard },
  { href: "/report-analyzer",  label: "Reports",    icon: FileText        },
  { href: "/diet-planner",     label: "Diet",       icon: Apple           },
  { href: "/exercise-planner", label: "Exercise",   icon: Dumbbell        },
  { href: "/chatbot",          label: "AI Chat",    icon: MessageCircle   },
  { href: "/doctors",          label: "Doctors",    icon: Stethoscope     },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check session from Flask cookie via profile endpoint
    fetch(`${API_BASE}/api/profile`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          // Get username from session cookie or from a lightweight endpoint
          fetch(`${API_BASE}/api/me`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : null))
            .then((me) => { if (me) setUser(me); });
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { credentials: "include", redirect: "manual" });
    // Clear any local data
    localStorage.removeItem("hs_chat_history");
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const isAuth = !!user;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-gray-950/95 backdrop-blur-md border-b border-gray-800 shadow-xl shadow-black/30"
          : "bg-gray-950/80 backdrop-blur-sm border-b border-gray-900"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🩺</span>
          <span className="text-lg font-bold text-primary-400 group-hover:text-primary-300 transition-colors">
            HealthSync <span className="text-white">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {isAuth && NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "bg-primary-950/60 text-primary-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          {isAuth && user?.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === "/admin"
                  ? "bg-yellow-950 text-yellow-400"
                  : "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-950/30"
              )}
            >
              <Shield size={15} /> Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAuth ? (
            <>
              <span className="text-sm text-gray-400">
                Hi, <span className="text-primary-400 font-semibold">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 hover:border-red-700 text-gray-400 hover:text-red-400 rounded-lg text-sm transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm px-4 py-2">Login</Link>
              <Link href="/login?tab=register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-gray-800 bg-gray-950"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuth ? (
                <>
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        pathname === href
                          ? "bg-primary-950/60 text-primary-400"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      <Icon size={16} /> {label}
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-yellow-400 hover:bg-yellow-950/30">
                      <Shield size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between px-3">
                    <span className="text-sm text-gray-400">{user?.username}</span>
                    <button onClick={handleLogout} className="text-red-400 text-sm hover:text-red-300">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 text-sm">Login</Link>
                  <Link href="/login?tab=register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-primary-400 hover:bg-gray-800 text-sm font-medium">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
