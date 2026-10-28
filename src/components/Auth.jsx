import { useRef, useState } from 'react';
import { normalizeName } from '../lib/model.js';
import { btnGhost, btnPrimary, fieldCls, labelCls } from './ui.jsx';

/**
 * Prototype sign-in. There is no server: any email + password is accepted, the
 * password is never stored, and assessors can get in with one click (demo account
 * or guest) — the brief requires that no registration is needed to mark the work.
 * Follows WCAG 3.3.8 Accessible Authentication: paste allowed, password managers
 * supported via autocomplete, no puzzles or memory tests.
 */

export const DEMO_ACCOUNT = { name: 'Taygun', email: 'taygun@demo.vibeledger.app', role: 'Vibecoder · project lead' };

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const nameFromEmail = (email) => {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ');
  return normalizeName(local.replace(/\b\w/g, (c) => c.toUpperCase())) || 'New user';
};

export function makeSession(fields, existing) {
  const now = new Date().toISOString();
  return {
    name: fields.name,
    email: fields.email ?? '',
    role: fields.role ?? existing?.role ?? '',
    bio: existing?.bio ?? '',
    preferredTool: existing?.preferredTool ?? null,
    guest: Boolean(fields.guest),
    memberSince: existing?.email === fields.email && existing?.memberSince ? existing.memberSince : now,
    signedInAt: now,
  };
}

export function LoginScreen({ onSignIn, lastProfile }) {
  const [email, setEmail] = useState(lastProfile?.email ?? '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const emailRef = useRef(null);
  const passRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!isEmail(email.trim())) errs.email = 'Enter an email address like name@example.com.';
    if (!password) errs.password = 'Enter any password — this prototype does not check it.';
    setErrors(errs);
    if (errs.email) return emailRef.current?.focus();
    if (errs.password) return passRef.current?.focus();
    const em = email.trim().toLowerCase();
    const sameAsLast = lastProfile && lastProfile.email === em;
    onSignIn(makeSession({ name: sameAsLast ? lastProfile.name : nameFromEmail(em), email: em }, lastProfile));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4 py-10 text-ink-primary">
      <main className="w-full max-w-md">
        <h1 className="mb-1 font-display text-3xl font-semibold text-brand-primary">
          <span className="mr-1 text-brand-accent" aria-hidden="true">
            ▍
          </span>
          Vibe Ledger
        </h1>
        <p className="mb-6 text-sm text-ink-muted">Every task, every prompt, one board.</p>

        <section aria-labelledby="signin-title" className="rounded-xl border border-surface-line bg-surface-card p-5 shadow-xl sm:p-6">
          <h2 id="signin-title" className="font-display text-xl font-semibold">
            Sign in
          </h2>
          <p role="note" className="mt-2 rounded-lg border border-brand-accent/50 bg-brand-accent/10 px-3 py-2 text-xs text-ink-primary">
            <b>Prototype sign-in.</b> There is no server yet: any email and password work, the password is never saved, and your
            board stays in this browser.
          </p>

          <div className="mt-4 grid gap-2">
            <button type="button" onClick={() => onSignIn(makeSession(DEMO_ACCOUNT, lastProfile))} className={btnPrimary}>
              Continue with the demo account
            </button>
            <button type="button" onClick={() => onSignIn(makeSession({ name: 'Guest', guest: true }))} className={btnGhost}>
              Continue as guest
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-muted" aria-hidden="true">
            <span className="h-px flex-1 bg-surface-line" />
            or sign in with email
            <span className="h-px flex-1 bg-surface-line" />
          </div>

          <form onSubmit={submit} noValidate className="grid gap-4">
            <div>
              <label htmlFor="login-email" className={labelCls}>
                Email
              </label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-err' : undefined}
                className={`${fieldCls} ${errors.email ? '!border-due-overdue' : ''}`}
              />
              {errors.email && (
                <p id="login-email-err" role="alert" className="mt-1 text-xs text-due-overdue">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="login-password" className={labelCls}>
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passRef}
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-err' : undefined}
                  className={`${fieldCls} pr-20 ${errors.password ? '!border-due-overdue' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-pressed={show}
                  aria-controls="login-password"
                  className="absolute inset-y-0 right-1 my-1 rounded-md px-3 text-xs font-medium text-brand-accent hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  {show ? 'Hide' : 'Show'}
                  <span className="sr-only"> password</span>
                </button>
              </div>
              {errors.password && (
                <p id="login-password-err" role="alert" className="mt-1 text-xs text-due-overdue">
                  {errors.password}
                </p>
              )}
            </div>
            <button type="submit" className={btnGhost}>
              Sign in
            </button>
          </form>
        </section>

        <p className="mt-4 text-center text-xs text-ink-muted">Real accounts and a shared, synced board are planned future work.</p>
      </main>
    </div>
  );
}
