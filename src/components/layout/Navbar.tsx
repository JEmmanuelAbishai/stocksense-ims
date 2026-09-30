import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useTheme } from '../../context/ThemeContext';

export type NavTab =
  | 'dashboard'
  | 'receipts'
  | 'deliveries'
  | 'transfers'
  | 'adjustments'
  | 'products'
  | 'move_history'
  | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile
}) => {
  const { currentUser } = useAuth();
  const { warehouses, filter, setFilter } = useInventory();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'adjustments', label: 'Adjustments' },
    { id: 'products', label: 'Products' },
    { id: 'move_history', label: 'History' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <header className="bg-[#1e3a34] dark:bg-[#714B67] text-white px-3 sm:px-5 lg:px-6 py-0 flex items-center justify-between border-b border-[#284942] dark:border-[#5c3c54] sticky top-0 z-40 h-[64px] shadow-xs transition-colors duration-200">
      {/* Brand logo & Nav Links */}
      <div className="flex items-center gap-3 xl:gap-6 min-w-0">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 cursor-pointer text-left focus:outline-none shrink-0"
        >
          {/* Logo icon matching Figma */}
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-white font-sans hidden sm:inline">
            StockSense
          </span>
        </button>

        {/* Center Tabs Nav - Spacious & uncluttered */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 h-[64px] min-w-0">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-2 xl:px-3 py-2 text-xs font-medium transition-colors cursor-pointer h-full flex items-center shrink-0 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-emerald-100/80 dark:text-pink-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1.5 right-1.5 h-[3px] bg-white rounded-t-sm" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right User, Theme & Warehouse Area */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
        {/* Quick Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer border border-white/15 focus:outline-none flex items-center justify-center shadow-xs"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 animate-in fade-in duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-emerald-200 animate-in fade-in duration-200" />
          )}
        </button>

        {/* Warehouse Selector */}
        <select
          value={filter.warehouseId}
          onChange={(e) => setFilter(prev => ({ ...prev, warehouseId: e.target.value }))}
          aria-label="Select warehouse"
          className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-white/20 focus:outline-none cursor-pointer hidden md:block max-w-[140px] xl:max-w-[190px] truncate shrink-0"
        >
          {warehouses.map(wh => (
            <option key={wh.id} value={wh.id} className="bg-[#1e3a34] dark:bg-[#714B67] text-white">
              {wh.name}
            </option>
          ))}
        </select>

        {/* User Pill Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-right focus:outline-none shrink-0"
        >
          <div className="hidden sm:block text-right">
            <div className="text-xs font-semibold text-white tracking-tight leading-tight">
              {currentUser?.name || 'Dexter Morgan'}
            </div>
            <div className="text-[10px] text-emerald-200/80 dark:text-pink-200/80 leading-tight">
              {currentUser?.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
            </div>
          </div>
          {/* Avatar circle matching DM initials */}
          <div className="w-8 h-8 rounded-full bg-[#dcece7] dark:bg-[#5c3c54] text-[#1e3a34] dark:text-[#f8d7ee] font-bold text-xs flex items-center justify-center border border-white/30 shadow-xs shrink-0">
            {currentUser?.name
              ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'DM'}
          </div>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-emerald-100 dark:text-pink-100 hover:text-white hover:bg-white/10 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile navigation drop */}
      {mobileMenuOpen && (
        <div className="absolute top-[64px] left-0 right-0 bg-[#1e3a34] dark:bg-[#714B67] border-b border-[#284942] dark:border-[#5c3c54] p-4 flex flex-col gap-1 lg:hidden z-50 shadow-xl">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-xs font-medium ${
                activeTab === item.id ? 'bg-white/20 text-white font-bold' : 'text-emerald-100 dark:text-pink-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
