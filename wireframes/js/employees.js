// Employee Management JavaScript

function switchTab(tab) {
    const tabs = document.querySelectorAll('.tabs li');
    tabs.forEach(t => t.classList.remove('is-active'));
    
    if (tab === 'single') {
        document.getElementById('singleEmployeeForm').style.display = 'block';
        document.getElementById('bulkUploadForm').style.display = 'none';
        tabs[0].classList.add('is-active');
    } else {
        document.getElementById('singleEmployeeForm').style.display = 'none';
        document.getElementById('bulkUploadForm').style.display = 'block';
        tabs[1].classList.add('is-active');
    }
}

function addEmployee() {
    console.log('Adding employee...');
    alert('Employee added successfully!');
    // In real app, this would make an API call
}

function clearForm() {
    document.querySelectorAll('#singleEmployeeForm input').forEach(input => {
        if (input.type !== 'button' && input.type !== 'submit') {
            input.value = '';
        }
    });
}

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('csvFileName').textContent = file.name;
    }
}

function uploadCSV() {
    console.log('Uploading CSV...');
    alert('CSV upload will be processed');
    // In real app, this would parse and upload the CSV
}

function editEmployee(id) {
    console.log('Editing employee:', id);
    document.getElementById('editModal').classList.add('is-active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('is-active');
}

function resetPassword(id) {
    console.log('Resetting password for employee:', id);
    if (confirm('Send password reset email to this employee?')) {
        alert('Password reset email sent!');
    }
}

function deleteEmployee(id) {
    console.log('Deleting employee:', id);
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
        alert('Employee deleted successfully!');
        // In real app, this would make an API call
    }
}

function toggleAllCheckboxes(source) {
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = source.checked;
    });
}

// Manage Topics Functions
function manageTopics(employeeId, employeeName) {
    console.log('Managing topics for employee:', employeeId, employeeName);
    document.getElementById('employeeName').textContent = employeeName;
    document.getElementById('manageTopicsModal').classList.add('is-active');
}

function closeManageTopicsModal() {
    document.getElementById('manageTopicsModal').classList.remove('is-active');
}

function saveTopicAssignments() {
    alert('Topic assignments saved successfully! Employee will now see updated training content.');
    closeManageTopicsModal();
    // In production: Save assignments to database and refresh
}

// View Employee Details Functions
function viewEmployeeDetails(employeeId) {
    console.log('Viewing details for employee:', employeeId);
    // In production: Fetch employee data and populate modal
    const employeeNames = {
        1: 'John Tanaka',
        2: 'Sarah Williams',
        3: 'Mike Chen',
        4: 'Yuki Sato'
    };
    document.getElementById('detailEmployeeName').textContent = employeeNames[employeeId] || 'Employee';
    document.getElementById('employeeDetailsModal').classList.add('is-active');
}

function closeEmployeeDetailsModal() {
    document.getElementById('employeeDetailsModal').classList.remove('is-active');
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[placeholder="Search employees..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});

console.log('Employee Management with Content Integration loaded');
