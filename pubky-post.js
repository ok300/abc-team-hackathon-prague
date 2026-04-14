import { Pubky, AuthFlowKind } from 'https://cdn.jsdelivr.net/npm/@synonymdev/pubky@0.6.0/+esm';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm';
import { PubkySpecsBuilder, PubkyAppPostKind } from 'https://cdn.jsdelivr.net/npm/pubky-app-specs@0.4.4/+esm';

const DEFAULT_BASE = 'https://nexus.pubky.app/v0';
const STAGING_BASE = 'https://nexus.staging.pubky.app/v0';
const POST_STYLE_ID = 'pubky-post-styles';
const LOGIN_STYLE_ID = 'pubky-login-styles';
const LOGIN_STORAGE_KEY = 'pubky-login-session';
const LOGIN_CAPABILITIES = '/pub/pubky.app/:rw';

const THEMES = ['auto', 'light', 'dark', 'midnight', 'sepia'];

const POST_CSS = `
  .pubky-post{
    --pp-bg:#ffffff;
    --pp-fg:#0f172a;
    --pp-muted:#64748b;
    --pp-border:rgba(15,23,42,.08);
    --pp-accent:#6366f1;
    --pp-accent-2:#8b5cf6;
    --pp-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.12);
    --pp-error-bg:#fef2f2;
    --pp-error-border:#fecaca;
    --pp-error-fg:#b91c1c;
    font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;
    max-width:100%;border:1px solid var(--pp-border);border-radius:16px;
    padding:18px 20px;background:var(--pp-bg);color:var(--pp-fg);
    box-sizing:border-box;line-height:1.55;box-shadow:var(--pp-shadow);
    transition:transform .15s ease,box-shadow .2s ease,border-color .2s ease;
  }
  .pubky-post:hover{
    transform:translateY(-1px);
    border-color:rgba(99,102,241,.25);
    box-shadow:0 1px 2px rgba(15,23,42,.04),0 14px 32px -14px rgba(99,102,241,.25);
  }
  .pubky-post *{box-sizing:border-box}
  .pubky-post__header{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
  .pubky-post__avatar{
    position:relative;
    width:44px;height:44px;border-radius:50%;
    background:linear-gradient(135deg,var(--pp-accent),var(--pp-accent-2));
    display:flex;align-items:center;justify-content:center;color:#fff;
    font-weight:600;font-size:15px;letter-spacing:.02em;
    overflow:hidden;flex-shrink:0;
    box-shadow:0 4px 10px -4px rgba(99,102,241,.45);
  }
  .pubky-post__avatar img{
    position:absolute;inset:0;
    width:100%;height:100%;object-fit:cover;
    background:inherit;
  }
  .pubky-post__meta{display:flex;flex-direction:column;min-width:0;flex:1}
  .pubky-post__name{
    font-weight:600;color:var(--pp-fg);font-size:15px;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  }
  .pubky-post__handle{
    font-size:12px;color:var(--pp-muted);
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;
    margin-top:1px;
  }
  .pubky-post__time{
    font-size:12px;color:var(--pp-muted);
    flex-shrink:0;padding-top:2px;
  }
  .pubky-post__time a{
    color:inherit;text-decoration:none;
  }
  .pubky-post__time a:hover{
    text-decoration:underline;
  }
  .pubky-post__content{
    white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere;
    font-size:15px;color:var(--pp-fg);
  }
  .pubky-post__error{
    color:var(--pp-error-fg);font-size:14px;
    background:var(--pp-error-bg);border:1px solid var(--pp-error-border);
    padding:10px 12px;border-radius:8px;
  }
  .pubky-post--loading{
    color:var(--pp-muted);font-size:14px;display:flex;align-items:center;gap:8px;
  }
  .pubky-post__replies{
    margin-top:16px;padding-top:12px;border-top:1px solid var(--pp-border);
    display:flex;flex-direction:column;gap:10px;
  }
  .pubky-post__replies-title{
    font-size:12px;font-weight:600;color:var(--pp-muted);
    text-transform:uppercase;letter-spacing:.05em;
  }
  .pubky-post__reply{
    display:flex;gap:10px;padding:10px 12px;border-radius:12px;
    background:rgba(99,102,241,.04);border:1px solid var(--pp-border);
  }
  .pubky-post__reply .pubky-post__avatar{width:32px;height:32px;font-size:12px}
  .pubky-post__reply-body{flex:1;min-width:0}
  .pubky-post__reply-head{
    display:flex;align-items:baseline;gap:8px;margin-bottom:2px;
  }
  .pubky-post__reply .pubky-post__name{font-size:14px}
  .pubky-post__reply .pubky-post__content{font-size:14px}
  .pubky-post__reply .pubky-post__replies{
    margin-top:10px;padding-top:8px;border-top:1px dashed var(--pp-border);
  }
  .pubky-post__reply .pubky-post__replies-title{font-size:11px}
  .pubky-post__replies-empty{font-size:13px;color:var(--pp-muted)}
  .pubky-post__login.pubky-login{
    margin:0 0 12px 0;width:100%;max-width:none;
    display:flex;flex-direction:column;align-items:center;text-align:center;
    border:0;box-shadow:none;background:transparent;
    padding:0;border-radius:0;font-family:inherit;color:inherit;
  }
  .pubky-post__login .pubky-login button{
    width:auto;padding:7px 14px;font-size:13px;border-radius:8px;
  }
  .pubky-post__login .pubky-login__user{
    display:flex;align-items:center;gap:10px;
    padding:8px 10px;border:1px solid var(--pp-border);
    border-radius:10px;background:rgba(99,102,241,.04);
  }
  .pubky-post__login .pubky-login__avatar{width:32px;height:32px;font-size:12px}
  .pubky-post__login .pubky-login__name{font-size:13px;color:var(--pp-fg)}
  .pubky-post__login .pubky-login__handle{font-size:11px;color:var(--pp-muted)}
  .pubky-post__login .pubky-login__logout{
    background:transparent;color:var(--pp-muted);border:0;
    font-size:12px;font-weight:500;padding:0;width:auto;
    border-radius:0;text-decoration:underline;cursor:pointer;
  }
  .pubky-post__login .pubky-login__logout:hover{color:var(--pp-fg)}
  .pubky-post__reply-actions{margin-top:8px}
  .pubky-post__reply-btn{
    background:none;border:1px solid var(--pp-border);border-radius:8px;
    color:var(--pp-muted);font-size:12px;font-weight:600;padding:4px 10px;
    cursor:pointer;transition:background .15s,color .15s,border-color .15s;
  }
  .pubky-post__reply-btn:hover{background:rgba(99,102,241,.08);color:var(--pp-accent);border-color:var(--pp-accent)}
  .pubky-post__reply-form{
    display:none;flex-direction:column;gap:8px;margin-top:8px;
    padding:10px;border:1px solid var(--pp-border);border-radius:10px;
    background:rgba(99,102,241,.04);
  }
  .pubky-post__reply-form[data-open="1"]{display:flex}
  .pubky-post__reply-form textarea{
    width:100%;min-height:64px;resize:vertical;font:inherit;font-size:14px;
    color:var(--pp-fg);background:var(--pp-bg);
    border:1px solid var(--pp-border);border-radius:8px;padding:8px 10px;
    box-sizing:border-box;outline:none;
  }
  .pubky-post__reply-form textarea:focus{border-color:var(--pp-accent)}
  .pubky-post__reply-form-row{display:flex;gap:8px;justify-content:flex-end;align-items:center}
  .pubky-post__reply-form-err{color:var(--pp-error-fg);font-size:12px;margin-right:auto}
  .pubky-post__reply-form button{
    border-radius:8px;font-size:13px;font-weight:600;padding:6px 12px;cursor:pointer;border:0;
  }
  .pubky-post__reply-form .pubky-post__reply-submit{background:var(--pp-accent);color:#fff}
  .pubky-post__reply-form .pubky-post__reply-submit:disabled{opacity:.6;cursor:wait}
  .pubky-post__reply-form .pubky-post__reply-cancel{
    background:transparent;color:var(--pp-muted);border:1px solid var(--pp-border);
  }
  .pubky-post--loading::before{
    content:"";width:12px;height:12px;border-radius:50%;
    border:2px solid var(--pp-border);border-top-color:var(--pp-accent);
    animation:pubky-post-spin .7s linear infinite;
  }
  @keyframes pubky-post-spin{to{transform:rotate(360deg)}}

  .pubky-post[data-pp-theme="dark"]{
    --pp-bg:#0f172a;
    --pp-fg:#f1f5f9;
    --pp-muted:#94a3b8;
    --pp-border:rgba(148,163,184,.18);
    --pp-shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -12px rgba(0,0,0,.6);
    --pp-error-bg:rgba(185,28,28,.15);
    --pp-error-border:rgba(185,28,28,.4);
    --pp-error-fg:#fca5a5;
  }
  .pubky-post[data-pp-theme="midnight"]{
    --pp-bg:#0a0a1a;
    --pp-fg:#e0e7ff;
    --pp-muted:#8b8bb3;
    --pp-border:rgba(139,139,179,.18);
    --pp-accent:#a78bfa;
    --pp-accent-2:#f472b6;
    --pp-shadow:0 1px 2px rgba(0,0,0,.5),0 8px 24px -12px rgba(167,139,250,.35);
    --pp-error-bg:rgba(185,28,28,.18);
    --pp-error-border:rgba(185,28,28,.45);
    --pp-error-fg:#fca5a5;
  }
  .pubky-post[data-pp-theme="sepia"]{
    --pp-bg:#f4ecd8;
    --pp-fg:#433422;
    --pp-muted:#8a7355;
    --pp-border:rgba(67,52,34,.15);
    --pp-accent:#a0522d;
    --pp-accent-2:#c2763a;
    --pp-shadow:0 1px 2px rgba(67,52,34,.06),0 8px 24px -12px rgba(67,52,34,.2);
    --pp-error-bg:#fdecea;
    --pp-error-border:#e8b4ad;
    --pp-error-fg:#8a2a1f;
  }

  @media (prefers-color-scheme:dark){
    .pubky-post:not([data-pp-theme]),
    .pubky-post[data-pp-theme="auto"]{
      --pp-bg:#0f172a;
      --pp-fg:#f1f5f9;
      --pp-muted:#94a3b8;
      --pp-border:rgba(148,163,184,.18);
      --pp-shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -12px rgba(0,0,0,.6);
      --pp-error-bg:rgba(185,28,28,.15);
      --pp-error-border:rgba(185,28,28,.4);
      --pp-error-fg:#fca5a5;
    }
  }
`;

const LOGIN_CSS = `
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

function injectStyles(doc, id, css) {
  if (doc.getElementById(id)) return;
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = css;
  doc.head.appendChild(style);
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function shortId(id) {
  if (!id || id.length < 14) return id || '';
  return id.slice(0, 6) + '…' + id.slice(-4);
}

function formatTime(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function pubkyPostUrl(postId, authorId, useStaging) {
  const host = useStaging ? 'staging.pubky.app' : 'pubky.app';
  return `https://${host}/post/${encodeURIComponent(authorId)}/${encodeURIComponent(postId)}`;
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  return res.json();
}

function avatarUrl(base, user) {
  const { id, image: img } = user?.details || {};
  if (!id || !img) return null;
  if (/^https?:\/\//i.test(img)) return img;
  return `${String(base).replace(/\/v0\/?$/, '')}/static/avatar/${encodeURIComponent(id)}`;
}

function renderAvatar(user, base) {
  const url = avatarUrl(base || DEFAULT_BASE, user);
  const fallback = escapeHtml(initials(user?.details?.name));
  return url ? `<img src="${escapeHtml(url)}" alt="" onerror="this.remove()">${fallback}` : fallback;
}

const AUTH_EVENT = 'pubky:auth';
const authState = { z32: null, session: null };

function setAuth(next) {
  authState.z32 = next?.z32 ?? null;
  authState.session = next?.session ?? null;
  try { window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { z32: authState.z32 } })); } catch {}
}

function timeHtml(d, useStaging) {
  const s = escapeHtml(formatTime(d.indexed_at));
  return d.id && d.author ? `<a href="${escapeHtml(pubkyPostUrl(d.id, d.author, useStaging))}" target="_blank" rel="noopener noreferrer">${s}</a>` : s;
}

function replyActionsHtml(author, postId) {
  return `
    <div class="pubky-post__reply-actions" data-pubky-reply-actions
         data-pubky-parent-author="${escapeHtml(author || '')}"
         data-pubky-parent-post="${escapeHtml(postId || '')}"
         hidden>
      <button type="button" class="pubky-post__reply-btn" data-pubky-reply-toggle>Reply</button>
      <form class="pubky-post__reply-form" data-pubky-reply-form>
        <textarea data-pubky-reply-text placeholder="Write a reply…" maxlength="1000"></textarea>
        <div class="pubky-post__reply-form-row">
          <div class="pubky-post__reply-form-err" data-pubky-reply-err></div>
          <button type="button" class="pubky-post__reply-cancel" data-pubky-reply-cancel>Cancel</button>
          <button type="submit" class="pubky-post__reply-submit">Reply</button>
        </div>
      </form>
    </div>
  `;
}

function renderHtml(post, user, base, useStaging) {
  const d = post.details || {};
  const name = user?.details?.name || 'Unknown';
  return `
    <div class="pubky-post__login" data-pubky-post-login></div>
    <div class="pubky-post__header">
      <div class="pubky-post__avatar">${renderAvatar(user, base)}</div>
      <div class="pubky-post__meta">
        <div class="pubky-post__name">${escapeHtml(name)}</div>
        <div class="pubky-post__handle" title="${escapeHtml(d.author || '')}">${escapeHtml(shortId(d.author))}</div>
      </div>
      <div class="pubky-post__time">${timeHtml(d, useStaging)}</div>
    </div>
    <div class="pubky-post__content">${escapeHtml(d.content)}</div>
    ${replyActionsHtml(d.author, d.id)}
    <div class="pubky-post__replies" data-pubky-replies>
      <div class="pubky-post--loading">Loading replies…</div>
    </div>
  `;
}

const MAX_REPLY_DEPTH = 6;

function renderReplyHtml(reply, user, hasChildren, base, useStaging) {
  const d = reply.details || {};
  const name = user?.details?.name || 'Unknown';
  const nested = hasChildren
    ? `<div class="pubky-post__replies" data-pubky-replies data-pubky-reply-author="${escapeHtml(d.author || '')}" data-pubky-reply-id="${escapeHtml(d.id || '')}"><div class="pubky-post--loading">Loading replies…</div></div>`
    : '';
  return `
    <div class="pubky-post__reply">
      <div class="pubky-post__avatar">${renderAvatar(user, base)}</div>
      <div class="pubky-post__reply-body">
        <div class="pubky-post__reply-head">
          <div class="pubky-post__name">${escapeHtml(name)}</div>
          <div class="pubky-post__handle" title="${escapeHtml(d.author || '')}">${escapeHtml(shortId(d.author))}</div>
          <div class="pubky-post__time" style="margin-left:auto">${timeHtml(d, useStaging)}</div>
        </div>
        <div class="pubky-post__content">${escapeHtml(d.content)}</div>
        ${replyActionsHtml(d.author, d.id)}
        ${nested}
      </div>
    </div>
  `;
}

async function pollForReply(container, base, parentAuthor, parentPostId, expectedId, useStaging) {
  const delays = [1000, 1500, 2500, 4000, 6000];
  for (let i = 0; i < delays.length; i++) {
    await new Promise(r => setTimeout(r, delays[i]));
    try {
      const url = `${base}/stream/posts?source=post_replies`
        + `&author_id=${encodeURIComponent(parentAuthor)}`
        + `&post_id=${encodeURIComponent(parentPostId)}`
        + `&sorting=timeline&limit=100`;
      const replies = await fetchJson(url);
      if (Array.isArray(replies) && replies.some(r => r?.details?.id === expectedId)) {
        return renderReplies(container, base, parentAuthor, parentPostId, 0, useStaging);
      }
    } catch {}
  }
  return renderReplies(container, base, parentAuthor, parentPostId, 0, useStaging);
}

function findRepliesContainerFor(actionsEl) {
  return actionsEl.parentElement?.querySelector(':scope > [data-pubky-replies]') ?? null;
}

function updateReplyActions(root) {
  const me = authState.z32;
  root.querySelectorAll('[data-pubky-reply-actions]').forEach(el => {
    const show = !!(me && el.dataset.pubkyParentAuthor && el.dataset.pubkyParentAuthor !== me);
    el.hidden = !show;
    if (!show) { const f = el.querySelector('[data-pubky-reply-form]'); if (f) f.dataset.open = ''; }
  });
}

function bindReplyActions(root, base, useStaging) {
  root.querySelectorAll('[data-pubky-reply-actions]').forEach(el => {
    if (el.dataset.pubkyBound) return;
    el.dataset.pubkyBound = '1';
    const toggle = el.querySelector('[data-pubky-reply-toggle]');
    const form = el.querySelector('[data-pubky-reply-form]');
    const cancel = el.querySelector('[data-pubky-reply-cancel]');
    const textarea = el.querySelector('[data-pubky-reply-text]');
    const errEl = el.querySelector('[data-pubky-reply-err]');
    toggle.addEventListener('click', () => {
      form.dataset.open = form.dataset.open === '1' ? '' : '1';
      if (form.dataset.open === '1') setTimeout(() => textarea.focus(), 0);
    });
    cancel.addEventListener('click', () => {
      form.dataset.open = '';
      textarea.value = '';
      errEl.textContent = '';
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = textarea.value.trim();
      if (!content) return;
      if (!authState.session) {
        errEl.textContent = 'Not signed in.';
        return;
      }
      const submitBtn = form.querySelector('.pubky-post__reply-submit');
      submitBtn.disabled = true;
      errEl.textContent = '';
      const parentAuthor = el.dataset.pubkyParentAuthor;
      const parentPostId = el.dataset.pubkyParentPost;
      try {
        const parentUri = `pubky://${parentAuthor}/pub/pubky.app/posts/${parentPostId}`;
        const builder = new PubkySpecsBuilder(authState.z32);
        const { post, meta } = builder.createPost(content, PubkyAppPostKind.Short, parentUri, null, null);
        const id = meta.id;
        await authState.session.storage.putJson(`/pub/pubky.app/posts/${id}`, post.toJson());
        form.dataset.open = '';
        textarea.value = '';
        let container = findRepliesContainerFor(el);
        if (!container && el.parentElement) {
          container = document.createElement('div');
          container.className = 'pubky-post__replies';
          container.setAttribute('data-pubky-replies', '');
          el.parentElement.appendChild(container);
        }
        if (container) {
          const me = await fetchJson(`${base}/user/${encodeURIComponent(authState.z32)}`).catch(() => null);
          const optimistic = {
            details: { id, author: authState.z32, content, indexed_at: Date.now() },
            counts: { replies: 0 },
          };
          container.innerHTML = `
            <div class="pubky-post__replies-title">Your reply (waiting for Nexus to index…)</div>
            ${renderReplyHtml(optimistic, me, false, base, useStaging)}
          `;
          bindReplyActions(container, base, useStaging);
          updateReplyActions(container);
          pollForReply(container, base, parentAuthor, parentPostId, id, useStaging);
        }
      } catch (err) {
        errEl.textContent = 'Failed: ' + (err && err.message ? err.message : String(err));
      } finally {
        submitBtn.disabled = false;
      }
    });
  });
}

async function renderReplies(container, base, author, post, depth, useStaging) {
  depth = depth || 0;
  if (depth === 0) {
    container.innerHTML = '<div class="pubky-post--loading">Loading replies…</div>';
  }

  try {
    const url = `${base}/stream/posts?source=post_replies`
      + `&author_id=${encodeURIComponent(author)}`
      + `&post_id=${encodeURIComponent(post)}`
      + `&sorting=timeline&limit=100`;
    const replies = await fetchJson(url);
    if (!Array.isArray(replies) || replies.length === 0) {
      container.innerHTML = depth === 0
        ? '<div class="pubky-post__replies-empty">No replies yet.</div>'
        : '';
      return;
    }
    const users = await Promise.all(replies.map(r => {
      const a = r?.details?.author;
      return a ? fetchJson(`${base}/user/${encodeURIComponent(a)}`).catch(() => null) : null;
    }));
    const canRecurse = depth + 1 < MAX_REPLY_DEPTH;
    const items = replies.map((r, i) => {
      const hasChildren = canRecurse && r?.counts?.replies > 0;
      return renderReplyHtml(r, users[i], hasChildren, base, useStaging);
    }).join('');
    container.innerHTML = `
      <div class="pubky-post__replies-title">${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}</div>
      ${items}
    `;
    bindReplyActions(container, base, useStaging);
    updateReplyActions(container);
    if (canRecurse) {
      container.querySelectorAll(':scope > .pubky-post__reply [data-pubky-replies]').forEach(c => {
        const a = c.dataset.pubkyReplyAuthor;
        const p = c.dataset.pubkyReplyId;
        if (a && p) renderReplies(c, base, a, p, depth + 1, useStaging);
      });
    }
  } catch (err) {
    container.innerHTML = `<div class="pubky-post__error">Failed to load replies: ${escapeHtml(err.message)}</div>`;
  }
}

async function render(el, opts) {
  if (typeof el === 'string') el = document.querySelector(el);
  if (!el) throw new Error('PubkyPost.render: target element not found');
  const { author, post, useStaging, baseUrl, theme } = opts || {};
  const base = baseUrl || (useStaging ? STAGING_BASE : DEFAULT_BASE);
  if (!author || !post) throw new Error('PubkyPost.render: author and post are required');

  injectStyles(el.ownerDocument || document, POST_STYLE_ID, POST_CSS);
  el.classList.add('pubky-post');
  if (theme && THEMES.indexOf(theme) !== -1) el.setAttribute('data-pp-theme', theme);
  el.innerHTML = '<div class="pubky-post--loading">Loading post…</div>';

  try {
    const [postData, userData] = await Promise.all([
      fetchJson(`${base}/post/${encodeURIComponent(author)}/${encodeURIComponent(post)}`),
      fetchJson(`${base}/user/${encodeURIComponent(author)}`).catch(() => null),
    ]);
    el.innerHTML = renderHtml(postData, userData, base, useStaging);
    const loginEl = el.querySelector('[data-pubky-post-login]');
    if (loginEl) startLogin(loginEl, { base });
    bindReplyActions(el, base, useStaging);
    updateReplyActions(el);
    if (!el.dataset.pubkyAuthBound) {
      el.dataset.pubkyAuthBound = '1';
      window.addEventListener(AUTH_EVENT, () => updateReplyActions(el));
    }
    const repliesEl = el.querySelector('[data-pubky-replies]');
    if (repliesEl) renderReplies(repliesEl, base, author, post, 0, useStaging);
    return postData;
  } catch (err) {
    el.innerHTML = `<div class="pubky-post__error">Failed to load post: ${escapeHtml(err.message)}</div>`;
    throw err;
  }
}

const fetchUserDetails = (base, z32) => fetchJson(`${base}/user/${encodeURIComponent(z32)}`).catch(() => null);

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
    localStorage.removeItem(LOGIN_STORAGE_KEY);
    setAuth(null);
    location.reload();
  });
}

export async function startLogin(el, opts) {
  injectStyles(el.ownerDocument || document, LOGIN_STYLE_ID, LOGIN_CSS);
  el.classList.add('pubky-login');

  const useStaging = opts?.useStaging ?? (el.dataset.pubkyUseStaging === 'true');
  const base = opts?.base || el.dataset.pubkyBase || (useStaging ? STAGING_BASE : DEFAULT_BASE);
  const pubky = new Pubky();

  const showSignedIn = async (z32) => {
    renderSignedIn(el, base, z32, null);
    const user = await fetchUserDetails(base, z32);
    if (user) renderSignedIn(el, base, z32, user);
  };

  const saved = localStorage.getItem(LOGIN_STORAGE_KEY);
  if (saved) {
    try {
      const session = await pubky.restoreSession(saved);
      const z32 = session.info.publicKey.z32();
      setAuth({ z32, session });
      await showSignedIn(z32);
      return;
    } catch {
      localStorage.removeItem(LOGIN_STORAGE_KEY);
    }
  }

  el.innerHTML = `<button type="button">Sign in with Pubky Ring</button>`;
  const btn = el.querySelector('button');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Starting…';

    const flow = pubky.startAuthFlow(LOGIN_CAPABILITIES, AuthFlowKind.signin());
    const url = flow.authorizationUrl;

    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
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
      localStorage.setItem(LOGIN_STORAGE_KEY, session.export());
      const z32 = session.info.publicKey.z32();
      setAuth({ z32, session });
      await showSignedIn(z32);
    } catch (err) {
      el.innerHTML = `<div class="pubky-login__err">${err.message}</div>`;
    }
  });
}

function autoRender(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-pubky-author][data-pubky-post]').forEach(n => {
    if (n.dataset.pubkyRendered) return;
    n.dataset.pubkyRendered = '1';
    render(n, {
      author: n.dataset.pubkyAuthor,
      post: n.dataset.pubkyPost,
      baseUrl: n.dataset.pubkyBase,
      theme: n.dataset.pubkyTheme,
      useStaging: n.dataset.pubkyUseStaging === 'true',
    }).catch(() => {});
  });
}

const PubkyPost = { render, autoRender, startLogin, _baseUrl: DEFAULT_BASE };

if (typeof window !== 'undefined') window.PubkyPost = PubkyPost;

if (typeof document !== 'undefined') {
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => autoRender())
    : autoRender();
}

export { render, autoRender };
export default PubkyPost;
