import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CashierPage from './pages/CashierPage';
import DashboardPage from './pages/DashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import DebtManagementPage from './pages/DebtManagementPage';
import LiquidGlass from './components/LiquidGlass'; // Import Liquid Glass

function NavLink({ to, children, icon }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`
        relative px-6 py-3 rounded-xl font-semibold text-sm
        transition-all duration-300 transform hover:scale-105
        ${isActive
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                    : 'text-gray-500 hover:bg-black/5 hover:text-primary' // Updated for light mode
                }
      `}
        >
            <span className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="font-bold">{children}</span>
            </span>
        </Link>
    );
}

function AppContent() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a2e]"> {/* White mode base */}
            <LiquidGlass /> {/* Effect */}

            {/* Light ambient background */}
            <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-white -z-10" />

            {/* Subtle grid pattern - Light */}
            <div className="fixed inset-0 opacity-5 -z-10" style={{
                backgroundImage: 'radial-gradient(circle, #667eea 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }} />

            {/* Light glass navbar */}
            <nav className="glass-dark sticky top-0 z-50 animate-slide-in border-b border-gray-200">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center animate-float">
                                <img src="/logo-iyam.png" alt="iyam logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-[#1a1a2e] text-2xl font-extrabold tracking-tight">
                                    iyam
                                </h1>
                                <p className="text-gray-500 text-xs font-medium">Clothing Store Dashboard</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-2">
                            <NavLink to="/" icon="💰">Cashier</NavLink>
                            <NavLink to="/products" icon="📦">Products</NavLink>
                            <NavLink to="/debts" icon="💳">Debts</NavLink>
                            <NavLink to="/dashboard" icon="📊">Dashboard</NavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 relative z-10">
                <div className="animate-fade-in">
                    <Routes>
                        <Route path="/" element={<CashierPage />} />
                        <Route path="/products" element={<ProductManagementPage />} />
                        <Route path="/debts" element={<DebtManagementPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                    </Routes>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center relative z-10">
                <p className="text-gray-500 text-sm font-medium">
                    Made with <span className="text-accent-pink animate-pulse">💜</span> for <span className="font-bold">iyam</span>
                </p>
            </footer>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
