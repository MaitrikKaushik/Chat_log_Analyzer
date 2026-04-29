/* ============================================
   Chat Log Analyzer - Professional Frontend
   Advanced Analytics Dashboard
   ============================================ */

let uploadedFile = null;
let analysisResults = null;
let sentimentChart = null;
let wordsChart = null;
let hourlyChart = null;

// ============================================
// Chart Global Config for Dark Theme
// ============================================
if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
}

// ============================================
// VIEW ROUTING
// ============================================
const views = {
    home: document.getElementById('view-home'),
    upload: document.getElementById('view-upload'),
    dashboard: document.getElementById('view-dashboard')
};

function switchView(viewId) {
    // Hide all views
    Object.values(views).forEach(view => {
        if (view) {
            view.classList.remove('view-active');
            view.classList.add('view-hidden');
        }
    });

    // Toggle backgrounds based on view
    const bgVideo = document.querySelector('.bg-video');
    const ambientBg = document.querySelector('.ambient-bg');
    if (bgVideo && ambientBg) {
        if (viewId === 'home') {
            bgVideo.style.display = 'block';
            ambientBg.style.display = 'none';
        } else {
            bgVideo.style.display = 'none';
            ambientBg.style.display = 'block';
        }
    }

    // Show target view
    const targetView = views[viewId];
    if (targetView) {
        targetView.classList.remove('view-hidden');

        // Conditional header navigation visibility
        const navBtn = document.getElementById('getStartedBtnNav');
        if (navBtn) {
            navBtn.style.display = (viewId === 'home') ? 'block' : 'none';
        }

        // Small delay to allow display:block to apply before animating opacity
        setTimeout(() => {
            targetView.classList.add('view-active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    }
}

// ============================================
// DOM Elements
// ============================================

const fileInput = document.getElementById('fileInput');
const dragDropArea = document.getElementById('dragDropArea');
const analyzeBtn = document.getElementById('analyzeBtn');
const fileInfo = document.getElementById('fileInfo');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorBanner = document.getElementById('errorBanner');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');

// ============================================
// FILE UPLOAD HANDLING
// ============================================

// Drag and drop handlers
dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('drag-over');
});

dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('drag-over');
});

dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
});

// Click to browse
dragDropArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
    }
});

function processFile(file) {
    // Validate file type
    if (!file.name.endsWith('.txt')) {
        showError('Please upload a .txt file');
        return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File size exceeds 10MB limit');
        return;
    }

    uploadedFile = file;
    fileInfo.innerHTML = `
        <span>✅ ${file.name} (${formatFileSize(file.size)})</span>
        <button class="btn-remove-file" onclick="resetFileSelection()">Remove</button>
    `;
    fileInfo.classList.add('success');
    analyzeBtn.disabled = false;
}

function resetFileSelection() {
    uploadedFile = null;
    fileInput.value = ''; // Reset file input to allow re-selection of same file
    fileInfo.innerHTML = '';
    fileInfo.classList.remove('success');
    analyzeBtn.disabled = true;
    hideError();
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// ANALYZE BUTTON CLICK
// ============================================

analyzeBtn.addEventListener('click', analyzeFile);

async function analyzeFile() {
    if (!uploadedFile) {
        showError('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', uploadedFile);

    showLoading();
    hideError();

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Analysis failed');
        }

        const data = await response.json();
        analysisResults = data;

        hideLoading();
        displayResults(data);
        switchView('dashboard');

    } catch (error) {
        hideLoading();
        showError(error.message || 'Error analyzing file. Please try again.');
    }
}

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResults(data) {
    // Update stats
    document.getElementById('totalMessages').textContent = data.totalMessages || 0;
    document.getElementById('totalUsers').textContent = data.totalUsers || 0;
    document.getElementById('mostActiveUser').textContent = data.mostActiveUser || '-';
    document.getElementById('mostActiveHour').textContent =
        (data.mostActiveHour !== undefined && data.mostActiveHour !== null) ?
            data.mostActiveHour + ':00' : '-';

    // Display words list
    displayTopWords(data.topWords || []);

    // Display user activity
    displayUserActivity(data.userActivity || {});

    // Create charts
    createSentimentChart(data.sentimentBreakdown || data.sentiment || {});
    createWordsChart(data.topWords || []);
    createHourlyChart(data.hourlyDistribution || data.hourlyData || {});
}

function displayTopWords(words) {
    const container = document.getElementById('wordsList');

    if (!words || words.length === 0) {
        container.innerHTML = '<p class="empty-state">No word data available</p>';
        return;
    }

    container.innerHTML = words
        .slice(0, 15)
        .map(word => `<span class="word-badge">${word}</span>`)
        .join('');
}

function displayUserActivity(userActivity) {
    const container = document.getElementById('userActivity');

    if (!userActivity || Object.keys(userActivity).length === 0) {
        container.innerHTML = '<div class="empty-state">No user data</div>';
        return;
    }

    const rows = Object.entries(userActivity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([user, count]) => `
            <div class="table-row">
                <span>${user}</span>
                <span>${count}</span>
            </div>
        `)
        .join('');

    container.innerHTML = rows;
}


// ============================================
// CHARTS
// ============================================

function createSentimentChart(sentiment) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');

    // Destroy existing chart if it exists
    if (sentimentChart) {
        sentimentChart.destroy();
    }

    const positive = sentiment.positive || 0;
    const neutral = sentiment.neutral || 0;
    const negative = sentiment.negative || 0;

    sentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [positive, neutral, negative],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)', // Green
                    'rgba(157, 80, 187, 0.8)', // New Purple (#9d50bb)
                    'rgba(236, 72, 153, 0.8)'  // Pink
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(157, 80, 187)',
                    'rgb(236, 72, 153)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14, family: "'Inter', sans-serif" },
                        padding: 15
                    }
                }
            }
        }
    });
}

function createWordsChart(words) {
    const ctx = document.getElementById('wordsChart').getContext('2d');

    // Destroy existing chart if it exists
    if (wordsChart) {
        wordsChart.destroy();
    }

    const topWords = words.slice(0, 8);
    const frequencies = Array(topWords.length).fill(1).map((_, i) => topWords.length - i);

    wordsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topWords,
            datasets: [{
                label: 'Frequency',
                data: frequencies,
                backgroundColor: 'rgba(0, 210, 255, 0.5)', // New Cyan (#00d2ff)
                borderColor: 'rgb(0, 210, 255)',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 12, family: "'Inter', sans-serif" }
                    }
                },
                y: {
                    ticks: {
                        font: { size: 12, family: "'Inter', sans-serif" }
                    }
                }
            }
        }
    });
}

function createHourlyChart(hourlyData) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');

    // Destroy existing chart if it exists
    if (hourlyChart) {
        hourlyChart.destroy();
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const data = hours.map(h => hourlyData[h] || 0);

    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours.map(h => h + ':00'),
            datasets: [{
                label: 'Messages',
                data: data,
                borderColor: 'rgb(0, 210, 255)', // New Cyan (#00d2ff)
                backgroundColor: 'rgba(0, 210, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(0, 210, 255)',
                pointBorderColor: '#0b0c10',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 14, family: "'Inter', sans-serif" }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 11, family: "'Inter', sans-serif" }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 12, family: "'Inter', sans-serif" }
                    }
                }
            }
        }
    });
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showError(message) {
    errorMessage.textContent = message;
    errorBanner.classList.add('active');
    fileInfo.textContent = '';
    fileInfo.classList.remove('success');
}

function hideError() {
    errorBanner.classList.remove('active');
}

// DEPRECATED: Old single-page scroll logic replaced by switchView()
// function showResults() {
//     resultsSection.style.display = 'block';
//     resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
// }
// 
// function hideResults() {
//     resultsSection.style.display = 'none';
// }

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

function exportResults() {
    if (!analysisResults) {
        showError('No results to export');
        return;
    }

    const jsonString = JSON.stringify(analysisResults, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// ============================================
// INITIALIZATION & RESET
// ============================================

function resetEngine() {
    // Reset file upload state
    uploadedFile = null;
    analysisResults = null;
    fileInput.value = '';

    // Reset file info UI
    fileInfo.textContent = '';
    fileInfo.classList.remove('success');
    fileInfo.classList.remove('error');
    analyzeBtn.disabled = true;

    // Hide error banner if active
    hideError();

    // Switch back to start
    switchView('home');
}

console.log('Nexus Analytics Engine initialized');
