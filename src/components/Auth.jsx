import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // 1. SIGN UP (Now logs in immediately)
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onLogin(); // Success!
      } else {
        // 2. LOG IN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin(); // Success!
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">BetterMe</h1>
          <p className="text-gray-400 text-sm">30-Day Calisthenics Challenge</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 p-3 rounded-lg mb-4 flex items-center gap-2 text-red-200 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1 font-bold uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500" size={18}/>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="athlete@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1 font-bold uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={18}/>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-4 rounded-xl flex justify-center items-center transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Start Training' : 'Log In')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors">
            {isSignUp ? <><LogIn size={16}/> I have an account</> : <><UserPlus size={16}/> Create new account</>}
          </button>
        </div>
      </div>
    </div>
  );
}
