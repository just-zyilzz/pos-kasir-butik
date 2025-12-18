import React, { useState, useEffect } from 'react';
import { productAPI, transactionAPI } from '../services/api';
import { shareTransactionToWhatsApp } from '../utils/whatsappUtils';

function CashierPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [lastTransaction, setLastTransaction] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async (search = '') => {
        try {
            const response = await productAPI.getAll(search);
            if (response.data.success) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            showMessage('error', 'Failed to load products');
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        loadProducts(query);
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.sku === product.sku);

        if (existingItem) {
            if (existingItem.qty >= product.stokSekarang) {
                showMessage('error', `Insufficient stock for ${product.nama}`);
                return;
            }
            setCart(cart.map(item =>
                item.sku === product.sku
                    ? { ...item, qty: item.qty + 1 }
                    : item
            ));
        } else {
            if (product.stokSekarang < 1) {
                showMessage('error', `${product.nama} is out of stock`);
                return;
            }
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const updateQuantity = (sku, newQty) => {
        const product = products.find(p => p.sku === sku);

        if (newQty < 1) {
            setCart(cart.filter(item => item.sku !== sku));
            return;
        }

        if (newQty > product.stokSekarang) {
            showMessage('error', `Only ${product.stokSekarang} items available`);
            return;
        }

        setCart(cart.map(item =>
            item.sku === sku ? { ...item, qty: newQty } : item
        ));
    };

    const removeFromCart = (sku) => {
        setCart(cart.filter(item => item.sku !== sku));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.hargaJual * item.qty), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            showMessage('error', 'Cart is empty');
            return;
        }

        setLoading(true);
        try {
            const transactionData = {
                items: cart.map(item => ({
                    sku: item.sku,
                    qty: item.qty,
                })),
                paymentMethod: paymentMethod,
            };

            const response = await transactionAPI.create(transactionData);

            if (response.data.success) {
                // Capture transaction data for WhatsApp sharing
                const completedTransaction = {
                    date: new Date().toLocaleDateString('id-ID'),
                    items: cart,
                    total: calculateTotal(),
                    paymentMethod: paymentMethod,
                    itemCount: cart.reduce((sum, item) => sum + item.qty, 0)
                };

                setLastTransaction(completedTransaction);
                showMessage('success', 'Transaction completed successfully!');
                setCart([]);
                loadProducts();
            }
        } catch (error) {
            console.error('Transaction error:', error);
            showMessage('error', error.response?.data?.error || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    const handleShareWhatsApp = () => {
        if (lastTransaction) {
            shareTransactionToWhatsApp(lastTransaction);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products List */}
            <div className="lg:col-span-2">
                <div className="card-dark p-6 animate-slide-in">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">🛒</span>
                        <h2 className="text-3xl font-extrabold text-white">Products</h2>
                    </div>

                    {message.text && (
                        <div className={`mb-4 p-4 rounded-xl font-semibold animate-slide-in ${message.type === 'success'
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                            : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30'
                            }`}>
                            <div className="flex items-center justify-between">
                                <span>{message.text}</span>
                                {message.type === 'success' && lastTransaction && (
                                    <button
                                        onClick={handleShareWhatsApp}
                                        className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
                                    >
                                        <span>📱</span>
                                        Share to WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full glass-dark border border-primary/30 rounded-xl pl-14 pr-12 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredProducts.map(product => (
                            <div
                                key={product.sku}
                                className="card-dark p-5 hover:scale-105 cursor-pointer group"
                                onClick={() => addToCart(product)}
                            >
                                {/* Product Image */}
                                <div className="mb-4">
                                    {product.imageUrl ? (
                                        <img
                                            src={`http://localhost:5000${product.imageUrl}`}
                                            alt={product.nama}
                                            className="w-full h-40 object-cover rounded-lg border-2 border-primary/30"
                                        />
                                    ) : (
                                        <div className="w-full h-40 rounded-lg bg-gray-700 flex items-center justify-center">
                                            <span className="text-6xl opacity-50">📦</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-white text-lg group-hover:text-primary transition">{product.nama}</h3>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.stokSekarang > 10 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                        product.stokSekarang > 0 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                            'bg-red-500/20 text-red-300 border border-red-500/30'
                                        }`}>
                                        Stock: {product.stokSekarang}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">SKU: {product.sku}</p>
                                <p className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">
                                    Rp {product.hargaJual.toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
                <div className="card-dark p-6 sticky top-24 animate-slide-in">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">🛍️</span>
                        <h2 className="text-3xl font-extrabold text-white">Cart</h2>
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block opacity-30">🛒</span>
                            <p className="text-gray-500 font-medium">Cart is empty</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.sku} className="glass-dark p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-sm">{item.nama}</h4>
                                            <button
                                                onClick={() => removeFromCart(item.sku)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold hover:scale-110 transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">SKU: {item.sku}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.sku, item.qty - 1)}
                                                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-80 text-white w-8 h-8 rounded-lg font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="font-bold text-white text-lg w-8 text-center">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.sku, item.qty + 1)}
                                                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-80 text-white w-8 h-8 rounded-lg font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="font-bold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent text-lg">
                                                Rp {(item.hargaJual * item.qty).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-700/50 pt-4 mb-4">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-xl font-bold text-gray-300">Total:</span>
                                    <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">
                                        Rp {calculateTotal().toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold mb-3 text-gray-300">Payment Method</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`flex-1 py-3 rounded-xl font-bold transition ${paymentMethod === 'cash'
                                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                                                : 'glass-dark text-gray-300 hover:border-primary/50'
                                                }`}
                                        >
                                            💵 Cash
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('debt')}
                                            className={`flex-1 py-3 rounded-xl font-bold transition ${paymentMethod === 'debt'
                                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                                                : 'glass-dark text-gray-300 hover:border-primary/50'
                                                }`}
                                        >
                                            💳 Debt
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-extrabold py-4 rounded-xl transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                >
                                    {loading ? '⏳ Processing...' : '✅ Confirm Transaction'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CashierPage;
