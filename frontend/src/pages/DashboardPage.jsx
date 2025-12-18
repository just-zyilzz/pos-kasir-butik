import React, { useState, useEffect } from 'react';
import { dashboardAPI, reportAPI, salesAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { shareSalesReportToWhatsApp } from '../utils/whatsappUtils';

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [salesData, setSalesData] = useState({ today: null, weekly: null, monthly: null });
    const [loading, setLoading] = useState(true);
    const [reportDates, setReportDates] = useState({
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, chartRes, salesSummary] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getProfitChart(),
                salesAPI.getSummary(),
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            if (chartRes.data.success) {
                setChartData(chartRes.data.data);
            }

            if (salesSummary.data.success) {
                setSalesData(salesSummary.data.data);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        try {
            const data = {
                startDate: reportDates.startDate || null,
                endDate: reportDates.endDate || null,
            };

            let response;
            let filename;
            let mimeType;

            if (type === 'pdf') {
                response = await reportAPI.generatePDF(data);
                filename = `sales-report-${Date.now()}.pdf`;
                mimeType = 'application/pdf';
            } else {
                response = await reportAPI.generateExcel(data);
                filename = `sales-report-${Date.now()}.xlsx`;
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }

            // Create blob with correct MIME type
            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename; // Use .download instead of .setAttribute for better compatibility
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to generate report');
        }
    };

    const handleShareReport = () => {
        if (salesData.today) {
            const reportData = {
                period: 'Hari Ini - ' + new Date().toLocaleDateString('id-ID'),
                totalRevenue: salesData.today.revenue,
                totalProfit: salesData.today.profit,
                totalTransactions: salesData.today.transactionCount
            };
            shareSalesReportToWhatsApp(reportData);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-2xl text-white font-bold shimmer">⏳ Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">📊</span>
                <h1 className="text-4xl font-extrabold text-white">Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-dark p-6 hover:scale-105 transition">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">💰</span>
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide">Today's Profit</h3>
                    </div>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">
                        Rp {(stats?.profits?.today || 0).toLocaleString('id-ID')}
                    </p>
                </div>

                <div className="card-dark p-6 hover:scale-105 transition">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">📈</span>
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide">Last 7 Days</h3>
                    </div>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Rp {(stats?.profits?.last7Days || 0).toLocaleString('id-ID')}
                    </p>
                </div>

                <div className="card-dark p-6 hover:scale-105 transition">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">💜</span>
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide">Monthly Profit</h3>
                    </div>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-secondary to-accent-purple bg-clip-text text-transparent">
                        Rp {(stats?.profits?.monthly || 0).toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            {/* Sales Statistics Section */}
            <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">💸</span>
                    <h2 className="text-3xl font-extrabold text-white">Sales Statistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Today Sales */}
                    <div className="glass-dark border border-blue-500/30 rounded-xl p-5 hover:border-blue-500/50 transition">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">📅</span>
                            <h3 className="font-bold text-blue-300 text-lg">Hari Ini</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Revenue</p>
                                <p className="text-2xl font-bold text-white">Rp {(salesData.today?.revenue || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Profit</p>
                                <p className="text-xl font-bold text-green-400">Rp {(salesData.today?.profit || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Items</p>
                                    <p className="text-lg font-bold text-blue-300">{salesData.today?.itemsSold || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Transaksi</p>
                                    <p className="text-lg font-bold text-purple-300">{salesData.today?.transactionCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Sales */}
                    <div className="glass-dark border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 transition">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">📆</span>
                            <h3 className="font-bold text-purple-300 text-lg">7 Hari Terakhir</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Revenue</p>
                                <p className="text-2xl font-bold text-white">Rp {(salesData.weekly?.totalRevenue || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Profit</p>
                                <p className="text-xl font-bold text-green-400">Rp {(salesData.weekly?.totalProfit || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Items</p>
                                    <p className="text-lg font-bold text-blue-300">{salesData.weekly?.totalItems || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Transaksi</p>
                                    <p className="text-lg font-bold text-purple-300">{salesData.weekly?.totalTransactions || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Sales */}
                    <div className="glass-dark border border-pink-500/30 rounded-xl p-5 hover:border-pink-500/50 transition">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🗓️</span>
                            <h3 className="font-bold text-pink-300 text-lg">30 Hari Terakhir</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Revenue</p>
                                <p className="text-2xl font-bold text-white">Rp {(salesData.monthly?.totalRevenue || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Profit</p>
                                <p className="text-xl font-bold text-green-400">Rp {(salesData.monthly?.totalProfit || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Items</p>
                                    <p className="text-lg font-bold text-blue-300">{salesData.monthly?.totalItems || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Transaksi</p>
                                    <p className="text-lg font-bold text-purple-300">{salesData.monthly?.totalTransactions || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Trend Chart */}
            {salesData.weekly?.dailyBreakdown && (
                <div className="card-dark p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">📈</span>
                        <h2 className="text-3xl font-extrabold text-white">Tren Penjualan 7 Hari</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData.weekly.dailyBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="dayName" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #667eea', borderRadius: '12px' }}
                                labelStyle={{ color: '#ffffff' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="profit" stroke="#667eea" strokeWidth={3} name="Profit" />
                            <Line type="monotone" dataKey="revenue" stroke="#764ba2" strokeWidth={2} name="Revenue" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Profit Chart */}
            <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">📊</span>
                    <h2 className="text-3xl font-extrabold text-white">Profit Analysis</h2>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="period" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #667eea', borderRadius: '12px' }}
                            labelStyle={{ color: '#ffffff' }}
                        />
                        <Legend />
                        <Bar dataKey="profit" fill="url(#colorGradient)" name="Profit (Rp)" radius={[8, 8, 0, 0]} />
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#667eea" stopOpacity={1} />
                                <stop offset="100%" stopColor="#764ba2" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Inventory Summary */}
            <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">📦</span>
                    <h2 className="text-3xl font-extrabold text-white">Inventory Summary</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="glass-dark border border-primary/30 rounded-xl p-5">
                        <p className="text-gray-400 text-sm font-bold mb-2">Total Stock</p>
                        <p className="text-3xl font-extrabold text-white">
                            {stats?.inventory?.totalStock || 0} <span className="text-lg text-gray-500">items</span>
                        </p>
                    </div>
                    <div className="glass-dark border border-yellow-500/30 rounded-xl p-5">
                        <p className="text-gray-400 text-sm font-bold mb-2">Low Stock Products</p>
                        <p className="text-3xl font-extrabold text-yellow-400">
                            {stats?.inventory?.lowStockCount || 0} <span className="text-lg text-gray-500">products</span>
                        </p>
                    </div>
                </div>

                {stats?.inventory?.lowStockProducts?.length > 0 && (
                    <div>
                        <h3 className="font-bold text-white mb-4 text-lg">⚠️ Low Stock Items:</h3>
                        <div className="space-y-3">
                            {stats.inventory.lowStockProducts.map(product => (
                                <div key={product.sku} className="flex justify-between items-center glass-dark border border-yellow-500/30 rounded-xl p-4 hover:border-yellow-500/50 transition">
                                    <div>
                                        <p className="font-bold text-white text-lg">{product.nama}</p>
                                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                    </div>
                                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                                        {product.stokSekarang} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Report Export */}
            <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">📄</span>
                    <h2 className="text-3xl font-extrabold text-white">Export Reports</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Start Date</label>
                        <input
                            type="date"
                            value={reportDates.startDate}
                            onChange={(e) => setReportDates({ ...reportDates, startDate: e.target.value })}
                            className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">End Date</label>
                        <input
                            type="date"
                            value={reportDates.endDate}
                            onChange={(e) => setReportDates({ ...reportDates, endDate: e.target.value })}
                            className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition shadow-glow"
                    >
                        📄 Export PDF
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition shadow-glow"
                    >
                        📊 Export Excel
                    </button>
                    <button
                        onClick={handleShareReport}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition shadow-glow"
                    >
                        📱 Share WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
