'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Package, LayoutDashboard, Truck, Store, LogOut, Menu, X, 
  BarChart3, MapPin, ChevronDown, PlusCircle, XCircle, Sun, Moon, Users,
  BarChart2, QrCode, Scan
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarContext } from '@/context/sidebar-context';
import { useTheme } from '@/context/theme-context';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen } = useSidebarContext();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [yummyMenuOpen, setYummyMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Overlay para Mobile con mayor z-index */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Mobile - Fullscreen */}
      <aside className={`
        md:hidden fixed z-50 top-0 left-0 right-0 bottom-0
        ${isMobileOpen ? 'w-full' : 'hidden'}
        ${isDark ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white' : 'bg-gradient-to-b from-white via-gray-50 to-white text-slate-900'}
        h-screen flex flex-col transition-all duration-300
      `}>
        {/* Header Mobile */}
        <motion.div 
          className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800' : 'border-gray-200 bg-gradient-to-r from-white to-gray-50'} sticky top-0 z-50`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="flex items-center gap-3 flex-1 min-w-0"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 flex-shrink-0"
              whileHover={{ rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Package className="w-5 h-5 text-white" />
            </motion.div>
            <div className="min-w-0">
              <h1 className={`text-base font-black tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>Panel Delivery</h1>
              <p className="text-xs text-green-400 font-semibold uppercase mt-0.5">Control</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              whileTap={{ scale: 0.9 }}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </motion.button>
            
            <motion.button
              onClick={() => setIsMobileOpen(false)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-slate-600'}`}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Mobile */}
        <nav className={`flex-1 px-4 py-8 space-y-3 overflow-y-auto scrollbar-hide ${isDark ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            className="space-y-3"
          >
            <NavItemMobile 
              icon={LayoutDashboard} 
              label="Dashboard" 
              href="/admin/dashboard" 
              active={isActive('/admin/dashboard')} 
              onClick={() => handleNavigation('/admin/dashboard')}
              delay={0}
              isDark={isDark}
            />
            <NavItemMobile 
              icon={Package} 
              label="Órdenes" 
              href="/admin/orders" 
              active={isActive('/admin/orders')} 
              onClick={() => handleNavigation('/admin/orders')}
              delay={0.1}
              isDark={isDark}
            />
            <NavItemMobile 
              icon={MapPin} 
              label="Tiendas" 
              href="/admin/stores" 
              active={isActive('/admin/stores')} 
              onClick={() => handleNavigation('/admin/stores')}
              delay={0.2}
              isDark={isDark}
            />
            <NavItemMobile 
              icon={Users} 
              label="Gestionar Usuarios" 
              href="/admin/users" 
              active={isActive('/admin/users')} 
              onClick={() => handleNavigation('/admin/users')}
              delay={0.3}
              isDark={isDark}
            />
            
            {/* SECCIÓN YUMMY MOBILE */}
            <motion.div 
              className="space-y-2 pt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => setYummyMenuOpen(!yummyMenuOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden relative ${
                  pathname.includes('/admin/yummy') 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30' 
                    : isDark ? 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`p-2 rounded-lg transition-all ${
                      pathname.includes('/admin/yummy') ? 'bg-white/20' : isDark ? 'bg-slate-700' : 'bg-gray-300'
                    }`}
                  >
                    <Truck className="w-5 h-5 flex-shrink-0" />
                  </motion.div>
                  <span className="font-bold text-sm md:text-base">Yummy Delivery</span>
                </div>
                <motion.div
                  animate={{ rotate: yummyMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                </motion.div>
              </motion.button>

              {/* Sub-items Yummy */}
              <AnimatePresence>
                {yummyMenuOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-4 space-y-2 overflow-hidden"
                  >
                    <SubNavItemMobile 
                      icon={BarChart3} 
                      label="Trip Status" 
                      active={isActive('/admin/yummy')} 
                      onClick={() => handleNavigation('/admin/yummy')}
                      delay={0}
                      isDark={isDark}
                    />
                    <SubNavItemMobile 
                      icon={PlusCircle} 
                      label="Crear Viaje" 
                      active={isActive('/admin/yummy/crear')} 
                      onClick={() => handleNavigation('/admin/yummy/crear')}
                      delay={0.05}
                      isDark={isDark}
                    />
                    <SubNavItemMobile 
                      icon={XCircle} 
                      label="Cancelar Viaje" 
                      active={isActive('/admin/yummy/cancelar')} 
                      onClick={() => handleNavigation('/admin/yummy/cancelar')}
                      delay={0.1}
                      isDark={isDark}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Otros Items */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, staggerChildren: 0.08 }}
              className="space-y-2 pt-2"
            >
              <NavItemMobile 
                icon={Truck} 
                label="Flety" 
                href="/admin/flety" 
                active={isActive('/admin/flety')} 
                onClick={() => handleNavigation('/admin/flety')}
                delay={0}
                isDark={isDark}
              />
              <NavItemMobile 
                icon={Truck} 
                label="MRW" 
                href="/admin/mrw" 
                active={isActive('/admin/mrw')} 
                onClick={() => handleNavigation('/admin/mrw')}
                delay={0.05}
                isDark={isDark}
              />
            <NavItemMobile 
              icon={Store} 
              label="Pickup" 
              href="/admin/pickup" 
              active={isActive('/admin/pickup')} 
              onClick={() => handleNavigation('/admin/pickup')}
              delay={0.1}
              isDark={isDark}
            />
            </motion.div>

            {/* SECCIÓN INVENTARIO MOBILE */}
            <motion.div 
              className="space-y-2 pt-2 border-t border-slate-700/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-xs font-semibold text-slate-400 uppercase px-4 py-2">Inventario</p>
              <NavItemMobile 
                icon={BarChart2} 
                label="Reportes" 
                href="/admin/inventory" 
                active={isActive('/admin/inventory')} 
                onClick={() => handleNavigation('/admin/inventory')}
                delay={0}
                isDark={isDark}
              />
              <NavItemMobile 
                icon={QrCode} 
                label="Generador QR" 
                href="/admin/qr-generator" 
                active={isActive('/admin/qr-generator')} 
                onClick={() => handleNavigation('/admin/qr-generator')}
                delay={0.05}
                isDark={isDark}
              />
              <NavItemMobile 
                icon={Scan} 
                label="Escanear QR" 
                href="/admin/qr-scanner" 
                active={isActive('/admin/qr-scanner')} 
                onClick={() => handleNavigation('/admin/qr-scanner')}
                delay={0.1}
                isDark={isDark}
              />
            </motion.div>
          </motion.div>
        </nav>

        {/* Footer Mobile */}
        <motion.div 
          className={`border-t ${isDark ? 'border-slate-700/50 bg-gradient-to-t from-slate-950 to-transparent' : 'border-gray-200 bg-gradient-to-t from-gray-50 to-transparent'} p-6`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </motion.button>
        </motion.div>
      </aside>

      {/* Sidebar Desktop */}
      <aside className={`
        hidden md:flex md:static z-auto
        ${isOpen ? 'md:w-64' : 'md:w-20'} 
        ${isDark ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700' : 'bg-gradient-to-b from-white via-gray-50 to-white text-slate-900 border-gray-200'}
        h-screen flex-col transition-all duration-300 border-r
      `}>
        {/* Header */}
        <div className={`p-4 md:p-6 flex items-center justify-between border-b transition-colors ${isDark ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'}`}>
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"><Package className="w-6 h-6 text-white" /></div>
              <div><h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Panel</h1><p className="text-xs text-green-500 font-semibold">Delivery</p></div>
            </div>
          )}
          {!isOpen && <Package className="w-6 h-6 text-green-500 mx-auto" />}
          
          {/* Toggle sidebar en desktop */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`hidden md:block p-1 rounded transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            {isOpen ? <X className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} /> : <Menu className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 px-3 py-6 space-y-2 overflow-y-auto ${isDark ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' : 'bg-white'}`}>
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            href="/admin/dashboard" 
            active={isActive('/admin/dashboard')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/dashboard')}
            isDark={isDark}
          />
          <NavItem 
            icon={Package} 
            label="Órdenes" 
            href="/admin/orders" 
            active={isActive('/admin/orders')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/orders')}
            isDark={isDark}
          />
          <NavItem 
            icon={MapPin} 
            label="Tiendas" 
            href="/admin/stores" 
            active={isActive('/admin/stores')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/stores')}
            isDark={isDark}
          />
          <NavItem 
            icon={Users} 
            label="Gestionar Usuarios" 
            href="/admin/users" 
            active={isActive('/admin/users')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/users')}
            isDark={isDark}
          />
          
          {/* SECCIÓN YUMMY CON LÓGICA DE SUBMENÚ */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (!isOpen) setIsOpen(true);
                setYummyMenuOpen(!yummyMenuOpen);
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname.includes('/admin/yummy') 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30' 
                  : isDark ? 'text-slate-200 hover:bg-slate-700/50' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Yummy Delivery</span>}
              </div>
              {isOpen && <ChevronDown className={`w-4 h-4 transition-transform ${yummyMenuOpen ? 'rotate-180' : ''}`} />}
            </button>

            {/* Renderizado de Sub-items */}
            <AnimatePresence>
              {isOpen && yummyMenuOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-6 space-y-1 overflow-hidden"
                >
                  <SubNavItem 
                    icon={BarChart3} 
                    label="Trip Status" 
                    active={isActive('/admin/yummy')} 
                    onClick={() => handleNavigation('/admin/yummy')}
                    isDark={isDark}
                  />
                  <SubNavItem 
                    icon={PlusCircle} 
                    label="Crear Viaje" 
                    active={isActive('/admin/yummy/crear')} 
                    onClick={() => handleNavigation('/admin/yummy/crear')}
                    isDark={isDark}
                  />
                  <SubNavItem 
                    icon={XCircle} 
                    label="Cancelar Viaje" 
                    active={isActive('/admin/yummy/cancelar')} 
                    onClick={() => handleNavigation('/admin/yummy/cancelar')}
                    isDark={isDark}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavItem 
            icon={Truck} 
            label="Flety" 
            href="/admin/flety" 
            active={isActive('/admin/flety')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/flety')}
            isDark={isDark}
          />
          <NavItem 
            icon={Truck} 
            label="MRW" 
            href="/admin/mrw" 
            active={isActive('/admin/mrw')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/mrw')}
            isDark={isDark}
          />
          <NavItem 
            icon={Store} 
            label="Pickup" 
            href="/admin/pickup" 
            active={isActive('/admin/pickup')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/pickup')}
            isDark={isDark}
          />

          {/* SECCIÓN INVENTARIO DESKTOP */}
          {isOpen && (
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className={`text-xs font-semibold uppercase px-4 py-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Inventario
              </p>
            </div>
          )}
          
          <NavItem 
            icon={BarChart2} 
            label="Reportes" 
            href="/admin/inventory" 
            active={isActive('/admin/inventory')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/inventory')}
            isDark={isDark}
          />
          
          <NavItem 
            icon={QrCode} 
            label="Generador QR" 
            href="/admin/qr-generator" 
            active={isActive('/admin/qr-generator')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/qr-generator')}
            isDark={isDark}
          />
          
          <NavItem 
            icon={Scan} 
            label="Escanear QR" 
            href="/admin/qr-scanner" 
            active={isActive('/admin/qr-scanner')} 
            isOpen={isOpen} 
            onClick={() => handleNavigation('/admin/qr-scanner')}
            isDark={isDark}
          />
        </nav>

        {/* Footer */}
        <div className={`border-t transition-colors p-4 md:p-6 ${isDark ? 'border-slate-700 bg-gradient-to-t from-slate-900 to-transparent' : 'border-gray-200 bg-gradient-to-t from-gray-50 to-transparent'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isDark 
                ? 'text-red-400 hover:bg-red-600/20' 
                : 'text-red-600 hover:bg-red-50'
            } ${isOpen ? '' : 'justify-center'}`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="font-medium">Cerrar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

// Componentes auxiliares
function NavItemMobile({ icon: Icon, label, active, onClick, delay, isDark }: any) {
  return (
    <motion.button 
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden relative ${
        active 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30' 
          : isDark ? 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
      }`}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`p-2 rounded-lg transition-all ${
          active ? 'bg-white/20' : isDark ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-gray-300 group-hover:bg-gray-400'
        }`}
        whileHover={{ rotate: 10 }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
      </motion.div>
      <span className="font-bold text-sm md:text-base flex-1 text-left">{label}</span>
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"
          initial={{ x: 10 }}
          animate={{ x: 0 }}
        />
      )}
    </motion.button>
  );
}

function SubNavItemMobile({ icon: Icon, label, active, onClick, delay, isDark }: any) {
  return (
    <motion.button 
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${
        active 
          ? isDark ? 'text-emerald-400 font-bold bg-slate-800/80 border border-emerald-500/30' : 'text-green-600 font-bold bg-green-50/50 border border-green-200'
          : isDark ? 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100' : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
      }`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </motion.button>
  );
}

function NavItem({ icon: Icon, label, active, isOpen, onClick, isDark }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30' 
          : isDark 
            ? 'text-slate-200 hover:bg-slate-700/50' 
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {isOpen && <span className="font-medium text-sm md:text-base">{label}</span>}
    </button>
  );
}

function SubNavItem({ icon: Icon, label, active, onClick, isDark }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${
        active 
          ? isDark
            ? 'text-emerald-400 font-bold bg-slate-800/80 border border-emerald-500/30'
            : 'text-green-600 font-bold bg-green-50/50 border border-green-200'
          : isDark
            ? 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
            : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
