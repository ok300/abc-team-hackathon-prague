import { Pubky, AuthFlowKind } from 'https://cdn.jsdelivr.net/npm/@synonymdev/pubky@0.6.0/+esm';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm';

const CAPABILITIES = '/pub/pubky.app/:rw';
const STORAGE_KEY = 'pubky-login-session';
const DEFAULT_NEXUS = 'https://nexus.pubky.app/v0';
const STAGING_NEXUS = 'https://nexus.staging.pubky.app/v0';

const STYLE_ID = 'pubky-login-styles';
const CSS = `
  .pubky-login{font-family:-apple-system,sans-serif;max-width:360px;
    border:1px solid rgba(15,23,42,.08);border-radius:16px;padding:20px;
    background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.12)}
  .pubky-login button{background:#6366f1;color:#fff;border:0;border-radius:10px;
    padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer;width:100%}
  .pubky-login button:disabled{opacity:.6;cursor:wait}
  .pubky-login canvas{display:block;margin:12px auto;border-radius:8px}
  .pubky-login a{display:block;text-align:center;margin-top:8px;color:#6366f1;
    font-size:13px;text-decoration:none;word-break:break-all}
  .pubky-login__status{font-size:13px;color:#64748b;margin-top:8px;text-align:center}
  .pubky-login__user{display:flex;align-items:center;gap:12px}
  .pubky-login__avatar{width:44px;height:44px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,#6366f1,#8b5cf6);object-fit:cover;
    display:flex;align-items:center;justify-content:center;color:#fff;
    font-weight:600;font-size:15px;overflow:hidden}
  .pubky-login__avatar img{width:100%;height:100%;object-fit:cover}
  .pubky-login__name{font-weight:600;font-size:15px;color:#0f172a;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .pubky-login__handle{font-size:12px;color:#64748b;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}
  .pubky-login__meta{min-width:0;flex:1}
  .pubky-login__logout{margin-left:auto;background:none;border:0;
    color:#64748b;font-size:12px;cursor:pointer;text-decoration:underline;
    flex-shrink:0}
  .pubky-login__err{color:#b91c1c;font-size:13px;text-align:center}
`;

function injectStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const s = doc.createElement('style');
  s.id = STYLE_ID;
  s.textContent = CSS;
  doc.head.appendChild(s);
}

const isMobile = () => /Android|iPhone|iPad/i.test(navigator.userAgent);

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const shortId = (id) => id && id.length >= 14 ? id.slice(0, 6) + '…' + id.slice(-4) : (id || '');

const initials = (name) => name
  ? name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()
  : '?';

async function fetchUserDetails(base, z32) {
  try {
    const res = await fetch(`${base}/user/${encodeURIComponent(z32)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function renderSignedIn(el, base, z32, user) {
  const name = user?.details?.name || shortId(z32);
  const origin = String(base).replace(/\/v0\/?$/, '');
  const avatarSrc = `${origin}/static/avatar/${encodeURIComponent(z32)}`;
  const fallback = escapeHtml(initials(user?.details?.name));

  el.innerHTML = `
    <div class="pubky-login__user">
      <div class="pubky-login__avatar">
        <img src="${escapeHtml(avatarSrc)}" alt="" onerror="this.remove()">${fallback}
      </div>
      <div class="pubky-login__meta">
        <div class="pubky-login__name">${escapeHtml(name)}</div>
        <div class="pubky-login__handle" title="${escapeHtml(z32)}">${escapeHtml(shortId(z32))}</div>
      </div>
      <button class="pubky-login__logout" type="button">Sign out</button>
    </div>
  `;

  el.querySelector('.pubky-login__logout').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
}

export async function startLogin(el) {
  injectStyles(el.ownerDocument || document);
  el.classList.add('pubky-login');

  const useStaging = el.dataset.pubkyUseStaging === 'true';
  const base = el.dataset.pubkyBase || (useStaging ? STAGING_NEXUS : DEFAULT_NEXUS);
  const pubky = new Pubky();

  const showSignedIn = async (z32) => {
    renderSignedIn(el, base, z32, null);
    const user = await fetchUserDetails(base, z32);
    if (user) renderSignedIn(el, base, z32, user);
  };

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const session = await pubky.restoreSession(saved);
      await showSignedIn(session.info.publicKey.z32());
      return;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  el.innerHTML = `<button type="button">Sign in with Pubky Ring</button>`;
  const btn = el.querySelector('button');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Starting…';

    const flow = pubky.startAuthFlow(CAPABILITIES, AuthFlowKind.signin());
    const url = flow.authorizationUrl;

    if (isMobile()) {
      el.innerHTML = `
        <a href="${url}">Open Pubky Ring →</a>
        <div class="pubky-login__status">Waiting for approval…</div>`;
    } else {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, url, { width: 240, margin: 1 });
      el.innerHTML = '';
      el.appendChild(canvas);
      const status = document.createElement('div');
      status.className = 'pubky-login__status';
      status.textContent = 'Scan with Pubky Ring…';
      el.appendChild(status);
    }

    try {
      const session = await flow.awaitApproval();
      localStorage.setItem(STORAGE_KEY, session.export());
      await showSignedIn(session.info.publicKey.z32());
    } catch (err) {
      el.innerHTML = `<div class="pubky-login__err">${err.message}</div>`;
    }
  });
}

function autoRender() {
  document.querySelectorAll('[data-pubky-login]').forEach(el => {
    if (el.dataset.pubkyLoginRendered) return;
    el.dataset.pubkyLoginRendered = '1';
    startLogin(el);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoRender);
} else {
  autoRender();
}
