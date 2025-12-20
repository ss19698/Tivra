import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, CreditCard, ArrowUpRight, ArrowDownRight, Search, 
  Calendar, Download, Upload, Eye, EyeOff, AlertCircle, CheckCircle, 
  User, LogOut, Bell, Trash2, Plus,
  IndianRupee
} from 'lucide-react';


export default function Transfer() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hideAmounts, setHideAmounts] = useState({});

  const [form, setForm] = useState({
    description: '',
    merchant: '',
    amount: '',
    category: 'Other',
    txn_type: 'debit',
    currency: 'INR'
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Salary', 'Other'];

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions();
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (e) {
      showToast(e.message || 'Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions(selectedAccount);
      setTransactions(data);
    } catch (e) {
      showToast(e.message || 'Failed to load transactions', 'error');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddTransaction = async () => {
    if (!form.description || !form.amount) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await createTransaction(selectedAccount, {
        description: form.description,
        merchant: form.merchant || form.description,
        amount: Number(form.amount),
        category: form.category,
        txn_type: form.txn_type,
        currency: form.currency,
        txn_date: new Date().toISOString()
      });
      showToast('Transaction added successfully', 'success');
      setShowAddModal(false);
      setForm({
        description: '',
        merchant: '',
        amount: '',
        category: 'Other',
        txn_type: 'debit',
        currency: 'INR'
      });
      loadTransactions();
    } catch (e) {
      showToast(e.message || 'Failed to create transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (txnId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      setLoading(true);
      await deleteTransaction(selectedAccount, txnId);
      showToast('Transaction deleted successfully', 'success');
      loadTransactions();
    } catch (e) {
      showToast(e.message || 'Failed to delete transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['Date', 'Description', 'Merchant', 'Category', 'Amount', 'Type', 'Currency'];
    const rows = filteredTransactions.map(t => [
      new Date(t.txn_date).toLocaleDateString(),
      t.description,
      t.merchant || '-',
      t.category,
      t.amount,
      t.txn_type,
      t.currency
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('CSV exported successfully', 'success');
  };

  const toggleHideAmount = (accountId) => {
    setHideAmounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.txn_type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesDateFrom = !dateFrom || new Date(t.txn_date) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(t.txn_date) <= new Date(dateTo);

    return matchesSearch && matchesType && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const totalDebit = filteredTransactions
    .filter(t => t.txn_type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalCredit = filteredTransactions
    .filter(t => t.txn_type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentAccount = accounts.find(a => a.id === selectedAccount);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      
      <div className="flex flex-1 pt-16">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {toast && (
              <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {toast.message}
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard size={24} className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Select Your Account</h2>
                </div>
                <select value={selectedAccount || ''} onChange={(e) => setSelectedAccount(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank_name} - {acc.masked_account} ({acc.currency})
                    </option>
                  ))}
                </select>

                {currentAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                      <div className="text-sm opacity-90 mb-2">Available Balance</div>
                      <div className="text-4xl font-bold mb-4">
                        {hideAmounts[selectedAccount] ? '••••••' : `₹${Number(currentAccount.balance).toFixed(2)}`}
                      </div>
                      <button onClick={() => toggleHideAmount(selectedAccount)} className="text-sm opacity-75 hover:opacity-100 flex items-center gap-1">
                        {hideAmounts[selectedAccount] ? <Eye size={16} /> : <EyeOff size={16} />}
                        {hideAmounts[selectedAccount] ? 'Show' : 'Hide'} Balance
                      </button>
                    </div>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <div className="text-sm text-gray-600 mb-2">Account Type</div>
                      <div className="text-2xl font-bold text-gray-900 mb-4 capitalize">{currentAccount.account_type}</div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{currentAccount.currency}</span> Currency
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex gap-2 items-center transition font-semibold">
                  <Plus size={20} /> Add Transaction
                </button>
                <button onClick={handleExportCSV} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex gap-2 items-center transition font-semibold">
                  <Download size={20} /> Export CSV
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
                  <div className="text-sm opacity-90 mb-2">Money In</div>
                  <div className="text-4xl font-bold">₹{totalCredit.toFixed(0)}</div>
                  <div className="text-sm opacity-75 mt-2">
                    <ArrowDownRight size={16} className="inline mr-1" />
                    Credits
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-lg">
                  <div className="text-sm opacity-90 mb-2">Money Out</div>
                  <div className="text-4xl font-bold">₹{totalDebit.toFixed(0)}</div>
                  <div className="text-sm opacity-75 mt-2">
                    <ArrowUpRight size={16} className="inline mr-1" />
                    Debits
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                  <div className="text-sm opacity-90 mb-2">Net Flow</div>
                  <div className="text-4xl font-bold">₹{(totalCredit - totalDebit).toFixed(0)}</div>
                  <div className="text-sm opacity-75 mt-2">
                    {filteredTransactions.length} Transactions
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Filters & Search</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Search</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input type="text" placeholder="Merchant or description" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Type</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Types</option>
                      <option value="debit">Money Out</option>
                      <option value="credit">Money In</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Category</label>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Categories</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">From</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">To</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                </div>
                {loading ? (
                  <div className="p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading transactions...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-20 text-center">
                    <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-semibold">No transactions found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add a new transaction</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-4 px-4 md:px-6 font-semibold text-gray-900">Date</th>
                          <th className="text-left py-4 px-4 md:px-6 font-semibold text-gray-900">Description</th>
                          <th className="text-left py-4 px-4 md:px-6 font-semibold text-gray-900 hidden md:table-cell">Merchant</th>
                          <th className="text-left py-4 px-4 md:px-6 font-semibold text-gray-900 hidden lg:table-cell">Category</th>
                          <th className="text-right py-4 px-4 md:px-6 font-semibold text-gray-900">Amount</th>
                          <th className="text-center py-4 px-4 md:px-6 font-semibold text-gray-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((txn) => (
                          <tr key={txn.id} className="border-b hover:bg-blue-50 transition">
                            <td className="py-4 px-4 md:px-6 text-gray-900 font-semibold">{new Date(txn.txn_date).toLocaleDateString()}</td>
                            <td className="py-4 px-4 md:px-6 text-gray-900">{txn.description}</td>
                            <td className="py-4 px-4 md:px-6 text-gray-600 hidden md:table-cell">{txn.merchant || '-'}</td>
                            <td className="py-4 px-4 md:px-6 hidden lg:table-cell">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {txn.category}
                              </span>
                            </td>
                            <td className={`py-4 px-4 md:px-6 text-right font-bold ${txn.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {txn.txn_type === 'credit' ? '+' : '-'}₹{Number(txn.amount).toFixed(2)}
                            </td>
                            <td className="py-4 px-4 md:px-6 text-center">
                              <button onClick={() => handleDeleteTransaction(txn.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition inline-block">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Transaction</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <input type="text" placeholder="What did you spend on?" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Merchant</label>
                <input type="text" placeholder="Store or company name" value={form.merchant} onChange={(e) => setForm({...form, merchant: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                <input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select value={form.txn_type} onChange={(e) => setForm({...form, txn_type: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="debit">Money Out</option>
                  <option value="credit">Money In</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleAddTransaction} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition">
                  {loading ? 'Adding...' : 'Add Transaction'}
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}