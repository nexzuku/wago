// Common Admin Panel Functionality

// Sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('is-active');
    }
    
    if (overlay) {
        overlay.classList.toggle('is-active');
    } else {
        // Create overlay if it doesn't exist
        const newOverlay = document.createElement('div');
        newOverlay.className = 'sidebar-overlay is-active';
        newOverlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(newOverlay);
    }
}

// Close sidebar when clicking overlay
function closeSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.remove('is-active');
    }
    
    if (overlay) {
        overlay.classList.remove('is-active');
    }
}

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('Logging out...');
        window.location.href = 'index.html';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification is-${type}`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
        <button class="delete" onclick="this.parentElement.remove()"></button>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu toggle button if in admin layout
    const adminLayout = document.querySelector('.admin-layout');
    if (adminLayout && window.innerWidth <= 768) {
        createMobileMenuButton();
    }
    
    // Recreate button on window resize
    window.addEventListener('resize', function() {
        const existingButton = document.querySelector('.mobile-menu-toggle');
        if (window.innerWidth <= 768 && !existingButton && adminLayout) {
            createMobileMenuButton();
        } else if (window.innerWidth > 768 && existingButton) {
            existingButton.remove();
            closeSidebar();
        }
    });
    
    // Close sidebar when clicking on menu items (mobile)
    const menuLinks = document.querySelectorAll('.admin-sidebar .menu-list a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Dropdown toggles
    const dropdowns = document.querySelectorAll('.dropdown:not(.is-hoverable)');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function() {
            this.classList.toggle('is-active');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('is-active');
            });
        }
    });
    
    // Modal close functionality
    const modalCloseButtons = document.querySelectorAll('.modal-background, .modal .delete');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.remove('is-active');
        });
    });
    
    // Escape key to close modals and sidebar
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal.is-active').forEach(modal => {
                modal.classList.remove('is-active');
            });
            closeSidebar();
        }
    });
});

// Create mobile menu button
function createMobileMenuButton() {
    const existingButton = document.querySelector('.mobile-menu-toggle');
    if (existingButton) return;
    
    const button = document.createElement('button');
    button.className = 'mobile-menu-toggle';
    button.innerHTML = '<i class="fas fa-bars fa-lg"></i>';
    button.setAttribute('aria-label', 'Toggle Menu');
    button.addEventListener('click', toggleSidebar);
    document.body.appendChild(button);
}

// Format date helper
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format time helper
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Percentage calculator
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// Export data functionality
function exportToCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return `"${value}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

// Search functionality helper
function filterTable(searchTerm, tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const search = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// Loading state helper
function setLoading(element, isLoading) {
    if (isLoading) {
        element.classList.add('is-loading');
        element.disabled = true;
    } else {
        element.classList.remove('is-loading');
        element.disabled = false;
    }
}

// Confirm action helper
function confirmAction(message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

console.log('Admin common scripts loaded');
