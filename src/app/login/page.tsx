'use client';

import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Bookmark, Sparkles, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Background decorative elements */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%', width: 450, height: 450,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.08), transparent 70%)', filter: 'blur(60px)',
        }} />
        <div className="float" style={{ position: 'absolute', top: '25%', left: '25%', width: 8, height: 8, borderRadius: '50%', background: '#6366f1', opacity: 0.5 }} />
        <div className="float" style={{ position: 'absolute', top: '33%', right: '33%', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', opacity: 0.4, animationDelay: '2s' }} />
        <div className="float" style={{ position: 'absolute', bottom: '25%', left: '33%', width: 10, height: 10, borderRadius: '50%', background: '#f472b6', opacity: 0.3, animationDelay: '4s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, padding: '0 24px' }}
      >
        <div style={{
          background: 'rgba(19,19,26,0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 20,
          padding: 36,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 60px rgba(99,102,241,0.1), 0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 36 }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}>
              <Bookmark style={{ width: 26, height: 26, color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>MarkVault</h1>
              <p style={{ fontSize: 12, color: '#71717a' }}>Smart Bookmark Manager</p>
            </div>
          </motion.div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {[
              { icon: Zap, text: 'Real-time sync across all devices', color: '#fbbf24' },
              { icon: Shield, text: 'Private & secure — only you see your bookmarks', color: '#34d399' },
              { icon: Sparkles, text: 'Smart organization with folders & tags', color: '#a78bfa' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.08)',
                }}
              >
                <feature.icon style={{ width: 16, height: 16, flexShrink: 0, color: feature.color }} />
                <span style={{ fontSize: 13, color: '#a1a1aa' }}>{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Google Sign In Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleGoogleLogin}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '14px 24px', borderRadius: 14,
              background: 'white', color: '#1f2937',
              fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)'; }}
          >
            <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: 11, marginTop: 24, color: '#52525b' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}
