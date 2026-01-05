import React,{ useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function UserManagement({users}) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (userId) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/40">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-8"></th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">KYC Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((i) => (
              <div key={i.id} className="contents">
                <tr className="hover:bg-gray-50/80 transition-colors duration-200">
                  <td className="px-6 py-4 text-center">
                    {i.accounts && i.accounts.length > 0 && (
                      <button
                        onClick={() => toggleRow(i.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedRows[i.id] ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900">USR-{1000 + i.id}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900">{i.name}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{i.email}</td>
                  <td className="px-6 py-4 text-center">
                    {i.kyc_status === "verified" ? (
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium bg-red-100 text-yellow-800 rounded-full">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {i.phone === "string" ? "-" : i.phone}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{i.role}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {new Date(i.created_at).toLocaleDateString()}
                  </td>
                </tr>
                {expandedRows[i.id] && i.accounts && i.accounts.length > 0 && (
                  <tr className="bg-gradient-to-b from-blue-50/50 to-transparent">
                    <td colSpan="8" className="px-6 py-6">
                      <div className="ml-8">
                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Bank Accounts ({i.accounts.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {i.accounts.map((account) => (
                            <div
                              key={account.id}
                              className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 rounded-full -mr-8 -mt-8"></div>
                              <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                      {account.account_type}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">
                                      {account.bank_name}
                                    </p>
                                  </div>
                                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    ID: {account.id}
                                  </span>
                                </div>
                                <div className="pt-3 border-t border-blue-200/50">
                                  <div className="flex justify-between items-end">
                                    <div>
                                      <p className="text-xs text-gray-600 font-medium mb-1">Balance</p>
                                      <p className="text-lg font-bold text-gray-900">
                                        {account.balance.toLocaleString()}
                                      </p>
                                    </div>
                                    <p className="text-xs font-bold text-blue-600 uppercase">
                                      {account.currency}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </div>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}