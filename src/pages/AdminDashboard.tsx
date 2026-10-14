import React, { useState, useEffect } from 'react';
import {
  AdminDashboardStats,
  Order,
  OrderStatus,
  Product,
  SiteSettings,
} from '../types';
import {
  getAdminDashboard,
  getAdminOrders,
  getAdminProducts,
  getAdminSettings,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminSettings,
  changeAdminPassword,
  adminLogout,
} from '../lib/api';
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  Printer,
  Download,
  Settings,
  LogOut,
  Edit,
  Save,
  KeyRound,
  AlertCircle,
  Eye,
  X,
  Store,
} from 'lucide-react';

interface AdminDashboardProps {
  user: { id: number; username: string };
  onLogout: () => void;
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'settings'>('overview');

  // Overview stats
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  // Orders list
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Settings
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Load initial data
  const loadDashboard = async () => {
    const res = await getAdminDashboard();
    if (res.success && res.data) setStats(res.data);
  };

  const loadOrders = async () => {
    const res = await getAdminOrders({
      search: orderSearch,
      status: orderStatusFilter,
      page: orderPage,
      limit: 15,
    });
    if (res.success && res.data) {
      setOrders(res.data.orders);
      setTotalOrdersCount(res.data.total);
    }
  };

  const loadProducts = async () => {
    const res = await getAdminProducts();
    if (res.success && res.data) setProducts(res.data);
  };

  const loadSettings = async () => {
    const res = await getAdminSettings();
    if (res.success && res.data) setSettings(res.data);
  };

  useEffect(() => {
    loadDashboard();
    loadOrders();
    loadProducts();
    loadSettings();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [orderSearch, orderStatusFilter, orderPage]);

  // Status update handler
  const handleUpdateStatus = async (
    orderId: number,
    newStatus: OrderStatus,
    adminNotes?: string,
    cancellationReason?: string
  ) => {
    const res = await updateAdminOrderStatus(orderId, {
      order_status: newStatus,
      admin_notes: adminNotes,
      cancellation_reason: cancellationReason,
      payment_status: newStatus === 'DELIVERED' ? 'PAID' : undefined,
      delivered_at: newStatus === 'DELIVERED' ? new Date().toISOString() : undefined,
    });

    if (res.success && res.data) {
      setSelectedOrder(res.data);
      loadOrders();
      loadDashboard();
    }
  };

  // Product edit save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await updateAdminProduct(editingProduct.id, editingProduct);
    if (res.success) {
      setEditingProduct(null);
      loadProducts();
    }
  };

  // Settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await updateAdminSettings(settings);
    if (res.success) {
      setSettingsNotice('সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
      setTimeout(() => setSettingsNotice(null), 3000);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', msg: 'নতুন পাসওয়ার্ড দুটি মিলছে না' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordNotice({ type: 'error', msg: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
      return;
    }

    const res = await changeAdminPassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordNotice({ type: 'success', msg: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে। নতুন সেশনে লগইন নিশ্চিত করুন।' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordNotice({ type: 'error', msg: res.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Ref', 'Date', 'Customer', 'Phone', 'Address', 'District', 'Items', 'Subtotal', 'Delivery', 'Total', 'Payment', 'Status'];
    const rows = orders.map((o) => [
      o.public_order_reference,
      o.created_at,
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      `"${o.customer_address}"`,
      o.district,
      `"${o.items?.map((i) => `${i.product_name_snapshot} (${i.size}x${i.quantity})`).join(', ')}"`,
      o.subtotal,
      o.delivery_charge,
      o.total,
      o.payment_method,
      o.order_status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `denim_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoutClick = async () => {
    await adminLogout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded bg-amber-400 text-neutral-950 font-bold flex items-center justify-center font-mono">
            IC
          </span>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white leading-tight">এডমিন ড্যাশবোর্ড</h1>
            <p className="text-[11px] text-neutral-400">লগইনকৃত: <span className="text-amber-400 font-mono font-medium">{user.username}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStore}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">স্টোরে যান</span>
          </button>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="bg-neutral-900/50 border-b border-neutral-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ওভারভিউ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>অর্ডারসমূহ ({totalOrdersCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>প্রোডাক্ট ও মূল্য কনফিগারেশন</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>স্টোর সেটিংস ও সিকিউরিটি</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">মোট অর্ডার</span>
                <span className="font-mono text-2xl font-bold text-white">{stats.total_orders}</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-amber-400 block mb-1">অপেক্ষমাণ (Pending)</span>
                <span className="font-mono text-2xl font-bold text-amber-400">{stats.pending_orders}</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-blue-400 block mb-1">কুরিয়ারে (Shipped/Proc)</span>
                <span className="font-mono text-2xl font-bold text-blue-400">
                  {stats.processing_orders + stats.shipped_orders}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-xs text-emerald-400 block mb-1">ডেলিভারি সম্পন্ন ও ক্যাশ</span>
                <span className="font-mono text-2xl font-bold text-emerald-400">
                  ৳{stats.delivered_revenue_bdt.toLocaleString('en-BD')}
                </span>
              </div>
            </div>

            {/* Status Breakdown Grid */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
              <h3 className="text-sm font-bold text-white mb-4">অর্ডার স্ট্যাটাস পাইপলাইন</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                <div className="p-3 bg-neutral-950 rounded-lg border border-amber-500/20">
                  <span className="text-neutral-400 block text-[11px]">PENDING</span>
                  <span className="font-mono text-lg font-bold text-amber-400">{stats.pending_orders}</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-sky-500/20">
                  <span className="text-neutral-400 block text-[11px]">CONFIRMED</span>
                  <span className="font-mono text-lg font-bold text-sky-400">{stats.confirmed_orders}</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-indigo-500/20">
                  <span className="text-neutral-400 block text-[11px]">PROCESSING</span>
                  <span className="font-mono text-lg font-bold text-indigo-400">{stats.processing_orders}</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-blue-500/20">
                  <span className="text-neutral-400 block text-[11px]">SHIPPED</span>
                  <span className="font-mono text-lg font-bold text-blue-400">{stats.shipped_orders}</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-emerald-500/20">
                  <span className="text-neutral-400 block text-[11px]">DELIVERED</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">{stats.delivered_orders}</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-rose-500/20">
                  <span className="text-neutral-400 block text-[11px]">CANCELLED</span>
                  <span className="font-mono text-lg font-bold text-rose-400">{stats.cancelled_orders}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">সর্বশেষ অর্ডারসমূহ</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  সব দেখুন
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400">
                      <th className="py-2 px-3">অর্ডার আইডি</th>
                      <th className="py-2 px-3">গ্রাহক</th>
                      <th className="py-2 px-3">মোবাইল</th>
                      <th className="py-2 px-3">জেলা</th>
                      <th className="py-2 px-3">মোট (BDT)</th>
                      <th className="py-2 px-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {stats.recent_orders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-850 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{o.public_order_reference}</td>
                        <td className="py-2.5 px-3 text-white">{o.customer_name}</td>
                        <td className="py-2.5 px-3 text-neutral-300 font-mono">{o.customer_phone}</td>
                        <td className="py-2.5 px-3 text-neutral-400">{o.district}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">৳{o.total.toLocaleString('en-BD')}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] font-semibold text-neutral-300">{o.order_status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[220px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setOrderPage(1);
                    }}
                    placeholder="অর্ডার আইডি, নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => {
                      setOrderStatusFilter(e.target.value);
                      setOrderPage(1);
                    }}
                    className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ALL">সকল স্ট্যাটাস</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV ডাউনলোড</span>
              </button>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-semibold">
                      <th className="py-3 px-3">অর্ডার আইডি</th>
                      <th className="py-3 px-3">তারিখ</th>
                      <th className="py-3 px-3">গ্রাহক ও মোবাইল</th>
                      <th className="py-3 px-3">ঠিকানা / জেলা</th>
                      <th className="py-3 px-3">আইটেম সংখ্যা</th>
                      <th className="py-3 px-3">মোট (BDT)</th>
                      <th className="py-3 px-3">পেমেন্ট</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                      <th className="py-3 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-neutral-400">
                          কোনো অর্ডার পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-850/60 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            {o.public_order_reference}
                          </td>
                          <td className="py-3 px-3 text-neutral-400 whitespace-nowrap">
                            {new Date(o.created_at).toLocaleDateString('bn-BD')}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{o.customer_name}</div>
                            <div className="font-mono text-[11px] text-neutral-400">{o.customer_phone}</div>
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate text-neutral-300">
                            {o.district}
                          </td>
                          <td className="py-3 px-3 text-neutral-300">
                            {o.items?.reduce((s, i) => s + i.quantity, 0) || 1}টি
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                            ৳{o.total.toLocaleString('en-BD')}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-[11px] text-amber-300 font-medium">{o.payment_method}</span>
                            <span className={`block text-[10px] ${o.payment_status === 'PAID' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                              ({o.payment_status})
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-xs font-semibold text-neutral-200">{o.order_status}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>বিস্তারিত</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">প্রোডাক্ট ক্যাটালগ ও মূল্য নির্ধারণ</h2>
                <p className="text-xs text-neutral-400">
                  এখানে নির্ধারিত মূল্য সরাসরি ডাটাবেজে সংরক্ষিত হয় এবং সার্ভার-ভেরিফায়েড।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <img
                      src={p.image_path}
                      alt={p.name}
                      className="w-full h-44 object-cover rounded-lg bg-neutral-950"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">আইডি: {p.id}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded ${p.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-500'}`}>
                        {p.is_active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">{p.description}</p>

                    <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline font-mono">
                      <div>
                        <span className="text-[11px] text-neutral-500 block">বিক্রয় মূল্য:</span>
                        <span className="text-lg font-bold text-amber-400">
                          ৳{(p.sale_price ?? p.price).toLocaleString('en-BD')}
                        </span>
                      </div>
                      {p.sale_price && (
                        <div className="text-right">
                          <span className="text-[11px] text-neutral-500 block">রেগুলার মূল্য:</span>
                          <span className="text-xs text-neutral-500 line-through">
                            ৳{p.price.toLocaleString('en-BD')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                    className="w-full py-2 text-xs font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>মূল্য ও তথ্য এডিট করুন</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Settings & Security */}
        {activeTab === 'settings' && settings && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Store & Delivery Settings */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3">
                স্টোর তথ্য ও ডেলিভারি কনফিগারেশন
              </h3>

              {settingsNotice && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                  {settingsNotice}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1">স্টোরের নাম</label>
                  <input
                    type="text"
                    value={settings.store_name}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 mb-1">কাস্টমার কেয়ার ফোন</label>
                    <input
                      type="text"
                      value={settings.store_phone}
                      onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1">ইমেইল</label>
                    <input
                      type="email"
                      value={settings.store_email}
                      onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">অফিস / শোরুম ঠিকানা</label>
                  <input
                    type="text"
                    value={settings.store_address}
                    onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-850">
                  <div>
                    <label className="block text-neutral-300 mb-1">ঢাকার ভেতর ডেলিভারি ফি (BDT)</label>
                    <input
                      type="number"
                      value={settings.delivery_inside_dhaka}
                      onChange={(e) => setSettings({ ...settings, delivery_inside_dhaka: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1">ঢাকার বাইরে ডেলিভারি ফি (BDT)</label>
                    <input
                      type="number"
                      value={settings.delivery_outside_dhaka}
                      onChange={(e) => setSettings({ ...settings, delivery_outside_dhaka: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">অ্যানাউন্সমেন্ট বার টেক্সট</label>
                  <input
                    type="text"
                    value={settings.announcement_text}
                    onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  />
                </div>

                {/* GTM Settings */}
                <div className="pt-3 border-t border-neutral-850 space-y-3">
                  <h4 className="font-semibold text-white">গুগল ট্যাগ ম্যানেজার (GTM) সেটিংস</h4>
                  <div>
                    <label className="block text-neutral-300 mb-1">GTM Container ID</label>
                    <input
                      type="text"
                      value={settings.gtm_container_id}
                      onChange={(e) => setSettings({ ...settings, gtm_container_id: e.target.value })}
                      placeholder="GTM-XXXXXXX"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.gtm_enabled}
                      onChange={(e) => setSettings({ ...settings, gtm_enabled: e.target.checked })}
                      className="rounded bg-neutral-950 border-neutral-800 text-amber-400 focus:ring-0"
                    />
                    <span className="text-neutral-300">GTM ট্র্যাকিং সক্রিয় করুন (প্রোডাকশন কন্টেইনার আইডি সেট করার পর)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>সেটিংস সেভ করুন</span>
                </button>
              </form>
            </div>

            {/* Admin Security & Password Change */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা</span>
              </h3>

              {passwordNotice && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    passwordNotice.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordNotice.msg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1">বর্তমান পাসওয়ার্ড</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">নতুন পাসওয়ার্ড</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
              </form>

              <div className="pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-500">
                <p>পাসওয়ার্ড পরিবর্তনের সাথে সাথে পূর্ববর্তী সেশনগুলো স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Details & Workflow Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-left my-8">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <div>
                <span className="text-xs text-neutral-400">অর্ডার ডিটেইলস</span>
                <h3 className="text-lg font-bold text-white font-mono">{selectedOrder.public_order_reference}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-semibold text-neutral-400">গ্রাহকের তথ্য</p>
                <p className="text-white font-bold">{selectedOrder.customer_name}</p>
                <p className="text-amber-400 font-mono">{selectedOrder.customer_phone}</p>
                <p className="text-neutral-300">{selectedOrder.customer_address}</p>
                <p className="text-neutral-400">{selectedOrder.area ? `${selectedOrder.area}, ` : ''}{selectedOrder.district}</p>
                {selectedOrder.notes && (
                  <p className="text-amber-300/80 pt-1 text-[11px]">নোট: {selectedOrder.notes}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <p className="font-semibold text-neutral-400">পেমেন্ট ও স্ট্যাটাস</p>
                <p className="text-neutral-300">পদ্ধতি: <span className="font-bold text-white">{selectedOrder.payment_method}</span></p>
                <p className="text-neutral-300">পেমেন্ট অবস্থা: <span className="font-mono text-amber-400">{selectedOrder.payment_status}</span></p>
                <p className="text-neutral-300">বর্তমান স্ট্যাটাস: <span className="font-bold text-emerald-400">{selectedOrder.order_status}</span></p>
                <p className="text-neutral-400 text-[11px]">অর্ডার তারিখ: {new Date(selectedOrder.created_at).toLocaleString('bn-BD')}</p>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="mb-4 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden text-xs">
              <div className="p-3 font-semibold text-neutral-400 border-b border-neutral-800">অর্ডারের আইটেমসমূহ</div>
              <div className="divide-y divide-neutral-900 p-3 space-y-2">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-white">{it.product_name_snapshot}</p>
                      <span className="text-neutral-400 text-[11px]">সাইজ: {it.size} · পরিমাণ: {it.quantity}টি</span>
                    </div>
                    <span className="font-mono text-white">৳{it.line_total.toLocaleString('en-BD')}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-neutral-800 space-y-1 text-right font-mono">
                  <p className="text-neutral-400">সাবটোটাল: ৳{selectedOrder.subtotal.toLocaleString('en-BD')}</p>
                  <p className="text-neutral-400">ডেলিভারি চার্জ: ৳{selectedOrder.delivery_charge.toLocaleString('en-BD')}</p>
                  <p className="text-base font-bold text-amber-400">মোট: ৳{selectedOrder.total.toLocaleString('en-BD')}</p>
                </div>
              </div>
            </div>

            {/* Status Transition Workflow */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-white">অর্ডার স্ট্যাটাস পরিবর্তন করুন:</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        selectedOrder.order_status === st
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-left my-8">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">প্রোডাক্ট তথ্য এডিট</h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">প্রোডাক্ট নাম</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">রেগুলার মূল্য (BDT)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">সেল/অফার মূল্য (BDT)</label>
                  <input
                    type="number"
                    value={editingProduct.sale_price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sale_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">ছবির পাথ (Image Path)</label>
                <input
                  type="text"
                  required
                  value={editingProduct.image_path}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_path: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                />
                <span className="text-[11px] text-neutral-500">যেমন: /images/denim-black.webp</span>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">বিবরণ</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.is_active)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked ? 1 : 0 })}
                  className="rounded bg-neutral-950 border-neutral-800 text-amber-400"
                />
                <span className="text-neutral-300">প্রোডাক্টটি স্টোরে প্রদর্শন করুন (Active)</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-amber-400 text-neutral-950 rounded hover:bg-amber-300"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
