import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { supabase, supabaseConfigured } from "./supabase";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Option 3 — Cool & Crisp: white base, teal-mint accent, near-black type
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --parchment:   #FAF8F6;
    --parchment-2: #F2EDF0;
    --parchment-3: #E8DFE5;
    --ink:         #1E1820;
    --ink-2:       #3A2E3C;
    --ink-3:       #7A6880;
    --ink-4:       #B0A0B5;
    --terracotta:  #9E5C80;
    --terra-light: #C07EA0;
    --terra-pale:  #F0DFE8;
    --sage:        #9E5C80;
    --sage-light:  #D4B0C8;
    --sage-pale:   #F0DFE8;
    --border:      rgba(30,24,32,0.10);
    --border-med:  rgba(30,24,32,0.18);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--parchment);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--parchment);
    position: relative;
    overflow-x: hidden;
  }

  /* grain overlay */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    max-width: 430px;
    margin: 0 auto;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1000;
    opacity: 0.5;
  }

  /* ── Typography ── */
  .display { font-family: 'Playfair Display', serif; }
  .italic  { font-style: italic; }

  /* ── Screen transitions ── */
  .screen {
    animation: fadeUp 0.4s ease forwards;
    padding-bottom: 100px;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Navigation ── */
  .nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: var(--parchment);
    border-top: 1px solid var(--border);
    display: flex;
    padding: 8px 0 20px;
    z-index: 100;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-4);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.2s;
    padding: 6px 0;
  }
  .nav-item.active { color: var(--terracotta); }
  .nav-item svg { width: 20px; height: 20px; }

  /* ── Header ── */
  .screen-header {
    padding: 56px 24px 20px;
    border-bottom: 1px solid var(--border);
  }
  .screen-header .label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-4);
    margin-bottom: 6px;
  }
  .screen-header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.2;
  }

  /* ── Cards ── */
  .card {
    background: var(--parchment-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
  }
  .card-raised {
    background: var(--ink);
    color: var(--parchment);
    border-radius: 16px;
    padding: 24px;
  }

  /* ── Buttons ── */
  .btn-primary {
    width: 100%;
    background: var(--terracotta);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.01em;
  }
  .btn-primary:active { transform: scale(0.98); background: #b05630; }

  .btn-secondary {
    width: 100%;
    background: transparent;
    color: var(--ink-2);
    border: 1.5px solid var(--border-med);
    border-radius: 12px;
    padding: 14px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 400;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .btn-secondary:hover { background: var(--parchment-2); }

  .btn-ghost {
    background: none;
    border: none;
    color: var(--ink-3);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    padding: 8px 0;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .btn-danger {
    background: none;
    border: 1.5px solid #8B2A4A;
    color: #8B2A4A;
    border-radius: 12px;
    padding: 14px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s;
  }
  .btn-danger:hover { background: #f7e8ef; }

  /* ── Inputs ── */
  .input {
    width: 100%;
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--ink);
    outline: none;
    transition: border-color 0.2s;
  }
  .input:focus { border-color: var(--terracotta); }
  .input::placeholder { color: var(--ink-4); }

  textarea.input {
    resize: none;
    line-height: 1.6;
  }

  /* ── Divider ── */
  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--ink-4);
    font-size: 12px;
    margin: 8px 0;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Pill tags ── */
  .pill {
    display: inline-flex;
    align-items: center;
    background: var(--parchment-3);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--ink-3);
    letter-spacing: 0.02em;
  }
  .pill.terra { background: var(--terra-pale); color: var(--terracotta); border-color: rgba(30,24,32,0.2); }
  .pill.sage  { background: var(--sage-pale);  color: var(--sage);       border-color: rgba(122,140,110,0.2); }

  /* ── Slider ── */
  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    background: var(--parchment-3);
    border-radius: 4px;
    outline: none;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    background: var(--terracotta);
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(30,24,32,0.4);
  }

  /* ── Breathing circle ── */
  @keyframes breathe {
    0%, 100% { transform: scale(1);   opacity: 0.7; }
    50%       { transform: scale(1.3); opacity: 1;   }
  }
  .breath-circle {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--terra-pale), var(--parchment-2));
    border: 2px solid rgba(30,24,32,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: breathe 4s ease-in-out infinite;
    margin: 0 auto;
  }

  /* ── Progress bar ── */
  .progress-bar {
    height: 4px;
    background: var(--parchment-3);
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--terracotta);
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  /* ── Stat block ── */
  .stat-block {
    background: var(--parchment-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 40px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1;
  }
  .stat-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-4);
  }

  /* ── Vault message card ── */
  .msg-card {
    border-bottom: 1px solid var(--border);
    padding: 16px 0;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .msg-card:first-child { padding-top: 0; }
  .msg-card:hover { opacity: 0.7; }

  /* ── Voice prompt card ── */
  .prompt-card {
    background: var(--parchment-2);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .prompt-card:hover, .prompt-card.selected {
    border-color: var(--terracotta);
    background: var(--terra-pale);
  }

  /* ── Recording pulse ── */
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0;   }
  }
  .rec-pulse {
    position: absolute;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(30,24,32,0.3);
    animation: pulse-ring 1.4s ease-out infinite;
  }

  /* ── Milestone badge ── */
  .milestone {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--sage-pale);
    border: 1px solid var(--sage-light);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--sage);
  }

  /* ── Logo mark ── */
  .logomark {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.03em;
  }
  .logomark span { color: var(--terracotta); }

  /* ── Landing specific ── */
  .landing-hero {
    padding: 64px 24px 40px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
  }
  .hero-rule {
    width: 40px;
    height: 2px;
    background: var(--terracotta);
    margin: 24px 0;
  }

  /* ── Onboarding ── */
  .onboard-step {
    padding: 64px 24px 32px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .step-dots {
    display: flex;
    gap: 6px;
    margin-bottom: 48px;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--parchment-3);
    transition: background 0.2s, width 0.2s;
  }
  .dot.active {
    background: var(--terracotta);
    width: 20px;
    border-radius: 3px;
  }

  /* ── Urge flow ── */
  .urge-screen {
    padding: 48px 24px 32px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ── Scroll list ── */
  .scroll-list {
    padding: 0 24px;
  }

  /* ── Form label ── */
  .form-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-4);
    margin-bottom: 8px;
    display: block;
  }

  /* ── No contact big number ── */
  .nc-hero {
    background: var(--ink);
    border-radius: 24px;
    padding: 40px 24px;
    text-align: center;
    color: var(--parchment);
    position: relative;
    overflow: hidden;
  }
  .nc-hero::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(30,24,32,0.18);
  }
  .nc-day-num {
    font-family: 'Playfair Display', serif;
    font-size: 96px;
    font-weight: 500;
    line-height: 1;
    color: var(--parchment);
  }
  .nc-day-label {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-4);
    margin-top: 8px;
  }

  /* ── Auth screen ── */
  .auth-screen {
    padding: 64px 24px 32px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Social auth button ── */
  .btn-social {
    width: 100%;
    background: white;
    border: 1.5px solid var(--border-med);
    border-radius: 12px;
    padding: 14px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 400;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--ink-2);
    transition: background 0.2s;
  }
  .btn-social:hover { background: var(--parchment-2); }

  /* ── Paywall ── */
  .paywall-screen {
    padding: 48px 24px 32px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .price-card {
    background: var(--ink);
    border-radius: 24px;
    padding: 32px 24px;
    color: var(--parchment);
    position: relative;
    overflow: hidden;
  }
  .price-card::before {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(30,24,32,0.22);
  }
  .price-amount {
    font-family: 'Playfair Display', serif;
    font-size: 56px;
    font-weight: 500;
    line-height: 1;
  }

  /* ── Confirm modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(28,23,18,0.6);
    display: flex;
    align-items: flex-end;
    z-index: 200;
    max-width: 430px;
    margin: 0 auto;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
  }
  .modal-sheet {
    background: var(--parchment);
    border-radius: 24px 24px 0 0;
    padding: 32px 24px 48px;
    width: 100%;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
`;

// ─── LOGO ────────────────────────────────────────────────────────────────────
const LOGO_IMG = "data:image/png;base64,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";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// 30 daily lines assigned by day count (day % 30)
const DAILY_LINES = [
  "One day. Then another. That's how this works.",                                          // 0
  "You didn't reach out. That's not nothing. That's everything today.",                    // 1
  "It gets quieter. Not all at once — but it does.",                                       // 2
  "You're not behind. There's no schedule for this.",                                      // 3
  "The days are adding up. So is your strength.",                                          // 4
  "You held. That counts.",                                                                 // 5
  "Missing them and knowing it's over can both be true at the same time.",                 // 6
  "Every day you hold the line, something shifts. Even when you can't feel it.",           // 7 — day 7 milestone
  "The noise in your head won't always be this loud.",                                     // 8
  "You're doing this without a map. Of course some days are harder.",                      // 9
  "Staying still when every part of you wanted to move — that took something.",            // 10
  "You don't have to have it figured out. You just have to get through today.",            // 11
  "The sharp edges dull with time. You're not there yet, but you're closer than yesterday.", // 12
  "Grief doesn't mean you made the wrong call.",                                           // 13
  "Still here. Still going. That's the whole job.",                                        // 14 — day 14 milestone
  "You're allowed to mourn something that wasn't good for you.",                           // 15
  "There will be a day when you don't think about them first thing. You're getting there.", // 16
  "Not breaking is a form of progress. Even if it doesn't feel like it.",                  // 17
  "Healing isn't linear. Neither is today. That's okay.",                                  // 18
  "The hardest thing you did today might have been the most important.",                   // 19
  "You've done this day before. You'll do the next one too.",                              // 20
  "The fact that it hurts doesn't mean you're doing it wrong.",                            // 21
  "One hour at a time is allowed to look like one day at a time.",                         // 22
  "It won't always feel this close to the surface.",                                       // 23
  "The distance between you and that moment is growing. Keep going.",                      // 24
  "You're further along than you were. Even if it doesn't show yet.",                      // 25
  "There's no right way to do this. There's just your way.",                               // 26
  "Some days the only win is that you didn't go back. That's a win.",                      // 27
  "You don't have to be over it. You just have to keep going.",                            // 28
  "Softer than yesterday. That's enough.",                                                  // 29
];

const VOICE_PROMPTS = [
  "Say what you actually wanted to say today.",
  "What are you afraid of right now?",
  "Describe the last moment you felt like yourself.",
  "What do you know now that you didn't know then?",
];

const MILESTONES = [7, 14, 30, 60, 90];

function formatVaultMessageDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (startMsg === startToday) return "Today";
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

const LOGO_SRC = "data:image/png;base64,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";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Heart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Lock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Mic: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>,
  TrendingUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  AlertCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 18 15 12 9 6"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 12 4 10"/></svg>,
  Mail: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Flame: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
  Book: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  Play: () => <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  ArrowLeft: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Stop: () => <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  Google: () => <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  Apple: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  MoreDots: () => <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
};

function AuthScreen({ mode, setScreen, setAppTab }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (!supabaseConfigured) {
        throw new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file (see .env.example), then restart the dev server."
        );
      }
      const em = email.trim();
      const pw = password;
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: em,
          password: pw,
          options: name.trim() ? { data: { name: name.trim() } } : undefined,
        });
        if (error) throw error;
        setScreen("paywall");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
        if (error) throw error;
        setScreen("app");
        setAppTab("home");
      }
    } catch (err) {
      setAuthError(err?.message ?? "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="screen auth-screen">
      <button type="button" onClick={() => { setAuthError(null); setScreen("landing"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6, marginBottom: 40, padding: 0 }}>
        <Icons.ArrowLeft /><span style={{ fontSize: 14 }}>Back</span>
      </button>
      <img src={LOGO_IMG} alt="Ctrl + Heart" style={{ width: 200, marginBottom: 4 }} />
      <div className="logomark" style={{ marginBottom: 16 }}>Ctrl <span>+</span> Heart</div>
      <h2 className="display" style={{ fontSize: 28, fontWeight: 500, marginBottom: 32, marginTop: 8 }}>
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h2>
      <form
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
        onSubmit={handleSubmit}
      >
        <button type="button" className="btn-social"><Icons.Google /><span>Continue with Google</span></button>
        <button type="button" className="btn-social"><Icons.Apple /><span>Continue with Apple</span></button>
        <div className="divider">or</div>
        {mode === "signup" && (
          <input
            className="input"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={authLoading}
          />
        )}
        <input
          className="input"
          placeholder="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={authLoading}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={authLoading}
        />
        <button className="btn-primary" style={{ marginTop: 8 }} type="submit" disabled={authLoading}>
          {authLoading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
        {authError ? (
          <p style={{ textAlign: "center", fontSize: 13, color: "#b42318", marginTop: 4 }}>{authError}</p>
        ) : null}
        {mode === "signup"
          ? <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-4)" }}>Already have an account? <button type="button" className="btn-ghost" onClick={() => { setAuthError(null); setScreen("login"); }}>Sign in</button></p>
          : <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-4)" }}>New here? <button type="button" className="btn-ghost" onClick={() => { setAuthError(null); setScreen("signup"); }}>Create account</button></p>
        }
      </form>
    </div>
  );
}

function VaultScreen({
  messages,
  setMessages,
  messagesLoading,
  viewMsg,
  setViewMsg,
  modal,
  setModal,
}) {
  const draftRef = useRef(null);
  const [composeKey, setComposeKey] = useState(0);
  const [composing, setComposing] = useState(false);
  const [vaultSaveBusy, setVaultSaveBusy] = useState(false);
  const [vaultSaveError, setVaultSaveError] = useState(null);
  const [vaultBurnBusy, setVaultBurnBusy] = useState(false);

  if (viewMsg) {
    return (
      <div className="screen">
        <div style={{ padding: "56px 24px 0" }}>
          <button type="button" onClick={() => setViewMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6, marginBottom: 32, padding: 0 }}>
            <Icons.ArrowLeft /><span style={{ fontSize: 14 }}>Back to vault</span>
          </button>
          <div style={{ fontSize: 12, color: "var(--ink-4)", marginBottom: 20 }}>{viewMsg.date}</div>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--ink)", fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginBottom: 40 }}>
            {viewMsg.body}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" className="btn-secondary" onClick={() => setViewMsg(null)}>Keep it</button>
            <button type="button" className="btn-danger" onClick={() => setModal({ type: "burn", id: viewMsg.id })}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icons.Flame /> Burn it
              </span>
            </button>
          </div>
        </div>
        {modal?.type === "burn" && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <h3 className="display" style={{ fontSize: 22, marginBottom: 8 }}>Burn this message?</h3>
              <p style={{ color: "var(--ink-3)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                This is permanent. The message will be gone.
              </p>
              <button type="button" className="btn-danger" style={{ marginBottom: 10 }} disabled={vaultBurnBusy} onClick={async () => {
                const id = modal.id;
                setVaultBurnBusy(true);
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  const uid = session?.user?.id;
                  if (!uid) {
                    setModal(null);
                    setViewMsg(null);
                    return;
                  }
                  const { error } = await supabase.from("unsent_messages").delete().eq("id", id).eq("user_id", uid);
                  if (error) throw error;
                  setMessages(m => m.filter(msg => msg.id !== id));
                  setModal(null);
                  setViewMsg(null);
                } catch (err) {
                  console.error(err);
                } finally {
                  setVaultBurnBusy(false);
                }
              }}>{vaultBurnBusy ? "Removing…" : "Yes, burn it"}</button>
              <button type="button" className="btn-ghost" style={{ width: "100%", textAlign: "center" }} onClick={() => setModal(null)}>Keep it</button>
            </div>
          </div>
        )}
      </div>
    );
  }
  if (composing) {
    return (
      <div className="screen">
        <div style={{ padding: "56px 24px 0" }}>
          <button type="button" onClick={() => { setVaultSaveError(null); setComposing(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6, marginBottom: 32, padding: 0 }}>
            <Icons.ArrowLeft /><span style={{ fontSize: 14 }}>Back</span>
          </button>
          <h2 className="display" style={{ fontSize: 26, marginBottom: 8, lineHeight: 1.2 }}>Say what you need to say.</h2>
          <p style={{ color: "var(--ink-4)", fontSize: 14, marginBottom: 24 }}>It won't be sent. It just needs to exist.</p>
          <textarea
            key={composeKey}
            ref={draftRef}
            className="input"
            rows={12}
            placeholder="Dear them..."
            defaultValue=""
            style={{ marginBottom: 16 }}
          />
          {vaultSaveError ? (
            <p style={{ fontSize: 13, color: "#b42318", marginBottom: 12 }}>{vaultSaveError}</p>
          ) : null}
          <button type="button" className="btn-primary" disabled={vaultSaveBusy} onClick={async () => {
            const body = (draftRef.current?.value ?? "").trim();
            if (!body) return;
            setVaultSaveError(null);
            setVaultSaveBusy(true);
            try {
              const { data: { session } } = await supabase.auth.getSession();
              const uid = session?.user?.id;
              if (!uid) {
                setVaultSaveError("Sign in to save messages.");
                return;
              }
              const { data, error } = await supabase
                .from("unsent_messages")
                .insert({ user_id: uid, body })
                .select("id, body, created_at")
                .single();
              if (error) throw error;
              setMessages(m => [{
                id: data.id,
                body: data.body,
                date: formatVaultMessageDate(data.created_at),
              }, ...m]);
              if (draftRef.current) draftRef.current.value = "";
              setComposing(false);
            } catch (err) {
              setVaultSaveError(err?.message ?? "Could not save.");
            } finally {
              setVaultSaveBusy(false);
            }
          }}>{vaultSaveBusy ? "Saving…" : "Save to vault"}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="screen">
      <div className="screen-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="label">Private</div>
          <h1>Unsent Messages</h1>
        </div>
        <button type="button" className="btn-primary" style={{ width: "auto", padding: "10px 16px", fontSize: 13, borderRadius: 10, marginTop: 20 }}
          onClick={() => { setVaultSaveError(null); setComposeKey(k => k + 1); setComposing(true); }}>+ Write</button>
      </div>
      <div className="scroll-list">
        {messagesLoading && (
          <p style={{ color: "var(--ink-4)", fontSize: 14, padding: "32px 0", textAlign: "center" }}>Loading your vault…</p>
        )}
        {!messagesLoading && messages.length === 0 && (
          <p style={{ color: "var(--ink-4)", fontSize: 14, padding: "32px 0", textAlign: "center", lineHeight: 1.6 }}>
            Nothing here yet.<br />Write what you can't send.
          </p>
        )}
        {!messagesLoading && messages.map(m => (
          <div key={m.id} className="msg-card" onClick={() => setViewMsg(m)}>
            <div style={{ fontSize: 12, color: "var(--ink-4)", marginBottom: 6 }}>{m.date}</div>
            <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {m.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function CtrlHeart() {
  const [screen, setScreen] = useState("landing"); // landing | signup | login | onboard | paywall | app
  const [appTab, setAppTab] = useState("home");
  const [urgeStep, setUrgeStep] = useState(0);
  const [modal, setModal] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [checkIn, setCheckIn] = useState(null); // null | { milestone: 30|90|180, step: 0|1|2, answers: [] }

  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardData, setOnboardData] = useState({ name: "", endDate: "", struggle: "" });

  // App data
  const [ncDays, setNcDays] = useState(23);
  const [ncBreaks, setNcBreaks] = useState([
    { date: "Mar 12", note: "Replied to their message." },
  ]);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [triggers, setTriggers] = useState([
    { id: 1, text: "Saw a photo on Instagram", intensity: 8, tag: "memory", date: "Apr 21" },
    { id: 2, text: "Their favourite song came on at the café", intensity: 6, tag: "place", date: "Apr 19" },
    { id: 3, text: "Ran into a mutual friend", intensity: 7, tag: "person", date: "Apr 15" },
  ]);
  const [voiceNotes, setVoiceNotes] = useState([
    { id: 1, prompt: "Say what you actually wanted to say today.", date: "Apr 20", duration: 142 },
    { id: 2, prompt: "What are you afraid of right now?", date: "Apr 17", duration: 89 },
  ]);

  // Forms
  const [triggerText, setTriggerText] = useState("");
  const [triggerIntensity, setTriggerIntensity] = useState(5);
  const [triggerTag, setTriggerTag] = useState("memory");
  const [urgeText, setUrgeText] = useState("");
  const [urgeIntensity, setUrgeIntensity] = useState(5);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [breatheSeconds, setBreatheSeconds] = useState(60);
  const [breathePhase, setBreathePhase] = useState("Breathe in");
  const [viewMsg, setViewMsg] = useState(null);
  const [breakNote, setBreakNote] = useState("");
  const [breakContactOpen, setBreakContactOpen] = useState(false);

  // Timers
  const recordRef = useRef(null);
  const breatheRef = useRef(null);

  useEffect(() => {
    if (urgeStep === 1) {
      setBreatheSeconds(60);
      const phases = ["Breathe in", "Hold", "Breathe out", "Hold"];
      let i = 0;
      breatheRef.current = setInterval(() => {
        setBreatheSeconds(s => {
          if (s <= 1) { clearInterval(breatheRef.current); return 0; }
          return s - 1;
        });
        i++;
        setBreathePhase(phases[Math.floor(i / 4) % 4]);
      }, 1000);
      return () => clearInterval(breatheRef.current);
    }
  }, [urgeStep]);

  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      recordRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    } else {
      clearInterval(recordRef.current);
    }
    return () => clearInterval(recordRef.current);
  }, [isRecording]);

  useLayoutEffect(() => {
    if (screen === "urge" && urgeStep < 1) setUrgeStep(1);
  }, [screen, urgeStep]);

  useEffect(() => {
    if (screen !== "app") return;
    let cancelled = false;
    setMessagesLoading(true);
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session?.user?.id) {
        setMessages([]);
        setMessagesLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("unsent_messages")
        .select("id, body, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setMessagesLoading(false);
      if (error) {
        console.error(error);
        setMessages([]);
        return;
      }
      setMessages(
        (data ?? []).map(row => ({
          id: row.id,
          body: row.body,
          date: formatVaultMessageDate(row.created_at),
        }))
      );
    })();
    return () => { cancelled = true; };
  }, [screen]);

  const fmtDuration = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const nextMilestone = MILESTONES.find(m => m > ncDays) || 100;
  const currentMilestone = MILESTONES.filter(m => m <= ncDays).pop();

  // ── Screens ─────────────────────────────────────────────────────────────────

  const LandingScreen = () => (
    <div className="screen landing-hero">
      <div>
        <img src={LOGO_IMG} alt="Ctrl + Heart" style={{ width: 240, marginBottom: 4 }} />
        <div className="logomark" style={{ marginBottom: 0 }}>Ctrl <span>+</span> Heart</div>
        <div style={{ display: "inline-flex", alignItems: "center", margin: "16px 0 20px", background: "var(--terra-pale)", border: "1px solid rgba(30,24,32,0.2)", borderRadius: 100, padding: "5px 14px" }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--terracotta)" }}>Breakup Recovery</span>
        </div>
        <h1 className="display" style={{ fontSize: 32, lineHeight: 1.2, fontWeight: 500, marginBottom: 16 }}>
          Private tools built for the hard moments, <em>not the healed ones.</em>
        </h1>
        <p style={{ color: "var(--ink-3)", lineHeight: 1.7, fontSize: 15, maxWidth: 310 }}>
          Structure for when the urge hits, the feelings won't settle, and you need to get through it without breaking.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-4)", letterSpacing: "0.01em" }}>
          Not a therapy app. Not a community.
        </p>
        <button className="btn-primary" onClick={() => setScreen("signup")}>Get started</button>
        <button className="btn-secondary" onClick={() => setScreen("login")}>I already have an account</button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-4)", marginTop: 4 }}>
          Private by design. Your data is yours alone.
        </p>
      </div>
    </div>
  );

  const PaywallScreen = () => {
    const [selectedPlan, setSelectedPlan] = useState("3month");
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);
    const paymentLinks = {
      "1month": import.meta.env.VITE_STRIPE_PAYMENT_LINK_1MONTH,
      "3month": import.meta.env.VITE_STRIPE_PAYMENT_LINK_3MONTH,
      "6month": import.meta.env.VITE_STRIPE_PAYMENT_LINK_6MONTH,
    };
    const plans = [
      { id: "1month",  label: "1 month",  price: "$12.00", per: "$12.00 / month", sub: null },
      { id: "3month",  label: "3 months", price: "$29.99", per: "$10.00 / month", sub: "Most chosen" },
      { id: "6month",  label: "6 months", price: "$49.99", per: "$8.33 / month",  sub: "Best value" },
    ];
    const selected = plans.find(p => p.id === selectedPlan);
    return (
      <div className="screen paywall-screen">
        <img src={LOGO_IMG} alt="Ctrl + Heart" style={{ width: 200, marginBottom: 4 }} />
        <div className="logomark" style={{ marginBottom: 28 }}>Ctrl <span>+</span> Heart</div>
        <h2 className="display" style={{ fontSize: 30, fontWeight: 500, marginBottom: 10, lineHeight: 1.2 }}>
          Private tools.<br /><em>For the hard moments.</em>
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 15, lineHeight: 1.65, marginBottom: 28 }}>
          Not a community. Not a chatbot. Structure you can actually use when you need it most.
        </p>

        {/* Plan selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {plans.map(plan => (
            <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
              style={{
                background: selectedPlan === plan.id ? "var(--ink)" : "var(--parchment-2)",
                border: "1.5px solid " + (selectedPlan === plan.id ? "var(--ink)" : "var(--border)"),
                borderRadius: 14, padding: "16px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  border: "2px solid " + (selectedPlan === plan.id ? "var(--terracotta)" : "var(--border-med)"),
                  background: selectedPlan === plan.id ? "var(--terracotta)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selectedPlan === plan.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: selectedPlan === plan.id ? "var(--parchment)" : "var(--ink)", marginBottom: 2 }}>
                    {plan.label}
                  </div>
                  <div style={{ fontSize: 12, color: selectedPlan === plan.id ? "rgba(245,240,232,0.55)" : "var(--ink-4)" }}>
                    {plan.per}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: selectedPlan === plan.id ? "var(--parchment)" : "var(--ink)" }}>
                  {plan.price}
                </span>
                {plan.sub && (
                  <span style={{
                    fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
                    background: selectedPlan === plan.id ? "var(--terracotta)" : "var(--sage-pale)",
                    color: selectedPlan === plan.id ? "white" : "var(--sage)",
                    padding: "3px 8px", borderRadius: 100,
                  }}>{plan.sub}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* What's included — collapsed, clean */}
        <div style={{ background: "var(--parchment-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>
            What's included
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
            {["Urge interruption", "No contact tracker", "Unsent message vault", "Voice note prompts", "Trigger log", "Progress tracking"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--terracotta)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          disabled={checkoutLoading}
          onClick={async () => {
            setCheckoutError(null);
            setCheckoutLoading(true);
            try {
              const url = paymentLinks[selectedPlan];
              if (!url) throw new Error("Missing Stripe Payment Link for this plan.");
              window.location.href = url;
            } catch (e) {
              setCheckoutError(e?.message || "Checkout failed. Please try again.");
              setCheckoutLoading(false);
            }
          }}
        >
          {checkoutLoading ? "Redirecting…" : `Get access — ${selected.price}`}
        </button>
        {import.meta.env.DEV && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setCheckoutError(null);
              setCheckoutLoading(false);
              setScreen("app");
              setAppTab("home");
            }}
            style={{
              marginTop: 10,
              padding: "8px 12px",
              fontSize: 13,
              color: "var(--ink-4)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Skip for now (testing)
          </button>
        )}
        {checkoutError && (
          <p style={{ textAlign: "center", fontSize: 13, color: "#b42318", marginTop: 10 }}>
            {checkoutError}
          </p>
        )}
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-4)", marginTop: 14, lineHeight: 1.6 }}>
          Secure payment via Stripe.<br />Cancel any time. Your data is never shared.
        </p>
      </div>
    );
  };

  const OnboardScreen = () => {
    const steps = [
      {
        label: "Step 1 of 3",
        title: "What should we call you?",
        sub: null,
        content: (
          <input className="input" placeholder="Your first name" value={onboardData.name}
            onChange={e => setOnboardData(d => ({ ...d, name: e.target.value }))} />
        )
      },
      {
        label: "Step 2 of 3",
        title: "When did it end?",
        sub: "This sets your no-contact start date. You can adjust it at any time.",
        content: (
          <input className="input" type="date" value={onboardData.endDate}
            onChange={e => setOnboardData(d => ({ ...d, endDate: e.target.value }))} />
        )
      },
      {
        label: "Step 3 of 3",
        title: "What's hitting hardest right now?",
        sub: "This shapes what the app surfaces first. You can change it later.",
        content: (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "The urge to reach out", sub: "Difficulty holding no contact" },
              { label: "Processing what happened", sub: "Making sense of it emotionally" },
              { label: "Moving forward", sub: "Rebuilding a sense of yourself" },
            ].map(s => (
              <button key={s.label} onClick={() => setOnboardData(d => ({ ...d, struggle: s.label }))}
                style={{
                  background: onboardData.struggle === s.label ? "var(--ink)" : "var(--parchment-2)",
                  color: onboardData.struggle === s.label ? "var(--parchment)" : "var(--ink)",
                  border: "1.5px solid " + (onboardData.struggle === s.label ? "var(--ink)" : "var(--border)"),
                  borderRadius: 12, padding: "14px 18px", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{s.sub}</div>
              </button>
            ))}
          </div>
        )
      }
    ];
    const step = steps[onboardStep];
    return (
      <div className="screen onboard-step">
        <div className="step-dots">
          {steps.map((_, i) => <div key={i} className={`dot ${i <= onboardStep ? "active" : ""}`} style={i < onboardStep ? { background: "var(--sage)", width: 20, borderRadius: 3 } : {}} />)}
        </div>
        <div style={{ flex: 1 }}>
          <span className="form-label">{step.label}</span>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 500, marginBottom: step.sub ? 10 : 28, lineHeight: 1.2 }}>{step.title}</h2>
          {step.sub && <p style={{ color: "var(--ink-4)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{step.sub}</p>}
          {step.content}
        </div>
        <button className="btn-primary" onClick={() => {
          if (onboardStep < steps.length - 1) setOnboardStep(s => s + 1);
          else { setScreen("app"); setAppTab("home"); }
        }}>
          {onboardStep < steps.length - 1 ? "Continue" : "Take me in"}
        </button>
      </div>
    );
  };

  // ── MILESTONE CHECK-IN ───────────────────────────────────────────────────────
  const MilestoneCheckIn = () => {
    const { milestone, step, answers } = checkIn;
    const is30  = milestone === 30;
    const is90  = milestone === 90;
    const is180 = milestone === 180;

    const questions = is30 ? [
      { q: "Do you still feel the urge to reach out most days?", opts: ["Yes, most days", "Some days", "Rarely now"] },
      { q: "Has the intensity of what you're feeling shifted since day one?", opts: ["Still the same", "A little lighter", "Noticeably lighter"] },
      { q: "How are you feeling about continuing with no contact?", opts: ["I need to keep going", "I'm unsure", "I feel ready to reassess"] },
    ] : is90 ? [
      { q: "When the urge to reach out hits, how do you handle it now?", opts: ["Still really hard", "I get through it", "It barely comes anymore"] },
      { q: "Do you feel like you're starting to rebuild a sense of yourself?", opts: ["Not yet", "Slowly, yes", "More than I expected"] },
      { q: "Does this app still feel like something you need right now?", opts: ["Yes, definitely", "Sometimes", "Less than before"] },
    ] : [
      { q: "Six months in — how would you honestly describe where you are?", opts: ["Still in it", "Getting there", "Mostly through it"] },
      { q: "Do you find yourself reaching for this app as often?", opts: ["Yes, regularly", "Now and then", "Rarely anymore"] },
      { q: "What feels right as a next step for you?", opts: ["Keep going with the app", "Take a break and return if needed", "I think I'm ready to step away"] },
    ];

    const milestoneLabel = is30 ? "One month" : is90 ? "Three months" : "Six months";

    // Completion screen
    if (step >= questions.length) {
      const lastAnswer = answers[answers.length - 1];
      const stepping = lastAnswer === "I think I'm ready to step away" || lastAnswer === "I feel ready to reassess";
      const unsure   = lastAnswer === "I'm unsure" || lastAnswer === "Less than before" || lastAnswer === "Take a break and return if needed";
      const keeping  = !stepping && !unsure;

      // Content per outcome
      const content = stepping ? {
        label:    "Your journey",
        headline: "That's the whole point.",
        body:     "You came here because something broke. You stayed because you were doing the work — even on the days it didn't feel like it. The fact that you need this less now isn't an ending. It's what the whole thing was for.",
        closing:  "You can always come back. The tools will be here.",
        quote:    "Healing doesn't announce itself. It just quietly shows up in who you've become.",
        cta1:     "Leave for now",
        cta2:     "Actually, I'll stay",
        cta1Action: "leave",
        cta2Action: "stay",
      } : unsure ? {
        label:    "Take your time",
        headline: "You don't have to decide today.",
        body:     "There's no deadline on knowing when you're done. Some days the app will feel essential. Others you won't open it at all. Both of those are fine. Keep it close for now and let yourself decide when you're actually ready.",
        closing:  "Check in with yourself again in a few weeks.",
        quote:    "Recovery isn't linear. Neither is knowing you've recovered.",
        cta1:     "Back to the app",
        cta2:     null,
        cta1Action: "stay",
        cta2Action: null,
      } : {
        label:    `${milestoneLabel} in`,
        headline: "Keep going. You're doing the work.",
        body:     `${milestoneLabel} without contact. ${milestone === 30 ? "Most people don't make it this far. The urge is real and you've been meeting it with something stronger every single day." : milestone === 90 ? "Ninety days of choosing yourself, even when it was hard. The version of you who started this would not believe where you are now." : "Six months. That's not a streak — that's a rebuilt life. Whatever comes next, you know what you're capable of."}`,
        closing:  "The tools are here for as long as you need them.",
        quote:    milestone === 30
          ? "Every day you held was a decision. Those days add up to something real."
          : milestone === 90
          ? "You didn't just survive it. You showed up for yourself, again and again."
          : "Six months ago you needed structure to get through the hour. Look at you now.",
        cta1:     "Back to the app",
        cta2:     null,
        cta1Action: "stay",
        cta2Action: null,
      };

      return (
        <div className="screen" style={{ padding: "48px 24px 32px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Label */}
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 20 }}>
              {milestoneLabel} check-in — {content.label}
            </div>

            {/* Headline */}
            <h2 className="display" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.2, marginBottom: 20, color: "var(--ink)" }}>
              {content.headline}
            </h2>

            {/* Body */}
            <p style={{ color: "var(--ink-3)", fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>
              {content.body}
            </p>

            {/* Quote block */}
            <div style={{ borderLeft: "2px solid var(--terracotta)", paddingLeft: 18, marginBottom: 28 }}>
              <p className="display italic" style={{ fontSize: 16, lineHeight: 1.65, color: "var(--ink-2)", fontWeight: 400 }}>
                "{content.quote}"
              </p>
            </div>

            {/* Closing line */}
            <p style={{ fontSize: 13, color: "var(--ink-4)", lineHeight: 1.6, fontStyle: "italic" }}>
              {content.closing}
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32 }}>
            {stepping ? (
              <>
                <button className="btn-secondary" onClick={() => { setCheckIn(null); }}>
                  {content.cta2}
                </button>
                <button className="btn-ghost" style={{ textAlign: "center", color: "var(--ink-4)" }}
                  onClick={() => { setCheckIn(null); setScreen("landing"); }}>
                  {content.cta1}
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setCheckIn(null)}>
                {content.cta1}
              </button>
            )}
          </div>
        </div>
      );
    }

    const current = questions[step];
    return (
      <div className="screen" style={{ padding: "48px 24px 32px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 4, transition: "all 0.3s",
              width: i === step ? 24 : 6,
              background: i < step ? "var(--sage)" : i === step ? "var(--terracotta)" : "var(--parchment-3)"
            }} />
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>
            {milestoneLabel} — Question {step + 1} of {questions.length}
          </div>
          <h2 className="display" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.3, marginBottom: 32 }}>
            {current.q}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {current.opts.map(opt => (
              <button key={opt}
                onClick={() => setCheckIn(ci => ({ ...ci, step: ci.step + 1, answers: [...ci.answers, opt] }))}
                style={{
                  background: "var(--parchment-2)", border: "1.5px solid var(--border)",
                  borderRadius: 14, padding: "16px 20px", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15, cursor: "pointer", textAlign: "left", color: "var(--ink)",
                  transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                <span>{opt}</span>
                <span style={{ color: "var(--ink-4)" }}><Icons.ChevronRight /></span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn-ghost" style={{ textAlign: "center", marginTop: 24 }}
          onClick={() => setCheckIn(null)}>
          Skip for now
        </button>
      </div>
    );
  };

  // ── MORE MENU ────────────────────────────────────────────────────────────────
  const MoreMenu = () => (
    <div className="modal-overlay" onClick={() => setMoreOpen(false)}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)" }}>More</span>
          <button onClick={() => setMoreOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", padding: 4 }}>
            <Icons.X />
          </button>
        </div>
        {[
          { label: "Trigger Log", sub: `${triggers.length} entries`, icon: <Icons.AlertCircle />, tab: "triggers" },
          { label: "Account", sub: "Subscription & settings", icon: <Icons.User />, tab: "account" },
        ].map(item => (
          <button key={item.tab} onClick={() => { setAppTab(item.tab); setMoreOpen(false); }}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--parchment-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--terracotta)", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-4)" }}>{item.sub}</div>
            </div>
            <div style={{ marginLeft: "auto", color: "var(--ink-4)" }}><Icons.ChevronRight /></div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── APP SCREENS ─────────────────────────────────────────────────────────────

  const HomeScreen = () => {
    const dayLine = DAILY_LINES[ncDays % 30];
    const checkInMilestone = [30, 90, 180].includes(ncDays) ? ncDays : null;
    return (
      <div className="screen" style={{ padding: "56px 24px 0" }}>
        {/* Milestone check-in banner */}
        {checkInMilestone && !checkIn && (
          <div style={{ background: "var(--ink)", borderRadius: 16, padding: "20px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(30,24,32,0.2)" }} />
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--sage-light)", marginBottom: 8 }}>
              Day {checkInMilestone} — Milestone
            </div>
            <p className="display" style={{ fontSize: 18, fontWeight: 500, color: "var(--parchment)", lineHeight: 1.3, marginBottom: 16 }}>
              You've made it {checkInMilestone === 30 ? "one month" : checkInMilestone === 90 ? "three months" : "six months"}. Take a moment.
            </p>
            <button className="btn-primary" style={{ fontSize: 14, padding: "12px 20px" }}
              onClick={() => setCheckIn({ milestone: checkInMilestone, step: 0, answers: [] })}>
              Do the check-in
            </button>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 6 }}>
              {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="display" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.2 }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}.
            </h1>
          </div>
          <button onClick={() => setMoreOpen(true)}
            style={{ background: "var(--parchment-2)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-3)", flexShrink: 0, marginTop: 20 }}>
            <Icons.MoreDots />
          </button>
        </div>

        {/* Daily line */}
        <div style={{ borderLeft: "2px solid var(--terracotta)", paddingLeft: 16, marginBottom: 32 }}>
          <p className="display italic" style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", fontWeight: 400 }}>
            "{dayLine}"
          </p>
        </div>

        {/* NC streak */}
        <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 4 }}>No contact</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="display" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>{ncDays}</span>
              <span style={{ color: "var(--ink-3)", fontSize: 14 }}>days</span>
            </div>
            {currentMilestone && <div className="milestone" style={{ marginTop: 8 }}>✦ Day {currentMilestone} reached</div>}
          </div>
          <button onClick={() => setAppTab("nocontact")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)" }}>
            <Icons.ChevronRight />
          </button>
        </div>

        {/* Primary CTA */}
        <button className="btn-primary" style={{ marginBottom: 24, fontSize: 17, padding: "20px 24px", borderRadius: 16, background: "var(--ink)", position: "relative", overflow: "hidden" }}
          onClick={() => { setUrgeStep(1); setScreen("urge"); }}>
          <span style={{ position: "relative", zIndex: 1 }}>I want to reach out to them</span>
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(30,24,32,0.25)" }} />
        </button>

        {/* Feature tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Vault", sub: `${messages.length} messages`, icon: <Icons.Book />, tab: "vault" },
            { label: "Triggers", sub: `${triggers.length} logged`, icon: <Icons.AlertCircle />, tab: "triggers" },
            { label: "Voice", sub: `${voiceNotes.length} recordings`, icon: <Icons.Mic />, tab: "voice" },
            { label: "Progress", sub: `Day ${ncDays}`, icon: <Icons.TrendingUp />, tab: "progress" },
          ].map(t => (
            <button key={t.tab} className="card" style={{ border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.2s" }}
              onClick={() => setAppTab(t.tab)}>
              <div style={{ color: "var(--terracotta)", marginBottom: 10 }}>{t.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-4)" }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const NoContactScreen = () => (
    <div className="screen">
      <div className="screen-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div><div className="label">Recovery tool</div><h1>No Contact</h1></div>
        <button onClick={() => setMoreOpen(true)} style={{ background: "var(--parchment-2)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-3)", flexShrink: 0, marginTop: 20 }}>
          <Icons.MoreDots />
        </button>
      </div>
      <div style={{ padding: "24px 24px 0" }}>
        <div className="nc-hero" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(245,240,232,0.5)", marginBottom: 12 }}>Days without contact</div>
          <div className="nc-day-num">{ncDays}</div>
          <div className="nc-day-label">days</div>
          {currentMilestone && (
            <div style={{ marginTop: 20 }}>
              <div className="milestone" style={{ background: "rgba(122,140,110,0.3)", borderColor: "rgba(197,212,188,0.4)", color: "var(--sage-light)" }}>
                ✦ Day {currentMilestone} reached
              </div>
            </div>
          )}
        </div>

        {/* Next milestone */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Next milestone</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Day {nextMilestone}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(ncDays / nextMilestone) * 100}%` }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 8 }}>{nextMilestone - ncDays} days to go</div>
        </div>

        <button className="btn-danger" style={{ marginBottom: 24 }} onClick={() => setBreakContactOpen(true)}>
          I broke contact
        </button>

        {ncBreaks.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>Break history</div>
            {ncBreaks.map((b, i) => (
              <div key={i} style={{ borderBottom: "1px solid var(--border)", padding: "12px 0" }}>
                <div style={{ fontSize: 12, color: "var(--ink-4)", marginBottom: 4 }}>{b.date}</div>
                <div style={{ fontSize: 14, color: "var(--ink-2)" }}>{b.note}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Break contact modal */}
      {breakContactOpen && (
        <div className="modal-overlay" onClick={() => setBreakContactOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="display" style={{ fontSize: 22, marginBottom: 8 }}>Reset your streak?</h3>
            <p style={{ color: "var(--ink-3)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              This will reset your counter. What happened? (optional)
            </p>
            <textarea className="input" rows={3} placeholder="Write a note for yourself..." value={breakNote}
              onChange={e => setBreakNote(e.target.value)} style={{ marginBottom: 16 }} />
            <button className="btn-danger" style={{ marginBottom: 10 }} onClick={() => {
              setNcBreaks(b => [{ date: "Today", note: breakNote || "No note." }, ...b]);
              setNcDays(0); setBreakNote(""); setBreakContactOpen(false);
            }}>Reset counter</button>
            <button className="btn-ghost" style={{ width: "100%", textAlign: "center" }} onClick={() => setBreakContactOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  const TriggersScreen = () => {
    const [adding, setAdding] = useState(false);
    const tags = ["memory", "person", "place", "date", "other"];
    return (
      <div className="screen">
        <div className="screen-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div><div className="label">Log</div><h1>Triggers</h1></div>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button className="btn-primary" style={{ width: "auto", padding: "10px 16px", fontSize: 13, borderRadius: 10 }}
              onClick={() => setAdding(true)}>+ Add</button>
            <button onClick={() => setMoreOpen(true)} style={{ background: "var(--parchment-2)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-3)", flexShrink: 0 }}>
              <Icons.MoreDots />
            </button>
          </div>
        </div>
        {adding && (
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--parchment-2)" }}>
            <span className="form-label">What triggered you?</span>
            <textarea className="input" rows={2} placeholder="Describe what happened..." value={triggerText}
              onChange={e => setTriggerText(e.target.value)} style={{ marginBottom: 16 }} />
            <span className="form-label">Intensity: {triggerIntensity}/10</span>
            <input type="range" className="slider" min={1} max={10} value={triggerIntensity}
              onChange={e => setTriggerIntensity(Number(e.target.value))} style={{ marginBottom: 16 }} />
            <span className="form-label">Tag</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {tags.map(t => (
                <button key={t} onClick={() => setTriggerTag(t)}
                  style={{ background: triggerTag === t ? "var(--ink)" : "transparent", color: triggerTag === t ? "var(--parchment)" : "var(--ink-3)", border: "1.5px solid " + (triggerTag === t ? "var(--ink)" : "var(--border-med)"), borderRadius: 100, padding: "6px 14px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                if (triggerText.trim()) {
                  setTriggers(t => [{ id: Date.now(), text: triggerText.trim(), intensity: triggerIntensity, tag: triggerTag, date: "Today" }, ...t]);
                  setTriggerText(""); setTriggerIntensity(5); setAdding(false);
                }
              }}>Save</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="scroll-list">
          {triggers.map(t => (
            <div key={t.id} style={{ borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="pill">{t.tag}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{t.date}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.intensity >= 7 ? "var(--terracotta)" : t.intensity >= 4 ? "var(--terra-light)" : "var(--sage-light)" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-3)" }}>{t.intensity}/10</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const VoiceScreen = () => {
    const [recording, setRecording] = useState(false);
    return (
      <div className="screen">
        <div className="screen-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div><div className="label">Speak it</div><h1>Voice Notes</h1></div>
          <button onClick={() => setMoreOpen(true)} style={{ background: "var(--parchment-2)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-3)", flexShrink: 0, marginTop: 20 }}>
            <Icons.MoreDots />
          </button>
        </div>
        <div style={{ padding: "24px 24px 0" }}>
          <p style={{ color: "var(--ink-3)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Choose a prompt. Then speak. Nothing will be sent.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {VOICE_PROMPTS.map((p, i) => (
              <div key={i} className={`prompt-card ${selectedPrompt === i ? "selected" : ""}`}
                onClick={() => setSelectedPrompt(i)}>
                <p className="display italic" style={{ fontSize: 15, lineHeight: 1.55, color: selectedPrompt === i ? "var(--terracotta)" : "var(--ink-2)" }}>
                  "{p}"
                </p>
              </div>
            ))}
          </div>

          {selectedPrompt !== null && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              {isRecording ? (
                <>
                  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <div className="rec-pulse" />
                    <button onClick={() => {
                      setIsRecording(false);
                      setVoiceNotes(v => [{ id: Date.now(), prompt: VOICE_PROMPTS[selectedPrompt], date: "Today", duration: recordSeconds }, ...v]);
                      setSelectedPrompt(null);
                    }} style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", background: "var(--terracotta)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icons.Stop />
                    </button>
                  </div>
                  <div style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>
                    {fmtDuration(recordSeconds)}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-4)" }}>Tap to stop</p>
                </>
              ) : (
                <button onClick={() => setIsRecording(true)} style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--terracotta)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Icons.Mic />
                </button>
              )}
              {!isRecording && <p style={{ fontSize: 13, color: "var(--ink-4)" }}>Tap to record</p>}
            </div>
          )}

          {voiceNotes.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>Saved recordings</div>
              {voiceNotes.map(v => (
                <div key={v.id} style={{ borderBottom: "1px solid var(--border)", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p className="display italic" style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 4, lineHeight: 1.4 }}>"{v.prompt}"</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{v.date}</span>
                      <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{fmtDuration(v.duration)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ background: "none", border: "none", color: "var(--ink-4)", cursor: "pointer", padding: 4 }}><Icons.Play /></button>
                    <button onClick={() => setVoiceNotes(n => n.filter(x => x.id !== v.id))} style={{ background: "none", border: "none", color: "var(--ink-4)", cursor: "pointer", padding: 4 }}><Icons.Trash /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const ProgressScreen = () => {
    const daysSinceStart = ncDays + ncBreaks.length * 7;
    return (
      <div className="screen">
        <div className="screen-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div><div className="label">Your data</div><h1>Progress</h1></div>
        <button onClick={() => setMoreOpen(true)} style={{ background: "var(--parchment-2)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-3)", flexShrink: 0, marginTop: 20 }}>
          <Icons.MoreDots />
        </button>
      </div>
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { num: ncDays, label: "Days no contact" },
              { num: triggers.length, label: "Urges logged" },
              { num: messages.length, label: "Messages written" },
              { num: voiceNotes.length, label: "Voice notes" },
            ].map(s => (
              <div key={s.label} className="stat-block">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>Milestones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MILESTONES.map(m => (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: ncDays >= m ? "var(--sage)" : "var(--parchment-3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {ncDays >= m && <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 12 4 10"/></svg>}
                  </div>
                  <span style={{ fontSize: 14, color: ncDays >= m ? "var(--ink)" : "var(--ink-4)", fontWeight: ncDays >= m ? 500 : 400 }}>
                    Day {m}
                  </span>
                  {ncDays >= m && <span className="pill sage" style={{ marginLeft: "auto", fontSize: 11 }}>Reached</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>Preview check-ins</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[30, 90, 180].map(m => (
                <button key={m} className="btn-secondary" style={{ fontSize: 13, padding: "10px 16px" }}
                  onClick={() => setCheckIn({ milestone: m, step: 0, answers: [] })}>
                  Day {m} check-in →
                </button>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8 }}>Common trigger tags</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[...new Set(triggers.map(t => t.tag))].map(tag => (
                <span key={tag} className="pill">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AccountScreen = () => (
    <div className="screen">
      <div className="screen-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div><div className="label">Settings</div><h1>Account</h1></div>
        <button onClick={() => setAppTab("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", marginTop: 24, display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          <Icons.X />
        </button>
      </div>
      <div style={{ padding: "24px 24px 0" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>Profile</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input" defaultValue="Abigaile" placeholder="Display name" />
            <input className="input" defaultValue="hello@example.com" placeholder="Email" type="email" />
          </div>
        </div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8 }}>Subscription</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>Active — 3 months</div>
              <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>$29.99 · Renews Jul 25, 2026</div>
            </div>
            <span className="pill sage">Active</span>
          </div>
          <button className="btn-ghost" style={{ marginTop: 12 }}>Manage billing →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-secondary" onClick={() => setScreen("landing")}>Sign out</button>
          <button className="btn-ghost" style={{ color: "#8B2A4A", textAlign: "center" }}>Delete account</button>
        </div>
      </div>
    </div>
  );

  // ── URGE FLOW ────────────────────────────────────────────────────────────────
  const UrgeFlow = () => {
    if (urgeStep === 1) return (
      <div className="screen urge-screen">
        <div>
          <button onClick={() => { setUrgeStep(0); setScreen("app"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)" }}><Icons.X /></button>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 24 }}>Step 1 of 3 — Ground yourself</div>
          <h2 className="display" style={{ fontSize: 26, marginBottom: 8, lineHeight: 1.2 }}>
            {breathePhase === "Breathe in" || breathePhase === "Hold" ? "Breathe with this." : "Let it out slowly."}
          </h2>
          <p style={{ color: "var(--ink-4)", fontSize: 14, marginBottom: 40 }}>
            {breatheSeconds > 0 ? `${breatheSeconds}s remaining` : "Whenever you're ready."}
          </p>
          <div className="breath-circle" style={{ animationPlayState: breatheSeconds <= 0 ? "paused" : "running" }}>
            <p className="display italic" style={{ fontSize: 15, color: "var(--terracotta)" }}>{breathePhase}</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-primary" onClick={() => setUrgeStep(2)}>
            {breatheSeconds <= 0 ? "Continue" : "Skip ahead"}
          </button>
        </div>
      </div>
    );

    if (urgeStep === 2) return (
      <div className="screen urge-screen">
        <div>
          <button onClick={() => setUrgeStep(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.ArrowLeft /><span style={{ fontSize: 14 }}>Back</span>
          </button>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 16 }}>Step 2 of 3 — Check in</div>
          <h2 className="display" style={{ fontSize: 26, marginBottom: 24, lineHeight: 1.2 }}>What triggered this?</h2>
          <textarea className="input" rows={3} placeholder="A song, a memory, a moment..." value={urgeText}
            onChange={e => setUrgeText(e.target.value)} style={{ marginBottom: 24 }} />
          <span className="form-label">How strong is the urge right now? {urgeIntensity}/10</span>
          <input type="range" className="slider" min={1} max={10} value={urgeIntensity}
            onChange={e => setUrgeIntensity(Number(e.target.value))} />
        </div>
        <button className="btn-primary" onClick={() => setUrgeStep(3)}>Continue</button>
      </div>
    );

    if (urgeStep === 3) return (
      <div className="screen urge-screen">
        <div>
          <button onClick={() => setUrgeStep(2)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.ArrowLeft /><span style={{ fontSize: 14 }}>Back</span>
          </button>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 16 }}>Step 3 of 3 — Release it</div>
          <h2 className="display" style={{ fontSize: 26, marginBottom: 8, lineHeight: 1.2 }}>You made it through.</h2>
          <p style={{ color: "var(--ink-3)", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            The urge is real. So is your ability to not act on it. What do you want to do now?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn-primary" onClick={() => {
              if (urgeText.trim()) setTriggers(t => [{ id: Date.now(), text: urgeText.trim(), intensity: urgeIntensity, tag: "memory", date: "Today", source: "urge_flow" }, ...t]);
              setUrgeStep(0); setScreen("app"); setAppTab("vault");
            }}>Write an unsent message</button>
            <button className="btn-secondary" onClick={() => {
              if (urgeText.trim()) setTriggers(t => [{ id: Date.now(), text: urgeText.trim(), intensity: urgeIntensity, tag: "memory", date: "Today", source: "urge_flow" }, ...t]);
              setUrgeStep(0); setScreen("app");
            }}>Log it and close</button>
            <button className="btn-ghost" style={{ textAlign: "center" }} onClick={() => { setUrgeStep(0); setScreen("app"); }}>
              Just close
            </button>
          </div>
        </div>
      </div>
    );
    return null;
  };

  // ── RENDER ───────────────────────────────────────────────────────────────────
  const NAV_TABS = [
    { id: "home", label: "Home", icon: <Icons.Home /> },
    { id: "nocontact", label: "Streak", icon: <Icons.Lock /> },
    { id: "vault", label: "Vault", icon: <Icons.Book /> },
    { id: "voice", label: "Voice", icon: <Icons.Mic /> },
    { id: "progress", label: "Progress", icon: <Icons.TrendingUp /> },
  ];

  return (
    <div className="app">
      <style>{styles}</style>
      {screen === "landing" && <LandingScreen />}
      {screen === "signup" && <AuthScreen mode="signup" setScreen={setScreen} setAppTab={setAppTab} />}
      {screen === "login" && <AuthScreen mode="login" setScreen={setScreen} setAppTab={setAppTab} />}
      {screen === "paywall" && <PaywallScreen />}
      {screen === "onboard" && <OnboardScreen />}
      {screen === "urge" && <UrgeFlow />}
      {screen === "app" && (
        <>
          {checkIn && <MilestoneCheckIn />}
          {!checkIn && appTab === "home"      && <HomeScreen />}
          {!checkIn && appTab === "nocontact" && <NoContactScreen />}
          {!checkIn && appTab === "vault"     && (
            <VaultScreen
              messages={messages}
              setMessages={setMessages}
              messagesLoading={messagesLoading}
              viewMsg={viewMsg}
              setViewMsg={setViewMsg}
              modal={modal}
              setModal={setModal}
            />
          )}
          {!checkIn && appTab === "triggers"  && <TriggersScreen />}
          {!checkIn && appTab === "voice"     && <VoiceScreen />}
          {!checkIn && appTab === "progress"  && <ProgressScreen />}
          {!checkIn && appTab === "account"   && <AccountScreen />}
          {moreOpen && <MoreMenu />}
          <nav className="nav">
            {NAV_TABS.map(t => (
              <button key={t.id} type="button" className={`nav-item ${appTab === t.id ? "active" : ""}`} onClick={() => setAppTab(t.id)}>
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
