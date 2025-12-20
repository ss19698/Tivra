import React, { useState,useEffect } from 'react';
import { Home, CreditCard, ReceiptIndianRupee, Gift, TrendingUp, ArrowLeftCircle,ArrowRightCircle, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, User, Settings, LogOut, PieChart, IndianRupee, Mail, Phone, MapPin, Lock, Bell, Globe, ImageOff } from 'lucide-react';
import Accounts from './Accounts.jsx';
import Transfer from './transfer.jsx';
import Budgets from './Budgets.jsx';
import { useNavigate } from 'react-router-dom';
import Setting from './Settings.jsx';
import Rewards from './Rewards.jsx';
import Bills from './Bills.jsx';
import { useAuth } from "../context/AuthContext.jsx";
import { getBudgets } from '../api/budgets.js';


export default function Dashboard() {
  const [activePage, setActivePage] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);

  function useIsMdUp() {
    const [isMdUp, setIsMdUp] = useState(
      window.matchMedia("(max-width: 768px)").matches
    );

    useEffect(() => {
      const media = window.matchMedia("(max-width: 768px)");
      setIsMdUp(media.matches);
      }, []);

    return isMdUp;
  }
  const isMobile = useIsMdUp();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    fetchBudgets();
  }, []);

    const fetchBudgets = async () => {
      try {
        setBudgetsLoading(true);
        const data = await getBudgets();

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        const filtered = Array.isArray(data)
          ? data.filter(b => b.month === month && b.year === year)
          : [];

        setBudgets(filtered);
      } catch (err) {
        console.error("Budget fetch error:", err);
        setBudgets([]);
      } finally {
        setBudgetsLoading(false);
      }
    };


  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };
  const transactions = [
    { name: 'Grocery Store', amount: -85.50, date: 'Today', category: 'Food', type: 'expense' },
    { name: 'Salary Deposit', amount: 5000.00, date: 'Today', category: 'Income', type: 'income' },
    { name: 'Electric Bill', amount: -120.00, date: 'Yesterday', category: 'Bills', type: 'expense' },
    { name: 'Coffee Shop', amount: -12.50, date: 'Yesterday', category: 'Food', type: 'expense' },
    { name: 'Amazon Purchase', amount: -245.00, date: '2 days ago', category: 'Shopping', type: 'expense' },
    { name: 'Gas Station', amount: -65.00, date: '2 days ago', category: 'Transport', type: 'expense' }
  ];

  const bills = [
    { name: 'Netflix Subscription', amount: 15.99, dueDate: 'Dec 15', status: 'upcoming', auto: true },
    { name: 'Internet Bill', amount: 89.99, dueDate: 'Dec 18', status: 'upcoming', auto: false },
    { name: 'Phone Bill', amount: 45.00, dueDate: 'Dec 20', status: 'upcoming', auto: true },
    { name: 'Rent Payment', amount: 1500.00, dueDate: 'Dec 25', status: 'pending', auto: false }
  ];

  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => {setActivePage(page); setSidebarOpen(false)}}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activePage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {sidebarOpen ? <span className="font-medium">{label}</span> : ""}
    </button>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 ">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-30'} bg-white/60 backdrop-blur-xl shadow-xl border-r border-white/40 transition-all`}>
        <div className="p-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute right-0 -translate-y-1/2 translate-x-1/2 z-50 
              bg-blue-700 shadow-lg rounded-full  hover:scale-105 transition">
              {sidebarOpen ? (
                <ArrowLeftCircle className="w-8 h-8 text-white" />
              ) : (
                <ArrowRightCircle className="w-8 h-8 text-white" />
              )}
            </button>
          <nav className="space-y-2">
            
            <MenuItem icon={Home} label="Home" page="Home" />
            <MenuItem icon={CreditCard} label="Accounts" page="accounts" />
            <MenuItem icon={RefreshCcw} label="Transactions" page="transactions" />
            <MenuItem icon={PieChart} label="Budget" page="budget" />
            <MenuItem icon={ReceiptIndianRupee} label="Bills" page="bills" />
            <MenuItem icon={Gift} label="Rewards" page="rewards" />
            <MenuItem icon={Settings} label="Settings" page="settings" />
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <button onClick={handleLogout}>
            <MenuItem icon = {LogOut} label = "LogOut" />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activePage === 'Home' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                  <div className="text-sm opacity-90 mb-2">Total Balance</div>
                  <div className="text-xl font-bold mb-4">₹11,400.50</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5% from last month</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Income</div>
                  <div className="text-xl font-bold text-gray-900 mb-4">₹5,000.00</div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Salary deposited</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Expenses</div>
                  <div className="text-xl font-bold text-gray-900 mb-4">₹2,245.50</div>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>-15% vs last month</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Recent Transactions</h2>
                    <button className="text-blue-600 text-sm font-medium">View All</button>
                  </div>
                  <div className="space-y-4">
                    {transactions.slice(0, 4).map((tx, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'income' ? 
                              <ArrowUpRight className="w-5 h-5 text-green-600" /> :
                              <ArrowDownRight className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{tx.name}</div>
                            <div className="text-sm text-gray-500">{tx.date}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'income' ? '+' : ''}₹{tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Budget Overview</h2>
                    <button className="text-blue-600 text-sm font-medium">Manage</button>
                  </div>
                  <div className="space-y-4">
                    {budgetsLoading ? (
                        <p className="text-sm text-gray-500">Loading budgets...</p>
                      ) : budgets.length === 0 ? (
                        <p className="text-sm text-gray-500">No budgets found</p>
                      ) : (
                        budgets.map((budget, i) => {
                          const spent = Number(budget.spent_amount);
                          const limit = Number(budget.limit_amount);
                          const percent = Math.min((spent / limit) * 100, 100);

                          return (
                            <div key={i}>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">{budget.category}</span>
                                <span className="text-sm text-gray-500">
                                  ₹{spent} / ₹{limit}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    percent >= 100
                                      ? 'bg-red-500'
                                      : percent >= 80
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}

                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'accounts' && <Accounts />}
          {activePage === 'transactions' && <Transfer />}
          {activePage === 'budget' && <Budgets />}
          {activePage === 'bills' && <Bills/>}
          {activePage === 'rewards' && <Rewards/>}
          {activePage === 'settings' && <Setting/>}
        </div>
      </main>
    </div>
  );
}