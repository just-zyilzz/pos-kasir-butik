import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { formatRupiah, parseRupiah } from '../utils/currencyUtils';

function ProductManagementPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        nama: '',
        hpp: '',
        hargaJual: '',
        stokAwal: '',
        stokSekarang: '',
    });

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

    const openAddModal = () => {
        setEditingProduct(null);
        setImagePreview(null);
        setSelectedImageFile(null);
        setFormData({
            sku: '',
            nama: '',
            hpp: '',
            hargaJual: '',
            stokAwal: '',
            stokSekarang: '',
        });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setImagePreview(product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null);
        setSelectedImageFile(null);
        setFormData({
            sku: product.sku,
            nama: product.nama,
            hpp: formatRupiah(product.hpp),
            hargaJual: formatRupiah(product.hargaJual),
            stokAwal: product.stokAwal,
            stokSekarang: product.stokSekarang,
        });
        setShowModal(true);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingProduct) {
                await productAPI.update(formData.sku, {
                    nama: formData.nama,
                    hpp: parseRupiah(formData.hpp),
                    hargaJual: parseRupiah(formData.hargaJual),
                    stokAwal: parseInt(formData.stokAwal),
                    stokSekarang: parseInt(formData.stokSekarang),
                });

                // Upload image if selected
                if (selectedImageFile) {
                    setUploadingImage(true);
                    await productAPI.uploadImage(formData.sku, selectedImageFile);
                    setUploadingImage(false);
                }

                showMessage('success', 'Product updated successfully');
            } else {
                await productAPI.create({
                    sku: formData.sku,
                    nama: formData.nama,
                    hpp: parseRupiah(formData.hpp),
                    hargaJual: parseRupiah(formData.hargaJual),
                    stokAwal: parseInt(formData.stokAwal),
                });

                // Upload image if selected
                if (selectedImageFile) {
                    setUploadingImage(true);
                    await productAPI.uploadImage(formData.sku, selectedImageFile);
                    setUploadingImage(false);
                }

                showMessage('success', 'Product added successfully');
            }

            setShowModal(false);
            loadProducts(searchQuery);
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    const handleDelete = async (sku, nama) => {
        if (!window.confirm(`Are you sure you want to delete ${nama}?`)) {
            return;
        }

        try {
            await productAPI.delete(sku);
            showMessage('success', 'Product deleted successfully');
            loadProducts(searchQuery);
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Delete failed');
        }
    };

    return (
        <div className="animate-slide-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">📦</span>
                    <h1 className="text-4xl font-extrabold text-white">Product Management</h1>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl transition shadow-glow"
                >
                    ➕ Add Product
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

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
                    <input
                        type="text"
                        placeholder="Cari produk berdasarkan nama atau SKU..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full glass-dark border border-primary/30 rounded-xl pl-14 pr-12 py-4 text-white text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
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

            <div className="card-dark overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/30">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">HPP</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Selling Price</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Initial Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Current Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {filteredProducts.map((product) => (
                                <tr key={product.sku} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4 text-sm">
                                        {product.imageUrl ? (
                                            <img
                                                src={`http://localhost:5000${product.imageUrl}`}
                                                alt={product.nama}
                                                className="w-16 h-16 object-cover rounded-lg border-2 border-primary/30"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">
                                                📦
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 font-semibold">{product.sku}</td>
                                    <td className="px-6 py-4 text-sm text-white font-bold">{product.nama}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">Rp {product.hpp.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-sm font-bold bg-gradient-to-r from-primary to-accent-pink bg-clip-text text-transparent">
                                        Rp {product.hargaJual.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{product.stokAwal}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${product.stokSekarang > 10 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                            product.stokSekarang > 0 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                                'bg-red-500/20 text-red-300 border border-red-500/30'
                                            }`}>
                                            {product.stokSekarang}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="text-primary hover:text-primary-light font-bold mr-4 hover:scale-110 transition"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.sku, product.nama)}
                                            className="text-red-400 hover:text-red-300 font-bold hover:scale-110 transition"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <span className="text-8xl mb-4 block opacity-30">📦</span>
                        <p className="text-gray-500 font-medium text-lg">
                            {searchQuery ? `Tidak ada produk ditemukan untuk "${searchQuery}"` : 'No products found. Add your first product!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Dark Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="card-dark p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-in">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{editingProduct ? '✏️' : '➕'}</span>
                            <h2 className="text-3xl font-extrabold text-white">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        disabled={editingProduct !== null}
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">HPP (Cost Price)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                        <input
                                            type="text"
                                            value={formData.hpp}
                                            onChange={(e) => setFormData({ ...formData, hpp: formatRupiah(e.target.value) })}
                                            placeholder="50.000"
                                            className="w-full glass-dark border border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Selling Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                        <input
                                            type="text"
                                            value={formData.hargaJual}
                                            onChange={(e) => setFormData({ ...formData, hargaJual: formatRupiah(e.target.value) })}
                                            placeholder="80.000"
                                            className="w-full glass-dark border border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Initial Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stokAwal}
                                        onChange={(e) => setFormData({ ...formData, stokAwal: e.target.value })}
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>

                                {editingProduct && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Current Stock</label>
                                        <input
                                            type="number"
                                            value={formData.stokSekarang}
                                            onChange={(e) => setFormData({ ...formData, stokSekarang: e.target.value })}
                                            className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="w-full glass-dark border border-primary/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                                    />
                                    {imagePreview && (
                                        <div className="mt-3">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-xl border-2 border-primary/50"
                                            />
                                        </div>
                                    )}
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
                                    disabled={loading || uploadingImage}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 rounded-xl transition shadow-glow disabled:opacity-50"
                                >
                                    {uploadingImage ? '⏳ Uploading Image...' : loading ? '⏳ Saving...' : editingProduct ? '✅ Update' : '✅ Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductManagementPage;
