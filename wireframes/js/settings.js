// Settings Page JavaScript

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-list a').forEach(link => {
        link.classList.remove('is-active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName + 'Section');
    if (section) {
        section.style.display = 'block';
    }
    
    // Add active class to clicked menu item
    event.currentTarget.classList.add('is-active');
}

// Profile photo upload
document.addEventListener('DOMContentLoaded', function() {
    const photoButton = document.querySelector('button:has(.fa-camera)');
    if (photoButton) {
        photoButton.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        document.querySelector('.image img').src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }
    
    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            alert('Settings saved successfully!');
        });
    });
});

// Enable 2FA
function enable2FA() {
    console.log('Enabling 2FA...');
    alert('Two-factor authentication setup will be implemented');
}

// Update payment method
function updatePaymentMethod() {
    console.log('Updating payment method...');
    alert('Payment method update will be implemented');
}

// Cancel subscription
function cancelSubscription() {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to all features.')) {
        console.log('Cancelling subscription...');
        alert('Subscription cancellation will be processed');
    }
}

// Upgrade plan
function upgradePlan() {
    console.log('Upgrading plan...');
    alert('Plan upgrade options will be displayed');
}
