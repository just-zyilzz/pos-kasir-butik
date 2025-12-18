import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CashierPage from './pages/CashierPage';
import DashboardPage from './pages/DashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import DebtManagementPage from './pages/DebtManagementPage';

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
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
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
        <div className="min-h-screen bg-[#0f0f1e]">
            {/* Dark gradient background */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] -z-10" />

            {/* Subtle grid pattern */}
            <div className="fixed inset-0 opacity-5 -z-10" style={{
                backgroundImage: 'radial-gradient(circle, #667eea 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }} />

            {/* Dark glass navbar */}
            <nav className="glass-dark sticky top-0 z-50 animate-slide-in border-b border-primary/20">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-glow animate-float">
                                <span className="text-3xl">🛍️</span>
                            </div>
                            <div>
                                <h1 className="text-white text-2xl font-extrabold tracking-tight">
                                    POS <span className="bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">System</span>
                                </h1>
                                <p className="text-gray-400 text-xs font-medium">Clothing Store Dashboard</p>
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
            <main className="container mx-auto px-6 py-8">
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
            <footer className="py-8 text-center">
                <p className="text-gray-500 text-sm font-medium">
                    Made with <span className="text-accent-pink animate-pulse">💜</span> for Gen Z by POS System
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
