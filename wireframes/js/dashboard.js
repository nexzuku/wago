// Dashboard JavaScript

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function () {
    initActivityChart();
    initProgressChart();
});

// Mock Data Object - Simulating API Response
const dashboardData = {
    dailyActivity: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        users: [65, 78, 82, 91, 88, 73, 89],
        sessions: [45, 62, 68, 75, 71, 58, 72]
    },
    trainingProgress: {
        labels: ['Completed', 'In Progress', 'Not Started'],
        values: [68, 22, 10],
        colors: ['#48c774', '#ffdd57', '#f14668']
    }
};

function initActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;

    // Developer Note: Replace 'dashboardData.dailyActivity' with API response data
    const data = dashboardData.dailyActivity;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Active Users',
                data: data.users,
                borderColor: '#3b82f6', // Enterprise Blue
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Training Sessions',
                data: data.sessions,
                borderColor: '#10b981', // Enterprise Emerald
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#94a3b8' } // text-muted
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function initProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    const data = dashboardData.trainingProgress;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Export functionality
function exportReport() {
    console.log('Exporting report...');
    alert('Report export functionality will be implemented');
}
