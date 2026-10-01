import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { Database, ShieldCheck, AlertTriangle, RefreshCw, Send, CheckCircle2, XCircle, Code, UserCheck, Terminal } from 'lucide-react';

export const DatabaseDiagnosticTool: React.FC = () => {
  const [testForm, setTestForm] = useState({
    name: 'Diagnostic Test User',
    email: `test_user_${Date.now()}@tradeheaven.net`,
    password: 'SecurePassword123!',
    company_name: 'Diagnostic Corp LLC',
    country: 'United States',
    accountType: 'BUYER' as 'BUYER' | 'SUPPLIER',
    phone: '+1 555 0199'
  });

  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'test_register' | 'raw_logs' | 'db_schema'>('test_register');

  const checkDatabaseConnection = async () => {
    setDbStatus('checking');
    try {
      const res = await fetch('/api.php?action=get_users');
      setHttpStatus(res.status);
      const json = await res.json().catch(() => null);
      if (res.ok && json) {
        setDbStatus('connected');
        if (json.data && Array.isArray(json.data)) {
          setRegisteredUsers(json.data);
        } else if (Array.isArray(json)) {
          setRegisteredUsers(json);
        }
      } else {
        setDbStatus('error');
      }
    } catch (e: any) {
      setDbStatus('error');
      setFetchError(e.message || 'Connection failed');
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const handleRunTestRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRawResponse(null);
    setFetchError(null);

    const startTime = performance.now();
    try {
      const endpoint = `${window.location.origin}/api.php?action=register`;
      const payload = {
        id: `usr_diag_${Date.now()}`,
        name: testForm.name,
        email: testForm.email,
        password: testForm.password,
        company_name: testForm.company_name,
        companyName: testForm.company_name,
        company: testForm.company_name,
        phone: testForm.phone,
        country: testForm.country,
        role: testForm.accountType === 'SUPPLIER' ? 'supplier' : 'buyer',
        accountType: testForm.accountType
      };

      console.log('[DiagnosticTool] Sending test register payload:', payload);

      const serializedPayload = JSON.stringify(payload, null, 2);
      console.log('[DatabaseDiagnosticTool] Serialized Registration Payload:', serializedPayload);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setHttpStatus(res.status);
      const text = await res.text();
      let jsonParsed = null;
      try {
        jsonParsed = JSON.parse(text);
      } catch {
        jsonParsed = { rawText: text };
      }

      const duration = Math.round(performance.now() - startTime);

      setRawResponse({
        endpoint,
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        durationMs: duration,
        responseJson: jsonParsed,
        requestPayload: payload
      });

      // Refresh users list
      checkDatabaseConnection();
    } catch (err: any) {
      setFetchError(err.message || 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Database Diagnostic & Debugging Suite
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
              dbStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {dbStatus === 'connected' ? 'MySQL Connected' : 'Checking Connection...'}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Database className="w-7 h-7 text-blue-400" />
            Registration Persistence Diagnostic Tool
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Inspect raw server registration payloads, verify MySQL PDO connection status, test database insertion mapping, and debug persistence issues in real-time.
          </p>
        </div>
        <button
          onClick={checkDatabaseConnection}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh DB Status</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('test_register')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'test_register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Test Registration Payload</span>
        </button>
        <button
          onClick={() => setActiveTab('raw_logs')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'raw_logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Raw Fetch & Response Inspector</span>
        </button>
        <button
          onClick={() => setActiveTab('db_schema')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'db_schema' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Database Users ({registeredUsers.length})</span>
        </button>
      </div>

      {/* Tab 1: Test Registration Form */}
      {activeTab === 'test_register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span>Simulate User Registration</span>
            </h2>
            <form onSubmit={handleRunTestRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={testForm.name}
                  onChange={e => setTestForm({ ...testForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={testForm.email}
                  onChange={e => setTestForm({ ...testForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="text"
                  value={testForm.password}
                  onChange={e => setTestForm({ ...testForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={testForm.company_name}
                  onChange={e => setTestForm({ ...testForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
                <select
                  value={testForm.accountType}
                  onChange={e => setTestForm({ ...testForm, accountType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="BUYER">Buyer (Importer / Procurement)</option>
                  <option value="SUPPLIER">Supplier (Manufacturer / Exporter)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={testForm.country}
                  onChange={e => setTestForm({ ...testForm, country: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'Submitting to Database...' : 'Run Test Registration'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <span>Live Response Preview</span>
              </h3>

              {fetchError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Fetch Error:</span> {fetchError}
                  </div>
                </div>
              )}

              {rawResponse ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      rawResponse.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      HTTP {rawResponse.status} {rawResponse.statusText}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                      {rawResponse.durationMs}ms
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                      Endpoint: {rawResponse.endpoint}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Request Payload Sent</span>
                    <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-40">
                      {JSON.stringify(rawResponse.requestPayload, null, 2)}
                    </pre>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Raw Server JSON Response</span>
                    <pre className="p-3 bg-slate-950 text-cyan-400 font-mono text-xs rounded-xl overflow-x-auto max-h-60">
                      {JSON.stringify(rawResponse.responseJson, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Database className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">Click "Run Test Registration" to test persistence and inspect raw responses.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Logs & Diagnostics */}
      {activeTab === 'raw_logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span>Database API Gateway & Persistence Diagnosis</span>
          </h2>
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Dual-Layer Registration Architecture</span>
              </h4>
              <p className="text-xs text-blue-800">
                User registrations submitted via the authentication modal or diagnostic test tool are processed by <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">api.php?action=register</code>. The system automatically creates the <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">users</code> table with self-healing columns (<code className="bg-blue-100 px-1 py-0.5 rounded font-mono">password</code>, <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">company_name</code>, <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">role</code>, <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">tier</code>) and writes securely to MySQL PDO with fallback JSON durability stores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Connection Status</span>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className={`w-3 h-3 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span>{dbStatus === 'connected' ? 'Active MySQL PDO Connection' : 'Connection Error / Fallback Mode'}</span>
                </div>
                <p className="text-xs text-slate-500">Host: localhost | Database: a17604c7_tradeheaven_db</p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Records Count</span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {registeredUsers.length} Users Found in Database
                </div>
                <p className="text-xs text-slate-500">Includes buyers, suppliers, and administrators.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Database Users List */}
      {activeTab === 'db_schema' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Registered Users Table Records ({registeredUsers.length})</span>
            </h2>
            <button
              onClick={checkDatabaseConnection}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Users</span>
            </button>
          </div>

          {registeredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registeredUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-500">{u.id}</td>
                      <td className="p-3 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3 text-blue-600 font-medium">{u.email}</td>
                      <td className="p-3">{u.company_name || u.companyName || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          String(u.role).toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800' :
                          String(u.role).toLowerCase() === 'supplier' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {String(u.role || 'buyer').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">{u.country || '-'}</td>
                      <td className="p-3 font-mono text-slate-400">{u.created_at || 'Just now'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No registered user records found in database query response.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
