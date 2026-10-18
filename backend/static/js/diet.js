/**
 * HealthSync AI — Diet Planner JS
 */

let dietPlanText = '';

async function generateDietPlan(e) {
    e.preventDefault();
    const form = document.getElementById('diet-form');
    const btn = document.getElementById('diet-btn');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => {
        if (val !== '') {
            data[key] = ['age', 'weight', 'height', 'duration_days', 'calories_target'].includes(key)
                ? (parseFloat(val) || undefined)
                : val;
        }
    });

    setLoading(btn, true, 'Generating Plan…');
    document.getElementById('diet-placeholder').classList.add('hidden');
    document.getElementById('diet-result').classList.add('hidden');
    document.getElementById('diet-loading').classList.remove('hidden');

    try {
        const res = await apiPost('/api/diet-plan', data);
        dietPlanText = res.plan;
        document.getElementById('diet-content').innerHTML = renderMarkdown(res.plan);
        document.getElementById('diet-loading').classList.add('hidden');
        document.getElementById('diet-result').classList.remove('hidden');
        showToast('Diet plan generated!', 'success');
    } catch (err) {
        document.getElementById('diet-loading').classList.add('hidden');
        document.getElementById('diet-placeholder').classList.remove('hidden');
        showToast('Error: ' + err.message, 'danger');
    } finally {
        setLoading(btn, false);
    }
}

function resetDietPlan() {
    document.getElementById('diet-result').classList.add('hidden');
    document.getElementById('diet-placeholder').classList.remove('hidden');
    dietPlanText = '';
}

function copyDietPlan() {
    if (dietPlanText) copyToClipboard(dietPlanText);
}

function downloadDietPlan() {
    if (dietPlanText) downloadText(dietPlanText, 'healthsync-diet-plan.txt');
}
