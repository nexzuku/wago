// Voice Management JavaScript

function playVoice() {
    console.log('Playing voice sample...');
    alert('Voice preview will play here');
    // In real app, this would play the actual audio file
}

function openUploadModal() {
    document.getElementById('uploadModal').classList.add('is-active');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('is-active');
}

function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('audioFileName').textContent = file.name;
        
        // Validate file type
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid audio file (MP3, WAV, M4A)');
            return;
        }
        
        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 50MB');
            return;
        }
        
        console.log('Audio file selected:', file.name);
    }
}

function selectAccent(accent) {
    // Remove is-selected from all cards
    document.querySelectorAll('.accent-card').forEach(card => {
        card.classList.remove('is-selected');
        const button = card.querySelector('button');
        if (button) {
            button.textContent = 'Select';
            button.classList.remove('is-success');
        }
    });
    
    // Add is-selected to clicked card
    event.currentTarget.classList.add('is-selected');
    const button = event.currentTarget.querySelector('button');
    if (button) {
        button.textContent = 'Selected';
        button.classList.add('is-success');
    }
    
    console.log('Selected accent:', accent);
    alert(`${accent.charAt(0).toUpperCase() + accent.slice(1)} accent selected`);
}

// Delete audio file
function deleteAudioFile(id) {
    if (confirm('Are you sure you want to delete this audio file?')) {
        console.log('Deleting audio file:', id);
        alert('Audio file deleted successfully');
        // In real app, this would make an API call
    }
}

// Play audio from table
document.addEventListener('DOMContentLoaded', function() {
    const playButtons = document.querySelectorAll('button[title="Play"]');
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Playing audio...');
            alert('Audio playback will be implemented');
        });
    });
    
    const downloadButtons = document.querySelectorAll('button[title="Download"]');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Downloading audio...');
            alert('Audio download will be implemented');
        });
    });
    
    const deleteButtons = document.querySelectorAll('button[title="Delete"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Delete this audio file?')) {
                console.log('Deleting audio...');
                alert('Audio file deleted');
            }
        });
    });
});
