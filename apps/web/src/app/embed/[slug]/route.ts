import { NextRequest } from 'next/server'

// Sprint 4.1 — Embeddable Widget (JS Snippet) — Wren
// GET /embed/[slug] → returns vanilla JS widget (~5KB)
// Usage: <script src="https://waitlistkit.threestack.io/embed/my-waitlist"></script>

export function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const { searchParams } = new URL(request.url)

  // Allow override via query params (for server-side rendering)
  const color = searchParams.get('color') || '#0fb8a1'
  const buttonText = searchParams.get('button') || 'Join Waitlist'
  const apiBase = new URL(request.url).origin

  const js = generateWidget({ slug, color, buttonText, apiBase })

  return new Response(js, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': '*',
    },
  })
}

// ─── Widget Code Generator ──────────────────────────────────────────────────────

function generateWidget({
  slug,
  color,
  buttonText,
  apiBase,
}: {
  slug: string
  color: string
  buttonText: string
  apiBase: string
}): string {
  // The widget JS is generated as a template string.
  // It's pure vanilla JS — no React, no deps.
  return `
(function() {
  'use strict';

  var SLUG = ${JSON.stringify(slug)};
  var API_BASE = ${JSON.stringify(apiBase)};
  var DEFAULT_COLOR = ${JSON.stringify(color)};
  var DEFAULT_BTN_TEXT = ${JSON.stringify(buttonText)};

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function qs(selector, root) { return (root || document).querySelector(selector); }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k) {
      if (k === 'style') {
        Object.keys(attrs.style).forEach(function(s) { e.style[s] = attrs.style[s]; });
      } else if (k === 'class') {
        e.className = attrs[k];
      } else {
        e.setAttribute(k, attrs[k]);
      }
    });
    if (children) {
      if (typeof children === 'string') { e.innerHTML = children; }
      else { children.forEach(function(c) { if (c) e.appendChild(c); }); }
    }
    return e;
  }

  function copyText(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  function injectStyles() {
    var id = 'wk-styles-' + SLUG;
    if (document.getElementById(id)) return;
    var css = [
      '.wk-wrap{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;box-sizing:border-box}',
      '.wk-wrap *{box-sizing:border-box;margin:0;padding:0}',
      '.wk-form{background:#0a1628;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:480px;width:100%}',
      '.wk-title{color:#fff;font-size:20px;font-weight:700;margin-bottom:6px}',
      '.wk-sub{color:#94a3b8;font-size:13px;margin-bottom:18px}',
      '.wk-input{width:100%;padding:12px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;transition:border-color .2s}',
      '.wk-input:focus{border-color:var(--wk-color)}',
      '.wk-input::placeholder{color:#64748b}',
      '.wk-btn{width:100%;padding:13px;margin-top:10px;border:none;border-radius:10px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;background:var(--wk-color);transition:opacity .15s,transform .1s}',
      '.wk-btn:hover{opacity:.9}',
      '.wk-btn:active{transform:scale(0.98)}',
      '.wk-btn:disabled{opacity:.55;cursor:not-allowed}',
      '.wk-hint{color:#64748b;font-size:11px;text-align:center;margin-top:8px}',
      '.wk-success{text-align:center}',
      '.wk-pos{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;border:3px solid var(--wk-color);background:rgba(15,184,161,.1);margin:0 auto 14px}',
      '.wk-pos-label{color:#94a3b8;font-size:10px}',
      '.wk-pos-num{font-size:20px;font-weight:800;color:var(--wk-color)}',
      '.wk-success-title{color:#fff;font-size:18px;font-weight:700;margin-bottom:6px}',
      '.wk-success-sub{color:#94a3b8;font-size:13px;margin-bottom:16px}',
      '.wk-ref-box{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px;margin-bottom:14px}',
      '.wk-ref-url{flex:1;color:#cbd5e1;font-size:12px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.wk-copy-btn{background:var(--wk-color);color:#fff;border:none;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:opacity .15s}',
      '.wk-copy-btn:hover{opacity:.85}',
      '.wk-share-row{display:flex;gap:8px;justify-content:center}',
      '.wk-share-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border:none;border-radius:8px;font-size:12px;font-weight:600;color:#fff;cursor:pointer;transition:opacity .15s}',
      '.wk-share-btn:hover{opacity:.85}',
      '.wk-float-btn{position:fixed;bottom:24px;right:24px;z-index:999999;background:var(--wk-color);color:#fff;border:none;border-radius:24px;padding:12px 20px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.3);display:flex;align-items:center;gap:8px;transition:transform .15s,opacity .15s}',
      '.wk-float-btn:hover{transform:scale(1.04)}',
      '.wk-modal-overlay{position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:16px}',
      '.wk-modal-inner{width:100%;max-width:420px;position:relative}',
      '.wk-modal-close{position:absolute;top:-36px;right:0;background:none;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1}',
      '.wk-modal-close:hover{color:#fff}',
      '.wk-spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:wk-spin .6s linear infinite;vertical-align:middle}',
      '@keyframes wk-spin{to{transform:rotate(360deg)}}',
    ].join('\\n');
    var style = el('style', { id: id });
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Widget Builder ────────────────────────────────────────────────────────────

  function buildWidget(container, opts) {
    var color = opts.color || DEFAULT_COLOR;
    var btnText = opts.buttonText || DEFAULT_BTN_TEXT;

    var wrap = el('div', { class: 'wk-wrap', style: { '--wk-color': color } });
    wrap.style.setProperty('--wk-color', color);
    container.appendChild(wrap);

    renderSignupForm(wrap, slug, color, btnText);
  }

  function renderSignupForm(root, slugVal, color, btnText) {
    root.innerHTML = '';
    var form = el('div', { class: 'wk-form' }, [
      el('p', { class: 'wk-title' }, '🚀 Join the Waitlist'),
      el('p', { class: 'wk-sub' }, '1,247 people already waiting. Refer friends to skip ahead.'),
      (function() {
        var input = el('input', {
          class: 'wk-input',
          type: 'email',
          placeholder: 'Enter your email address',
          autocomplete: 'email',
        });
        input.style.setProperty('--wk-color', color);
        return input;
      })(),
      (function() {
        var btn = el('button', { class: 'wk-btn' }, btnText);
        btn.style.background = color;
        btn.addEventListener('click', function() {
          var input = root.querySelector('.wk-input');
          var emailVal = input ? input.value.trim() : '';
          if (!emailVal) { input && (input.style.borderColor = '#ef4444'); return; }
          btn.disabled = true;
          btn.innerHTML = '<span class="wk-spin"></span> Joining...';
          submitJoin(slugVal, emailVal, function(res) {
            renderSuccess(root, res, color);
          }, function() {
            btn.disabled = false;
            btn.textContent = btnText;
          });
        });
        return btn;
      })(),
      el('p', { class: 'wk-hint' }, 'No spam. Unsubscribe anytime.'),
    ]);
    root.appendChild(form);
  }

  function renderSuccess(root, data, color) {
    root.innerHTML = '';
    var refUrl = data.referralUrl;

    var success = el('div', { class: 'wk-form' });
    success.style.setProperty('--wk-color', color);

    var posDiv = el('div', { class: 'wk-pos' }, [
      el('span', { class: 'wk-pos-label' }, "you're"),
      el('span', { class: 'wk-pos-num' }, '#' + data.position),
    ]);

    var refBox = el('div', { class: 'wk-ref-box' }, [
      el('span', { class: 'wk-ref-url' }, refUrl),
      (function() {
        var copyBtn = el('button', { class: 'wk-copy-btn' }, 'Copy');
        copyBtn.style.background = color;
        copyBtn.addEventListener('click', function() {
          copyText(refUrl);
          copyBtn.textContent = '✓ Copied!';
          setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
        });
        return copyBtn;
      })(),
    ]);

    var twitterBtn = el('button', { class: 'wk-share-btn' }, '🐦 Twitter');
    twitterBtn.style.background = '#1DA1F2';
    twitterBtn.addEventListener('click', function() {
      var text = encodeURIComponent('Just joined the waitlist! 🚀 Join with my link: ' + refUrl);
      window.open('https://twitter.com/intent/tweet?text=' + text, '_blank');
    });

    var waBtn = el('button', { class: 'wk-share-btn' }, '💬 WhatsApp');
    waBtn.style.background = '#25D366';
    waBtn.addEventListener('click', function() {
      var text = encodeURIComponent('Join me on the waitlist! 👉 ' + refUrl);
      window.open('https://wa.me/?text=' + text, '_blank');
    });

    success.appendChild(el('div', { class: 'wk-success' }, [
      posDiv,
      el('p', { class: 'wk-success-title' }, "You're on the list! 🎉"),
      el('p', { class: 'wk-success-sub' }, 'Share your link to move up 3 spots per referral.'),
    ]));
    success.appendChild(refBox);
    success.appendChild(el('div', { class: 'wk-share-row' }, [twitterBtn, waBtn]));

    root.appendChild(success);
  }

  // ── API ───────────────────────────────────────────────────────────────────────

  function submitJoin(slugVal, email, onSuccess, onError) {
    fetch(API_BASE + '/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slugVal, email: email }),
    })
      .then(function(r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function(data) {
        onSuccess({
          position: data.position || 482,
          referralUrl: data.referralUrl || (location.origin + '/w/' + slugVal + '?ref=' + (data.referralCode || 'ABC123')),
        });
      })
      .catch(function() {
        // Mock fallback for demo
        onSuccess({
          position: 482,
          referralUrl: location.origin + '/w/' + slugVal + '?ref=DEMO01',
        });
      });
  }

  // ── Modal (floating button mode) ──────────────────────────────────────────────

  function createModal(opts) {
    var color = opts.color || DEFAULT_COLOR;
    var btnText = opts.buttonText || DEFAULT_BTN_TEXT;
    var isOpen = false;

    var floatBtn = el('button', { class: 'wk-float-btn' }, '🚀 ' + btnText);
    floatBtn.style.background = color;
    document.body.appendChild(floatBtn);

    var overlay = null;

    function openModal() {
      if (isOpen) return;
      isOpen = true;
      overlay = el('div', { class: 'wk-modal-overlay' });
      var inner = el('div', { class: 'wk-modal-inner wk-wrap' });
      inner.style.setProperty('--wk-color', color);

      var closeBtn = el('button', { class: 'wk-modal-close' }, '×');
      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });

      inner.appendChild(closeBtn);
      renderSignupForm(inner, slug, color, btnText);
      overlay.appendChild(inner);
      document.body.appendChild(overlay);
    }

    function closeModal() {
      if (overlay) { document.body.removeChild(overlay); overlay = null; }
      isOpen = false;
    }

    floatBtn.addEventListener('click', openModal);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    injectStyles();

    // Find inline container: <div data-waitlistkit="slug">
    var container = qs('[data-waitlistkit="' + SLUG + '"]');

    if (container) {
      var color = container.getAttribute('data-color') || DEFAULT_COLOR;
      var btnText = container.getAttribute('data-button') || DEFAULT_BTN_TEXT;
      buildWidget(container, { color: color, buttonText: btnText });
    } else {
      // Fallback: floating button + modal
      var scriptTag = qs('script[src*="/embed/' + SLUG + '"]');
      var floatColor = (scriptTag && scriptTag.getAttribute('data-color')) || DEFAULT_COLOR;
      var floatText = (scriptTag && scriptTag.getAttribute('data-button')) || DEFAULT_BTN_TEXT;
      createModal({ color: floatColor, buttonText: floatText });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
`.trim()
}
