/**
 * HealthSync AI — Dashboard JS
 * Handles profile editing and dashboard interactions.
 */

function openProfileModal() {
    document.getElementById('profile-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

async function saveProfile(event) {
    event.preventDefault();
    const form = document.getElementById('profile-form');
    const btn = document.getElementById('save-profile-btn');
    const msgEl = document.getElementById('profile-msg');

    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => {
        if (val !== '') {
            // Convert numeric fields
            if (['age', 'weight', 'height'].includes(key)) {
                data[key] = parseFloat(val) || null;
            } else {
                data[key] = val;
            }
        }
    });

    setLoading(btn, true, 'Saving…');
    msgEl.classList.add('hidden');

    try {
        const res = await apiPost('/api/profile', data);
        msgEl.textContent = '✅ ' + res.message;
        msgEl.className = 'text-sm text-center text-green-400';
        msgEl.classList.remove('hidden');
        showToast('Profile saved successfully!', 'success');
        setTimeout(() => {
            closeProfileModal();
            location.reload();
        }, 1200);
    } catch (err) {
        msgEl.textContent = '❌ ' + err.message;
        msgEl.className = 'text-sm text-center text-red-400';
        msgEl.classList.remove('hidden');
        showToast(err.message, 'danger');
    } finally {
        setLoading(btn, false);
    }
}

// Close modal on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProfileModal();
});
