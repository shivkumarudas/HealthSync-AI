/**
 * HealthSync AI — Exercise Planner JS
 */

let exercisePlanText = '';

async function generateExercisePlan(e) {
    e.preventDefault();
    const form = document.getElementById('exercise-form');
    const btn = document.getElementById('exercise-btn');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => {
        if (val !== '') {
            data[key] = ['age', 'weight', 'height', 'duration_weeks', 'days_per_week'].includes(key)
                ? (parseFloat(val) || undefined)
                : val;
        }
    });

    setLoading(btn, true, 'Building Plan…');
    document.getElementById('exercise-placeholder').classList.add('hidden');
    document.getElementById('exercise-result').classList.add('hidden');
    document.getElementById('exercise-loading').classList.remove('hidden');

    try {
        const res = await apiPost('/api/exercise-plan', data);
        exercisePlanText = res.plan;
        document.getElementById('exercise-content').innerHTML = renderMarkdown(res.plan);
        document.getElementById('exercise-loading').classList.add('hidden');
        document.getElementById('exercise-result').classList.remove('hidden');
        showToast('Workout plan generated!', 'success');
    } catch (err) {
        document.getElementById('exercise-loading').classList.add('hidden');
        document.getElementById('exercise-placeholder').classList.remove('hidden');
        showToast('Error: ' + err.message, 'danger');
    } finally {
        setLoading(btn, false);
    }
}

function resetExercisePlan() {
    document.getElementById('exercise-result').classList.add('hidden');
    document.getElementById('exercise-placeholder').classList.remove('hidden');
    exercisePlanText = '';
}

function copyExercisePlan() {
    if (exercisePlanText) copyToClipboard(exercisePlanText);
}

function downloadExercisePlan() {
    if (exercisePlanText) downloadText(exercisePlanText, 'healthsync-workout-plan.txt');
}
