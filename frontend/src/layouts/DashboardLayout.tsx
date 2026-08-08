import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Archive, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';

export function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Inventory', href: '/inventory', icon: Archive, roles: ['ADMIN', 'SALES', 'WAREHOUSE'] },
    { name: 'Challans', href: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  const allowedNav = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 border-r border-white/10",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 bg-slate-950/50 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg font-bold text-white shadow-primary-500/30">
              E
            </div>
            <span className="text-lg font-bold tracking-tight">Mini ERP</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1.5 px-3">
          {allowedNav.map((item) => {
            const isActive = location.pathname === item.href || 
                             (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                  isActive 
                    ? "text-white bg-primary-600/10" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary-600/20 border border-primary-500/30 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors z-10",
                  isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="z-10">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto text-primary-400 z-10" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-lg px-4 sm:px-6 sticky top-0 z-30">
          <button 
            className="text-slate-500 hover:text-slate-700 transition-colors lg:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 text-slate-600 shadow-sm">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</span>
                <span className="text-xs text-slate-500 mt-1 font-medium">{user?.role}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 mx-2" />
              <button 
                onClick={handleLogout}
                className="rounded-full p-2 text-slate-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content with Animations */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
