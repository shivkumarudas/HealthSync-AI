/**
 * HealthSync AI — Admin Dashboard JS
 */

let pendingDeleteId = null;

// ── User Search Filter ───────────────────────────
function filterUsers(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.user-row').forEach(row => {
        const username = row.dataset.username.toLowerCase();
        const email = row.dataset.email.toLowerCase();
        row.style.display = (username.includes(q) || email.includes(q)) ? '' : 'none';
    });
}

// ── Delete User Flow ─────────────────────────────
function deleteUser(id, username) {
    pendingDeleteId = id;
    document.getElementById('delete-username').textContent = username;
    document.getElementById('delete-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    document.getElementById('confirm-delete-btn').onclick = confirmDelete;
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    document.body.style.overflow = '';
    pendingDeleteId = null;
}

async function confirmDelete() {
    if (!pendingDeleteId) return;
    const btn = document.getElementById('confirm-delete-btn');
    setLoading(btn, true, 'Deleting…');

    try {
        const res = await fetch('/api/users/' + pendingDeleteId, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Delete failed');

        showToast(data.message, 'success');
        closeDeleteModal();
        // Remove row from table
        const row = document.querySelector(`tr[data-username]`);
        // Reload to refresh all stats
        setTimeout(() => location.reload(), 800);
    } catch (err) {
        showToast('Error: ' + err.message, 'danger');
    } finally {
        setLoading(btn, false);
    }
}

// ── Refresh Data ─────────────────────────────────
function refreshData() {
    location.reload();
}

// ── Keyboard Shortcut ────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDeleteModal();
});
