/**
 * HealthSync AI — Common JS Utilities
 * Shared functions used across all pages.
 */

// ── Mobile Nav ──────────────────────────────────
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// ── Markdown Rendering ───────────────────────────
function renderMarkdown(text) {
    if (typeof marked === 'undefined') return escapeHtml(text).replace(/\n/g, '<br>');
    marked.setOptions({
        breaks: true,
        gfm: true,
    });
    return marked.parse(text);
}

// ── Escape HTML ──────────────────────────────────
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ── Copy to Clipboard ────────────────────────────
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied to clipboard!', 'success');
        return true;
    }
}

// ── Download as Text File ────────────────────────
function downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Toast Notification ───────────────────────────
function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-green-900 border-green-700 text-green-100',
        danger:  'bg-red-900 border-red-700 text-red-100',
        warning: 'bg-yellow-900 border-yellow-700 text-yellow-100',
        info:    'bg-blue-900 border-blue-700 text-blue-100',
    };
    const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl animate-fade-in ${colors[type] || colors.info}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span class="text-sm font-medium">${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ── Format File Size ─────────────────────────────
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Auto-resize Textarea ─────────────────────────
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
}

// ── Set Loading State on Button ──────────────────
function setLoading(btn, loading, text = 'Processing…') {
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<span class="spinner inline-block w-4 h-4 border-2"></span> ${text}`;
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
        btn.disabled = false;
    }
}

// ── Scroll to bottom of element ──────────────────
function scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
}

// ── API helper ───────────────────────────────────
async function apiPost(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

// ── Init Lucide icons if available ───────────────
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
