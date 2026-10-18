/**
 * HealthSync AI — Doctor Finder JS
 */

let doctorsResult = '';

async function findDoctors(e) {
    e.preventDefault();
    const form = document.getElementById('doctors-form');
    const btn = document.getElementById('doctors-btn');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => { if (val !== '') data[key] = val; });

    setLoading(btn, true, 'Searching…');
    document.getElementById('doctors-placeholder').classList.add('hidden');
    document.getElementById('doctors-result').classList.add('hidden');
    document.getElementById('doctors-loading').classList.remove('hidden');

    try {
        const res = await apiPost('/api/doctors', data);
        doctorsResult = res.result;
        document.getElementById('doctors-content').innerHTML = renderMarkdown(res.result);
        document.getElementById('doctors-loading').classList.add('hidden');
        document.getElementById('doctors-result').classList.remove('hidden');
        showToast('Doctor recommendations ready!', 'success');
    } catch (err) {
        document.getElementById('doctors-loading').classList.add('hidden');
        document.getElementById('doctors-placeholder').classList.remove('hidden');
        showToast('Error: ' + err.message, 'danger');
    } finally {
        setLoading(btn, false);
    }
}

function setSpecialty(specialty) {
    const select = document.getElementById('specialty-select');
    for (const opt of select.options) {
        if (opt.value === specialty) {
            select.value = specialty;
            break;
        }
    }
}

function resetDoctors() {
    document.getElementById('doctors-result').classList.add('hidden');
    document.getElementById('doctors-placeholder').classList.remove('hidden');
    doctorsResult = '';
}

function copyDoctorsResult() {
    if (doctorsResult) copyToClipboard(doctorsResult);
}
