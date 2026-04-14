(function (global) {
  'use strict';

  const DEFAULT_BASE = 'https://nexus.pubky.app/v0';
  const STYLE_ID = 'pubky-post-styles';

  const CSS = `
    .pubky-post{
      --pp-bg:#ffffff;
      --pp-fg:#0f172a;
      --pp-muted:#64748b;
      --pp-border:rgba(15,23,42,.08);
      --pp-accent:#6366f1;
      --pp-accent-2:#8b5cf6;
      --pp-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.12);
      font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;
      max-width:560px;border:1px solid var(--pp-border);border-radius:16px;
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
      width:44px;height:44px;border-radius:50%;
      background:linear-gradient(135deg,var(--pp-accent),var(--pp-accent-2));
      display:flex;align-items:center;justify-content:center;color:#fff;
      font-weight:600;font-size:15px;letter-spacing:.02em;
      overflow:hidden;flex-shrink:0;
      box-shadow:0 4px 10px -4px rgba(99,102,241,.45);
    }
    .pubky-post__avatar img{width:100%;height:100%;object-fit:cover}
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
    .pubky-post__content{
      white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere;
      font-size:15px;color:var(--pp-fg);
    }
    .pubky-post__error{
      color:#b91c1c;font-size:14px;
      background:#fef2f2;border:1px solid #fecaca;
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
    .pubky-post--loading::before{
      content:"";width:12px;height:12px;border-radius:50%;
      border:2px solid var(--pp-border);border-top-color:var(--pp-accent);
      animation:pubky-post-spin .7s linear infinite;
    }
    @keyframes pubky-post-spin{to{transform:rotate(360deg)}}
    @media (prefers-color-scheme:dark){
      .pubky-post{
        --pp-bg:#0f172a;
        --pp-fg:#f1f5f9;
        --pp-muted:#94a3b8;
        --pp-border:rgba(148,163,184,.18);
        --pp-shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -12px rgba(0,0,0,.6);
      }
      .pubky-post__error{background:rgba(185,28,28,.15);border-color:rgba(185,28,28,.4);color:#fca5a5}
    }
  `;

  function injectStyles(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
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
    const diff = Date.now() - ms;
    const s = Math.floor(diff / 1000);
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h';
    const d = Math.floor(h / 24);
    if (d < 30) return d + 'd';
    return new Date(ms).toLocaleDateString();
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

  function renderAvatar(user) {
    const img = user && user.details && user.details.image;
    if (img && /^https?:\/\//i.test(img)) {
      return `<img src="${escapeHtml(img)}" alt="">`;
    }
    return escapeHtml(initials(user && user.details && user.details.name));
  }

  function renderHtml(post, user) {
    const d = post.details || {};
    const name = (user && user.details && user.details.name) || 'Unknown';
    return `
      <div class="pubky-post__header">
        <div class="pubky-post__avatar">${renderAvatar(user)}</div>
        <div class="pubky-post__meta">
          <div class="pubky-post__name">${escapeHtml(name)}</div>
          <div class="pubky-post__handle" title="${escapeHtml(d.author || '')}">${escapeHtml(shortId(d.author))}</div>
        </div>
        <div class="pubky-post__time">${escapeHtml(formatTime(d.indexed_at))}</div>
      </div>
      <div class="pubky-post__content">${escapeHtml(d.content)}</div>
      <div class="pubky-post__replies" data-pubky-replies>
        <div class="pubky-post--loading">Loading replies…</div>
      </div>
    `;
  }

  const MAX_REPLY_DEPTH = 6;

  function renderReplyHtml(reply, user, hasChildren) {
    const d = reply.details || {};
    const name = (user && user.details && user.details.name) || 'Unknown';
    const nested = hasChildren
      ? `<div class="pubky-post__replies" data-pubky-replies data-pubky-reply-author="${escapeHtml(d.author || '')}" data-pubky-reply-id="${escapeHtml(d.id || '')}"><div class="pubky-post--loading">Loading replies…</div></div>`
      : '';
    return `
      <div class="pubky-post__reply">
        <div class="pubky-post__avatar">${renderAvatar(user)}</div>
        <div class="pubky-post__reply-body">
          <div class="pubky-post__reply-head">
            <div class="pubky-post__name">${escapeHtml(name)}</div>
            <div class="pubky-post__handle" title="${escapeHtml(d.author || '')}">${escapeHtml(shortId(d.author))}</div>
            <div class="pubky-post__time" style="margin-left:auto">${escapeHtml(formatTime(d.indexed_at))}</div>
          </div>
          <div class="pubky-post__content">${escapeHtml(d.content)}</div>
          ${nested}
        </div>
      </div>
    `;
  }

  async function renderReplies(container, base, author, post, depth) {
    depth = depth || 0;
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
        const a = r && r.details && r.details.author;
        return a ? fetchJson(`${base}/user/${encodeURIComponent(a)}`).catch(() => null) : null;
      }));
      const canRecurse = depth + 1 < MAX_REPLY_DEPTH;
      const items = replies.map((r, i) => {
        const hasChildren = canRecurse && r && r.counts && r.counts.replies > 0;
        return renderReplyHtml(r, users[i], hasChildren);
      }).join('');
      container.innerHTML = `
        <div class="pubky-post__replies-title">${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}</div>
        ${items}
      `;
      if (canRecurse) {
        container.querySelectorAll(':scope > .pubky-post__reply [data-pubky-replies]').forEach(c => {
          const a = c.dataset.pubkyReplyAuthor;
          const p = c.dataset.pubkyReplyId;
          if (a && p) renderReplies(c, base, a, p, depth + 1);
        });
      }
    } catch (err) {
      container.innerHTML = `<div class="pubky-post__error">Failed to load replies: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function render(el, opts) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) throw new Error('PubkyPost.render: target element not found');
    const author = opts && opts.author;
    const post = opts && opts.post;
    const base = (opts && opts.baseUrl) || DEFAULT_BASE;
    if (!author || !post) throw new Error('PubkyPost.render: author and post are required');

    injectStyles(el.ownerDocument || document);
    el.classList.add('pubky-post');
    el.innerHTML = '<div class="pubky-post--loading">Loading post…</div>';

    try {
      const [postData, userData] = await Promise.all([
        fetchJson(`${base}/post/${encodeURIComponent(author)}/${encodeURIComponent(post)}`),
        fetchJson(`${base}/user/${encodeURIComponent(author)}`).catch(() => null),
      ]);
      el.innerHTML = renderHtml(postData, userData);
      const repliesEl = el.querySelector('[data-pubky-replies]');
      if (repliesEl) renderReplies(repliesEl, base, author, post);
      return postData;
    } catch (err) {
      el.innerHTML = `<div class="pubky-post__error">Failed to load post: ${escapeHtml(err.message)}</div>`;
      throw err;
    }
  }

  function autoRender(root) {
    const scope = root || document;
    const nodes = scope.querySelectorAll('[data-pubky-author][data-pubky-post]');
    nodes.forEach(n => {
      if (n.dataset.pubkyRendered) return;
      n.dataset.pubkyRendered = '1';
      render(n, {
        author: n.dataset.pubkyAuthor,
        post: n.dataset.pubkyPost,
        baseUrl: n.dataset.pubkyBase,
      }).catch(() => {});
    });
  }

  const PubkyPost = { render, autoRender, _baseUrl: DEFAULT_BASE };
  global.PubkyPost = PubkyPost;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => autoRender());
    } else {
      autoRender();
    }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = PubkyPost;
})(typeof window !== 'undefined' ? window : globalThis);
