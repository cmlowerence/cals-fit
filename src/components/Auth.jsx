import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    const { error } = result;
    
    if (error) {
      setError(error.message);
    } else {
      if (!isSignUp) onLogin(); // Auto enter if logging in
      if (isSignUp && !error) alert('Account created! You can now log in.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-sm border border-gray-700 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          {isSignUp ? 'Join the Challenge' : 'Welcome Back'}
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Save your progress to the cloud.</p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18}/>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none"
                placeholder="Email"
                required
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18}/>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none"
                placeholder="Password"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-gray-400 hover:text-white underline">
            {isSignUp ? 'Switch to Login' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}
