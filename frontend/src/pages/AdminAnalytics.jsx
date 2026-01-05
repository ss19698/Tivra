import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, CreditCard, DollarSign, Calendar, Download } from 'lucide-react';
import { getUsers } from '../api/users';
import { getAccounts } from '../api/accounts';
import { getTransactions } from '../api/transactions';
import { getBills } from '../api/bills';
import Load from '../components/Loader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AdminAnalytics({users}) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [accountsData, billsData] = await Promise.all([
        getAccounts().catch(() => []),
        getBills().catch(() => [])
      ]);

      setAccounts(accountsData || []);
      setBills(billsData || []);

      if (accountsData && accountsData.length > 0) {
        try {
          const allTransactions = [];
          for (const account of accountsData.slice(0, 5)) {
            const txData = await getTransactions(account.id).catch(() => []);
            allTransactions.push(...(txData || []));
          }
          setTransactions(allTransactions);
        } catch (err) {
        }
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  const getTransactionTrendData = () => {
    const trendMap = {};
    transactions.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trendMap[date]) {
        trendMap[date] = { date, income: 0, expense: 0 };
      }
      const amount = Number(t.amount || 0);
      if (t.txn_type === 'credit') {
        trendMap[date].income += amount;
      } else {
        trendMap[date].expense += amount;
      }
    });
    return Object.values(trendMap).slice(-7);
  };

  const getSpendingByCategory = () => {
    const categoryMap = {};
    transactions
      .filter(t => t.txn_type === 'debit')
      .forEach(t => {
        const category = t.category || 'Others';
        categoryMap[category] = (categoryMap[category] || 0) + Number(t.amount || 0);
      });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getAccountDistribution = () => {
    const accountMap = {};
    accounts.forEach(acc => {
      accountMap[acc.account_type || 'Other'] = (accountMap[acc.account_type || 'Other'] || 0) + 1;
    });
    return Object.entries(accountMap).map(([name, value]) => ({ name, value }));
  };

  const getUserSignupTrend = () => {
    const signupMap = {};
    users.forEach(u => {
      const date = new Date(u.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      signupMap[date] = (signupMap[date] || 0) + 1;
    });
    return Object.entries(signupMap)
      .map(([date, count]) => ({ date, users: count }))
      .slice(-7);
  };

  const getTransactionVolumeByAccount = () => {
    const volumeMap = {};
    transactions.forEach(t => {
      const accountId = t.account_id || 'Unknown';
      const account = accounts.find(a => a.id === accountId);
      const accountName = account?.bank_name || `Account ${accountId}`;
      volumeMap[accountName] = (volumeMap[accountName] || 0) + Number(t.amount || 0);
    });
    return Object.entries(volumeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const totalIncome = transactions
    .filter(t => t.txn_type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.txn_type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const avgTransactionAmount = transactions.length > 0 
    ? (totalIncome + totalExpense) / transactions.length 
    : 0;

  const activeUsers = users.length;
  const totalAccounts = accounts.length;
  const activeBudgets = bills.length;

  const exportAnalyticsReport = () => {
    const rows = [];

    rows.push([
        "Type",
        "Date",
        "User / Account",
        "Category",
        "Amount",
        "Extra Info"
    ]);

    transactions.forEach(t => {
        rows.push([
        "Transaction",
        new Date(t.created_at).toLocaleDateString(),
        t.account_id,
        t.category || "-",
        t.amount,
        t.txn_type
        ]);
    });

    bills.forEach(b => {
        rows.push([
        "Bill",
        new Date(b.due_date).toLocaleDateString(),
        b.biller_name,
        "Bill Payment",
        b.amount_due,
        b.status
        ]);
    });

    accounts.forEach(a => {
        rows.push([
        "Account",
        "-",
        a.bank_name,
        a.account_type,
        a.balance || 0,
        "Active"
        ]);
    });

    users.forEach(u => {
        rows.push([
        "User",
        new Date(u.created_at).toLocaleDateString(),
        u.name,
        "Signup",
        "-",
        u.email
        ]);
    });

    const csvContent = rows
        .map(row => row.map(val => `"${val}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Tivra_Analytics_Report_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    };

  if (loading) {
    return <Load/>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-red-600 font-semibold">{error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const transactionTrend = getTransactionTrendData();
  const spendingByCategory = getSpendingByCategory();
  const accountDistribution = getAccountDistribution();
  const userSignupTrend = getUserSignupTrend();
  const transactionVolumeByAccount = getTransactionVolumeByAccount();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive platform insights and metrics</p>
        </div>
        <button  onClick={exportAnalyticsReport}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Trend (Last 7 Days)</h3>
          {transactionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expense" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No transaction data</div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40">
          <h3 className="text-lg font-bold text-gray-900 mb-6">User Signups (Last 7 Days)</h3>
          {userSignupTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userSignupTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No signup data</div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h3>
          {spendingByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No spending data</div>
          )}
        </div>

        {/* Account Type Distribution */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Account Type Distribution</h3>
          {accountDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accountDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No account data</div>
          )}
        </div>

        {/* Transaction Volume by Account */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Transaction Volume by Account</h3>
          {transactionVolumeByAccount.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionVolumeByAccount} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#f59e0b" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No transaction data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40">
          <p className="text-gray-600 text-sm font-medium">Total Income</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{totalIncome.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">From all transactions</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40">
          <p className="text-gray-600 text-sm font-medium">Total Expense</p>
          <p className="text-3xl font-bold text-red-600 mt-2">₹{totalExpense.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">From all transactions</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40">
          <p className="text-gray-600 text-sm font-medium">Avg Transaction</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">₹{avgTransactionAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-gray-500 mt-2">Per transaction</p>
        </div>
      </div>
    </div>
  );
}