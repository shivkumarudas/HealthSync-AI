/**
 * HealthSync AI — Medical Report Analyzer JS
 */

let selectedFile = null;
let analysisResult = '';

// ── Drag & Drop Handlers ─────────────────────────
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('upload-zone').classList.add('dragover');
}

function handleDragLeave(e) {
    document.getElementById('upload-zone').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('upload-zone').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) setFile(file);
}

function handleFileSelect(input) {
    if (input.files[0]) setFile(input.files[0]);
}

function setFile(file) {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|webp)$/i)) {
        showToast('Unsupported file type. Please upload PDF or image.', 'danger');
        return;
    }
    if (file.size > 16 * 1024 * 1024) {
        showToast('File too large. Max 16 MB.', 'danger');
        return;
    }

    selectedFile = file;
    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    // Update UI
    document.getElementById('upload-placeholder').classList.add('hidden');
    document.getElementById('file-preview').classList.remove('hidden');
    document.getElementById('file-icon').textContent = isPdf ? '📄' : '🖼️';
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
    document.getElementById('analyze-btn').disabled = false;

    // Show image preview
    const imgWrapper = document.getElementById('img-preview-wrapper');
    const imgPreview = document.getElementById('img-preview');
    if (!isPdf) {
        const reader = new FileReader();
        reader.onload = e => { imgPreview.src = e.target.result; };
        reader.readAsDataURL(file);
        imgWrapper.classList.remove('hidden');
    } else {
        imgWrapper.classList.add('hidden');
    }
}

function clearFile(e) {
    e.stopPropagation();
    selectedFile = null;
    document.getElementById('file-input').value = '';
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('img-preview-wrapper').classList.add('hidden');
    document.getElementById('analyze-btn').disabled = true;
}

// ── Analysis ─────────────────────────────────────
async function analyzeReport() {
    if (!selectedFile) return;

    const btn = document.getElementById('analyze-btn');
    setLoading(btn, true, 'Analyzing…');

    // Show loading
    document.getElementById('result-placeholder').classList.add('hidden');
    document.getElementById('result-display').classList.add('hidden');
    document.getElementById('result-loading').classList.remove('hidden');

    // Fake progress animation
    let prog = 0;
    const progFill = document.getElementById('progress-bar-fill');
    const progText = document.getElementById('progress-text');
    const steps = [
        [10, 'Uploading file…'],
        [35, 'Extracting content…'],
        [65, 'AI analyzing data…'],
        [85, 'Generating insights…'],
    ];
    let si = 0;
    const progInterval = setInterval(() => {
        if (si < steps.length) {
            prog = steps[si][0];
            progText.textContent = steps[si][1];
            progFill.style.width = prog + '%';
            si++;
        }
    }, 1200);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();

        clearInterval(progInterval);
        progFill.style.width = '100%';
        progText.textContent = 'Complete!';

        if (!res.ok) throw new Error(data.error || 'Analysis failed');

        analysisResult = data.result;
        document.getElementById('result-filename').textContent = '📄 ' + data.filename;
        document.getElementById('result-content').innerHTML = renderMarkdown(data.result);

        setTimeout(() => {
            document.getElementById('result-loading').classList.add('hidden');
            document.getElementById('result-display').classList.remove('hidden');
        }, 400);

    } catch (err) {
        clearInterval(progInterval);
        document.getElementById('result-loading').classList.add('hidden');
        document.getElementById('result-placeholder').classList.remove('hidden');
        showToast('Error: ' + err.message, 'danger');
    } finally {
        setLoading(btn, false);
    }
}

function resetAnalyzer() {
    clearFile({ stopPropagation: () => {} });
    document.getElementById('result-display').classList.add('hidden');
    document.getElementById('result-placeholder').classList.remove('hidden');
    analysisResult = '';
}

function copyResult() {
    if (analysisResult) copyToClipboard(analysisResult);
}

function downloadResult() {
    if (analysisResult) downloadText(analysisResult, 'healthsync-report-analysis.txt');
}
