import React, { useState, useEffect } from 'react';
import { debtAPI } from '../services/api';
import { formatRupiah, parseRupiah } from '../utils/currencyUtils';

function DebtManagementPage() {
    const [debts, setDebts] = useState([]);
    const [filteredDebts, setFilteredDebts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [formData, setFormData] = useState({
        namaPenghutang: '',
        totalHutang: '',
        cicilanPerBulan: '',
        tanggalJatuhTempo: '',
        catatan: ''
    });
    const [paymentData, setPaymentData] = useState({
        jumlahPembayaran: '',
        tanggalPembayaran: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadDebts();
    }, []);

    useEffect(() => {
        filterDebts();
    }, [debts, searchQuery, filterStatus]);

    const loadDebts = async () => {
        try {
            const response = await debtAPI.getAll();
            setDebts(response.data);
        } catch (error) {
            showMessage('error', 'Failed to load debts');
        }
    };

    const filterDebts = () => {
        let filtered = debts;

        // Filter by status
        if (filterStatus !== 'All') {
            filtered = filtered.filter(d => d.status === filterStatus);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(d =>
                d.namaPenghutang.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredDebts(filtered);
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const openAddModal = () => {
        setEditingDebt(null);
        setFormData({
            namaPenghutang: '',
            totalHutang: '',
            cicilanPerBulan: '',
            tanggalJatuhTempo: '',
            catatan: ''
        });
        setShowModal(true);
    };

    const openEditModal = (debt) => {
        setEditingDebt(debt);
        setFormData({
            namaPenghutang: debt.namaPenghutang,
            totalHutang: formatRupiah(debt.totalHutang),
            cicilanPerBulan: formatRupiah(debt.cicilanPerBulan),
            tanggalJatuhTempo: debt.tanggalJatuhTempo,
            catatan: debt.catatan
        });
        setShowModal(true);
    };

    const openPaymentModal = (debt) => {
        setSelectedDebt(debt);
        setPaymentData({
            jumlahPembayaran: formatRupiah(debt.cicilanPerBulan),
            tanggalPembayaran: new Date().toISOString().split('T')[0]
        });
        setShowPaymentModal(true);
    };

    const openHistoryModal = (debt) => {
        setSelectedDebt(debt);
        setShowHistoryModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const debtData = {
                namaPenghutang: formData.namaPenghutang,
                totalHutang: parseRupiah(formData.totalHutang),
                cicilanPerBulan: parseRupiah(formData.cicilanPerBulan),
                tanggalJatuhTempo: formData.tanggalJatuhTempo,
                catatan: formData.catatan
            };

            if (editingDebt) {
                await debtAPI.update(editingDebt.id, debtData);
                showMessage('success', 'Debt updated successfully');
            } else {
                await debtAPI.create(debtData);
                showMessage('success', 'Debt added successfully');
            }

            setShowModal(false);
            loadDebts();
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await debtAPI.recordPayment(selectedDebt.id, {
                jumlahPembayaran: parseRupiah(paymentData.jumlahPembayaran),
                tanggalPembayaran: paymentData.tanggalPembayaran
            });

            showMessage('success', 'Payment recorded successfully');
            setShowPaymentModal(false);
            loadDebts();
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Payment recording failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Are you sure you want to delete debt for ${nama}?`)) {
            return;
        }

        try {
            await debtAPI.delete(id);
            showMessage('success', 'Debt deleted successfully');
            loadDebts();
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Delete failed');
        }
    };

    // Calculate statistics
    const stats = {
        totalActiveDebt: filteredDebts
            .filter(d => d.status === 'Aktif')
            .reduce((sum, d) => sum + d.sisaHutang, 0),
        totalPaid: filteredDebts
            .reduce((sum, d) => sum + (d.totalHutang - d.sisaHutang), 0),
        overdue: filteredDebts.filter(d => d.status === 'Jatuh Tempo').length
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Lunas':
                return 'bg-green-500/20 text-green-300 border border-green-500/30';
            case 'Jatuh Tempo':
                return 'bg-red-500/20 text-red-300 border border-red-500/30';
            default:
                return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        }
    };

    return (
        <div className="animate-slide-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">💳</span>
                    <h1 className="text-4xl font-extrabold text-white">Debt Management</h1>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl transition shadow-glow"
                >
                    ➕ Add Debt
                </button>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl font-semibold animate-slide-in ${message.type === 'success'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card-dark p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">💰</span>
                        <div>
                            <p className="text-gray-400 text-sm font-semibold">Total Active Debt</p>
                            <p className="text-2xl font-extrabold text-yellow-300">
                                Rp {stats.totalActiveDebt.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-dark p-6 border-l-4 border-green-500">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">✅</span>
                        <div>
                            <p className="text-gray-400 text-sm font-semibold">Total Paid</p>
                            <p className="text-2xl font-extrabold text-green-300">
                                Rp {stats.totalPaid.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-dark p-6 border-l-4 border-red-500">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⚠️</span>
                        <div>
                            <p className="text-gray-400 text-sm font-semibold">Overdue Debts</p>
                            <p className="text-2xl font-extrabold text-red-300">
                                {stats.overdue} {stats.overdue === 1 ? 'debt' : 'debts'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by debtor name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full glass-dark border border-primary/30 rounded-xl pl-14 pr-12 py-4 text-white text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    {['All', 'Aktif', 'Lunas', 'Jatuh Tempo'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-3 rounded-xl font-bold transition ${filterStatus === status
                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                                : 'glass-dark text-gray-400 hover:text-white border border-gray-600'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card-dark overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/30">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Debtor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Total Debt</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Remaining</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Monthly Payment</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {filteredDebts.map((debt) => (
                                <tr key={debt.id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4 text-sm">
                                        <div>
                                            <div className="text-white font-bold">{debt.namaPenghutang}</div>
                                            {debt.catatan && (
                                                <div className="text-gray-400 text-xs mt-1">{debt.catatan}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        Rp {debt.totalHutang.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="font-bold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">
                                            Rp {debt.sisaHutang.toLocaleString('id-ID')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        Rp {debt.cicilanPerBulan.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {new Date(debt.tanggalJatuhTempo).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadge(debt.status)}`}>
                                            {debt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            {debt.status !== 'Lunas' && (
                                                <button
                                                    onClick={() => openPaymentModal(debt)}
                                                    className="text-green-400 hover:text-green-300 font-bold hover:scale-110 transition"
                                                >
                                                    💵 Pay
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEditModal(debt)}
                                                className="text-primary hover:text-primary-light font-bold hover:scale-110 transition"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => openHistoryModal(debt)}
                                                className="text-blue-400 hover:text-blue-300 font-bold hover:scale-110 transition"
                                            >
                                                📜 History
                                            </button>
                                            <button
                                                onClick={() => handleDelete(debt.id, debt.namaPenghutang)}
                                                className="text-red-400 hover:text-red-300 font-bold hover:scale-110 transition"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredDebts.length === 0 && (
                    <div className="text-center py-16">
                        <span className="text-8xl mb-4 block opacity-30">💳</span>
                        <p className="text-gray-500 font-medium text-lg">
                            {searchQuery || filterStatus !== 'All' ? 'No debts found with the current filter' : 'No debts recorded. Add your first debt!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add/Edit Debt Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="card-dark p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-in">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{editingDebt ? '✏️' : '➕'}</span>
                            <h2 className="text-3xl font-extrabold text-white">
                                {editingDebt ? 'Edit Debt' : 'Add New Debt'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Debtor Name</label>
                                    <input
                                        type="text"
                                        value={formData.namaPenghutang}
                                        onChange={(e) => setFormData({ ...formData, namaPenghutang: e.target.value })}
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Total Debt</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                        <input
                                            type="text"
                                            value={formData.totalHutang}
                                            onChange={(e) => setFormData({ ...formData, totalHutang: formatRupiah(e.target.value) })}
                                            placeholder="1.000.000"
                                            className="w-full glass-dark border border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Monthly Payment</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                        <input
                                            type="text"
                                            value={formData.cicilanPerBulan}
                                            onChange={(e) => setFormData({ ...formData, cicilanPerBulan: formatRupiah(e.target.value) })}
                                            placeholder="100.000"
                                            className="w-full glass-dark border border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.tanggalJatuhTempo}
                                        onChange={(e) => setFormData({ ...formData, tanggalJatuhTempo: e.target.value })}
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Notes (Optional)</label>
                                    <textarea
                                        value={formData.catatan}
                                        onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                                        rows="3"
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 glass-dark hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition border border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 rounded-xl transition shadow-glow disabled:opacity-50"
                                >
                                    {loading ? '⏳ Saving...' : editingDebt ? '✅ Update' : '✅ Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedDebt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="card-dark p-8 max-w-md w-full animate-slide-in">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">💵</span>
                            <h2 className="text-3xl font-extrabold text-white">Record Payment</h2>
                        </div>

                        <div className="mb-6 p-4 glass-dark rounded-xl border border-primary/30">
                            <p className="text-gray-400 text-sm mb-2">Debtor</p>
                            <p className="text-white font-bold text-lg mb-3">{selectedDebt.namaPenghutang}</p>
                            <p className="text-gray-400 text-sm mb-2">Remaining Debt</p>
                            <p className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">
                                Rp {selectedDebt.sisaHutang.toLocaleString('id-ID')}
                            </p>
                        </div>

                        <form onSubmit={handlePayment}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Payment Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                        <input
                                            type="text"
                                            value={paymentData.jumlahPembayaran}
                                            onChange={(e) => setPaymentData({ ...paymentData, jumlahPembayaran: formatRupiah(e.target.value) })}
                                            placeholder="100.000"
                                            className="w-full glass-dark border border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Payment Date</label>
                                    <input
                                        type="date"
                                        value={paymentData.tanggalPembayaran}
                                        onChange={(e) => setPaymentData({ ...paymentData, tanggalPembayaran: e.target.value })}
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 glass-dark hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition border border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-bold py-3 rounded-xl transition shadow-glow disabled:opacity-50"
                                >
                                    {loading ? '⏳ Processing...' : '✅ Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* History Modal */}
            {showHistoryModal && selectedDebt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="card-dark p-8 max-w-lg w-full animate-slide-in">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">📜</span>
                            <h2 className="text-3xl font-extrabold text-white">Payment History</h2>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-400 text-sm">Debtor</p>
                            <p className="text-white font-bold text-lg">{selectedDebt.namaPenghutang}</p>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-6">
                            {selectedDebt.riwayatPembayaran ? (
                                selectedDebt.riwayatPembayaran.split(';').map((entry, index) => {
                                    const [date, amount] = entry.trim().split(':');
                                    return (
                                        <div key={index} className="glass-dark p-3 rounded-lg flex justify-between items-center">
                                            <span className="text-gray-300">{date}</span>
                                            <span className="font-bold text-green-300">{amount}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 italic">No payment history available</p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowHistoryModal(false)}
                            className="w-full glass-dark hover:bg-white/10 text-white font-bold py-3 rounded-xl transition border border-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DebtManagementPage;
