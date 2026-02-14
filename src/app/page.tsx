'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bookmark, ArrowRight, Zap, Shield, FolderOpen,
  Tag, Search, Globe, Star, Layers, Sparkles, MousePointerClick
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your bookmarks are private. Only you can access them with Google OAuth authentication.',
    gradient: 'linear-gradient(135deg, #34d399, #06b6d4)',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.15)',
  },
  {
    icon: Zap,
    title: 'Real-time Sync',
    description: 'Add a bookmark in one tab, watch it appear instantly in another. Powered by Supabase.',
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    bg: 'rgba(251, 191, 36, 0.08)',
    border: 'rgba(251, 191, 36, 0.15)',
  },
  {
    icon: FolderOpen,
    title: 'Smart Folders',
    description: 'Organize bookmarks into color-coded folders for effortless navigation and access.',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.15)',
  },
  {
    icon: Tag,
    title: 'Tag System',
    description: 'Add multiple tags to bookmarks for flexible, cross-cutting categorization.',
    gradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
    bg: 'rgba(244, 114, 182, 0.08)',
    border: 'rgba(244, 114, 182, 0.15)',
  },
  {
    icon: Search,
    title: 'Instant Search',
    description: 'Search across titles, URLs, descriptions, and tags — results as you type.',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    bg: 'rgba(6, 182, 212, 0.08)',
    border: 'rgba(6, 182, 212, 0.15)',
  },
  {
    icon: Star,
    title: 'Favorites',
    description: 'Star important bookmarks so your most-used links are always just one click away.',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.15)',
  },
];

const mockBookmarks = [
  { title: 'React Documentation', url: 'react.dev', color: '#61dafb', tags: ['frontend', 'react'] },
  { title: 'Next.js Learn', url: 'nextjs.org', color: '#000', tags: ['framework'] },
  { title: 'Tailwind CSS', url: 'tailwindcss.com', color: '#06b6d4', tags: ['css', 'styling'] },
  { title: 'Supabase Docs', url: 'supabase.com', color: '#3ecf8e', tags: ['backend', 'database'] },
  { title: 'TypeScript', url: 'typescriptlang.org', color: '#3178c6', tags: ['language'] },
  { title: 'Vercel Platform', url: 'vercel.com', color: '#888', tags: ['deploy'] },
];

export default function HomePage() {
  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Floating orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '10%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%', width: 350, height: 350,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.10), transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 500, height: 500, transform: 'translate(-50%,-50%)',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.06), transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'relative', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', maxWidth: 1280, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}>
            <Bookmark style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>MarkVault</span>
        </div>
        <Link href="/login" className="btn-primary" style={{ fontSize: 14, padding: '10px 24px' }}>
          Get Started <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '60px 32px 80px', textAlign: 'center' }}>
        {/* Floating particles */}
        <div className="float" style={{ position: 'absolute', top: 40, left: '15%', width: 8, height: 8, borderRadius: '50%', background: '#6366f1', opacity: 0.6 }} />
        <div className="float" style={{ position: 'absolute', top: 100, right: '20%', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', opacity: 0.5, animationDelay: '2s' }} />
        <div className="float" style={{ position: 'absolute', bottom: 160, left: '30%', width: 10, height: 10, borderRadius: '50%', background: '#f472b6', opacity: 0.4, animationDelay: '4s' }} />
        <div className="float" style={{ position: 'absolute', top: 200, left: '80%', width: 5, height: 5, borderRadius: '50%', background: '#34d399', opacity: 0.5, animationDelay: '1s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 9999,
            background: 'rgba(99,102,241,0.1)', color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.2)',
            fontSize: 13, fontWeight: 600, marginBottom: 32,
          }}>
            <Sparkles style={{ width: 14, height: 14 }} />
            Powered by Supabase Real-time
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            Your Bookmarks,
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #f472b6 70%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Supercharged
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa',
            maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Save, organize, and access your bookmarks from anywhere.
            Real-time sync, smart folders, tags, and a beautiful interface built for productivity.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
              <Globe style={{ width: 20, height: 20 }} />
              Start for Free
            </Link>
            <a href="#features" className="btn-ghost" style={{ fontSize: 16, padding: '14px 36px' }}>
              <MousePointerClick style={{ width: 18, height: 18 }} />
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ marginTop: 80, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
        >
          <div style={{
            background: 'rgba(19,19,26,0.8)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: 28,
            boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 20px 60px rgba(0,0,0,0.4)',
          }}>
            {/* Window header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#34d399' }} />
              <span style={{ marginLeft: 16, fontSize: 13, color: '#71717a', fontWeight: 500 }}>MarkVault Dashboard</span>
            </div>

            {/* Mock bookmark cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {mockBookmarks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  style={{
                    background: '#1a1a24',
                    border: '1px solid #27272a',
                    borderRadius: 14,
                    padding: 16,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color === '#000' ? '#fff' : '#fff',
                      fontSize: 13, fontWeight: 800,
                      boxShadow: `0 4px 12px ${item.color}33`,
                    }}>{item.title[0]}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{item.title}</p>
                      <p style={{ fontSize: 11, color: '#71717a' }}>{item.url}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 600,
                        padding: '2px 10px', borderRadius: 9999,
                        background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.15)',
                      }}>{tag}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '80px 32px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 9999,
            background: 'rgba(99,102,241,0.1)', color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.15)',
            fontSize: 12, fontWeight: 600, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px',
          }}>Features</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>
            Everything you need
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: 18, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            A complete bookmark manager with powerful features to keep your web organized.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'rgba(19,19,26,0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${feature.border}`,
                borderRadius: 18,
                padding: 32,
                cursor: 'default',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Glow effect on top */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '60%', height: 1,
                background: feature.gradient,
                opacity: 0.5,
              }} />

              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: feature.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <feature.icon style={{ width: 28, height: 28, color: feature.gradient.split(',')[0].replace('linear-gradient(135deg, ', '').replace('#', '') }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px', color: '#fff' }}>{feature.title}</h3>
              <p style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.7 }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
        }}>
          {[
            { label: 'Bookmarks Saved', value: '∞', sub: 'Unlimited' },
            { label: 'Sync Speed', value: '<1s', sub: 'Real-time' },
            { label: 'Price', value: '$0', sub: 'Free Forever' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                textAlign: 'center', padding: 32,
                background: 'rgba(19,19,26,0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18,
              }}
            >
              <p style={{
                fontSize: 36, fontWeight: 900, letterSpacing: '-1px',
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 4,
              }}>{stat.value}</p>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{stat.label}</p>
              <p style={{ fontSize: 12, color: '#71717a' }}>{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto', padding: '0 32px 100px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            background: 'rgba(19,19,26,0.8)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: 24,
            padding: '64px 48px',
            border: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 0 80px rgba(99,102,241,0.08)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: -80, right: -80, width: 200, height: 200,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -60, width: 160, height: 160,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.1), transparent 70%)',
            filter: 'blur(40px)',
          }} />

          <Layers style={{ width: 40, height: 40, color: '#6366f1', margin: '0 auto 20px', opacity: 0.6 }} />
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>
            Ready to organize your web?
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: 16, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Join MarkVault and take control of your bookmarks with a modern, beautiful experience.
          </p>
          <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }}>
            Get Started — It&apos;s Free
            <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 32px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: '#71717a' }}>
          © 2025 MarkVault. Built with Next.js, Supabase & Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
