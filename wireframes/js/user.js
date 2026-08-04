// WaGo User Training Interface - Interactive Functionality

// State Management
const appState = {
    isRecording: false,
    currentLanguage: 'en',
    currentTab: 'practice',
    conversationHistory: [],
    performanceMetrics: {
        fluency: 0,
        pronunciation: 0,
        context: 0,
        pitch: 0,
        grammar: 0,
        vocabulary: 0
    },
    stats: {
        sessionsCompleted: 0,
        trainingTime: 0,
        overallProgress: 0,
        phrasesLearned: 0
    },
    sessionStartTime: null,
    isOnline: navigator.onLine
};

// DOM Elements
let micButton;
let recordingIndicator;
let conversationContent;
let languageSelector;
let sidebar;
let sidebarOverlay;
let expandButton;
let collapseButton;
let sidebarToggle;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    attachEventListeners();
    initializeNavbar();
    initializeTabs();
    restoreSidebarState();
    initializeSwipeGestures();
    loadUserData();
    startSessionTimer();
    monitorConnection();
    
    // Initialize suggestion cards after DOM is ready
    setTimeout(() => {
        initializeSuggestionCards();
    }, 100);
    
    // Show welcome message for first-time users
    if (!localStorage.getItem('wagoUserState')) {
        setTimeout(() => {
            showNotification('Welcome to WaGo! Click suggestion cards to expand details.');
        }, 1000);
    }
});

// Initialize DOM elements
function initializeElements() {
    micButton = document.getElementById('micButton');
    recordingIndicator = document.getElementById('recordingIndicator');
    conversationContent = document.querySelector('.conversation-content');
    languageSelector = document.querySelector('.language-selector select');
    sidebar = document.getElementById('appSidebar');
    sidebarOverlay = document.getElementById('sidebarOverlay');
    expandButton = document.getElementById('expandSidebar');
    collapseButton = document.getElementById('collapseSidebar');
    sidebarToggle = document.getElementById('sidebarToggle');
}

// Attach event listeners
function attachEventListeners() {
    // Microphone button
    if (micButton) {
        micButton.addEventListener('click', toggleRecording);
    }

    // Language selector
    if (languageSelector) {
        languageSelector.addEventListener('change', handleLanguageChange);
    }

    // Suggestion cards will be initialized separately after DOM is ready

    // Topic tags
    const topicTags = document.querySelectorAll('.topic-tag');
    topicTags.forEach(tag => {
        tag.addEventListener('click', () => handleTopicClick(tag));
    });

    // Resource buttons
    const resourceButtons = document.querySelectorAll('.resource-item button');
    resourceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const resourceItem = button.closest('.resource-item');
            handleResourceClick(resourceItem);
        });
    });

    // Help button
    const helpButton = document.getElementById('helpButton');
    if (helpButton) {
        helpButton.addEventListener('click', showContextualHelp);
    }

    // Sidebar controls
    if (collapseButton) {
        collapseButton.addEventListener('click', collapseSidebar);
    }

    if (expandButton) {
        expandButton.addEventListener('click', expandSidebar);
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', closeMobileSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }
}

// Show contextual help based on current tab
function showContextualHelp() {
    const helpMessages = {
        practice: '💬 Practice Tab: Tap the mic button to start recording. Use suggestion cards to practice Japanese phrases. Your conversation is saved automatically.',
        performance: '📊 Performance Tab: View your progress across 6 key metrics. Each metric updates in real-time as you practice.',
        resources: '📚 Resources Tab: Browse available topics and training materials. Tap topic tags to filter content, click View/Listen to access resources.',
        progress: '📈 Progress Tab: Track your overall learning journey. Stats update after each training session. Keep practicing to improve!',
        activity: '🕒 Activity Tab: View your recent training sessions and practice history. Track completed sessions, achievements, and overall activity timeline.'
    };

    const message = helpMessages[appState.currentTab] || 'Navigate between tabs to explore different features. Your progress is saved automatically!';
    showNotification(message, 5000);
}

// Initialize navbar functionality
function initializeNavbar() {
    // Mobile navbar burger
    const burger = document.querySelector('.navbar-burger');
    const menu = document.querySelector('.navbar-menu');

    if (burger && menu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    }
}

// Initialize tabs functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.sidebar-item');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = button.getAttribute('data-tab');
            
            // Haptic feedback simulation (for mobile)
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
            
            // Track tab change
            appState.currentTab = targetTab;
            
            // Remove active class from all tabs and content
            tabButtons.forEach(btn => btn.classList.remove('is-active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('is-active');
            });
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('is-active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.classList.add('is-active');
            }

            // Close mobile sidebar after selection
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }

            // Log tab view (for analytics)
            console.log(`Tab switched to: ${targetTab}`);
            
            // Save state
            saveUserData();
        });
    });

    // Restore last active tab on load
    const savedTab = localStorage.getItem('wagoLastTab');
    if (savedTab && savedTab !== 'practice') {
        const tabButton = document.querySelector(`[data-tab="${savedTab}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
}

// Collapse sidebar
function collapseSidebar() {
    if (sidebar) {
        sidebar.classList.add('collapsed');
        localStorage.setItem('wagoSidebarCollapsed', 'true');
    }
}

// Expand sidebar
function expandSidebar() {
    if (window.innerWidth <= 768) {
        // Mobile: open as overlay
        openMobileSidebar();
    } else {
        // Desktop: expand sidebar
        if (sidebar) {
            sidebar.classList.remove('collapsed');
            localStorage.setItem('wagoSidebarCollapsed', 'false');
        }
    }
}

// Open mobile sidebar
function openMobileSidebar() {
    if (sidebar) {
        sidebar.classList.add('mobile-open');
    }
    if (sidebarOverlay) {
        sidebarOverlay.classList.add('is-active');
    }
}

// Close mobile sidebar
function closeMobileSidebar() {
    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
    if (sidebarOverlay) {
        sidebarOverlay.classList.remove('is-active');
    }
}

// Restore sidebar state
function restoreSidebarState() {
    const isCollapsed = localStorage.getItem('wagoSidebarCollapsed') === 'true';
    if (isCollapsed && window.innerWidth > 768) {
        if (sidebar) {
            sidebar.classList.add('collapsed');
        }
    }
}

// Initialize suggestion cards functionality
function initializeSuggestionCards() {
    // Suggestion expand buttons
    const expandButtons = document.querySelectorAll('.suggestion-expand');
    expandButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = button.closest('.suggestion-card');
            toggleSuggestionExpand(card);
        });
    });

    // Suggestion headers (also toggle on click)
    const suggestionHeaders = document.querySelectorAll('.suggestion-header');
    suggestionHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            if (!e.target.closest('.suggestion-expand')) {
                const card = header.closest('.suggestion-card');
                toggleSuggestionExpand(card);
            }
        });
    });

    // Suggestion Practice buttons
    const speakButtons = document.querySelectorAll('.suggestion-speak');
    speakButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = button.closest('.suggestion-card');
            handleSuggestionPractice(card);
        });
    });

    // Suggestion Copy buttons
    const copyButtons = document.querySelectorAll('.suggestion-copy');
    copyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = button.closest('.suggestion-card');
            handleSuggestionCopy(card);
        });
    });

    // Defensive: delegated guard on the container so only intended elements act
    const suggestionsContainer = document.querySelector('.suggestions-content');
    if (suggestionsContainer) {
        suggestionsContainer.addEventListener('click', (e) => {
            const isExpand = !!e.target.closest('.suggestion-expand');
            const isHeader = !!e.target.closest('.suggestion-header');
            const isPractice = !!e.target.closest('.suggestion-speak');
            const isCopy = !!e.target.closest('.suggestion-copy');

            // If click is on header/expand, we already handle toggle above; prevent any other action
            if (isExpand || isHeader) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            // Only these should perform actions; others do nothing
            if (!isPractice && !isCopy) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true); // use capture phase to intercept early
    }
}

// Initialize swipe gestures for mobile
function initializeSwipeGestures() {
    const appContent = document.querySelector('.app-content');
    if (!appContent) return;

    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 80;

    appContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    appContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) < minSwipeDistance) return;

        const tabs = ['practice', 'performance', 'resources', 'progress', 'activity'];
        const currentIndex = tabs.indexOf(appState.currentTab);

        let newIndex;
        if (swipeDistance > 0) {
            // Swipe right - go to previous tab or open sidebar if at start
            if (touchStartX < 50 && window.innerWidth <= 768) {
                openMobileSidebar();
                return;
            }
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
            // Swipe left - go to next tab
            newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }

        const targetTab = tabs[newIndex];
        const tabButton = document.querySelector(`[data-tab="${targetTab}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
}

// Toggle recording state
function toggleRecording() {
    appState.isRecording = !appState.isRecording;

    if (appState.isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

// Start recording
function startRecording() {
    micButton.classList.add('is-recording');
    recordingIndicator.classList.remove('is-hidden');
    
    const micStatus = document.querySelector('.mic-status');
    if (micStatus) {
        micStatus.textContent = 'Listening...';
    }

    // Simulate recording (in production, this would use Web Speech API)
    console.log('Recording started...');
    
    // Auto-stop after 10 seconds (demo)
    setTimeout(() => {
        if (appState.isRecording) {
            stopRecording();
            simulateResponse();
        }
    }, 10000);
}

// Stop recording
function stopRecording() {
    appState.isRecording = false;
    micButton.classList.remove('is-recording');
    recordingIndicator.classList.add('is-hidden');
    
    const micStatus = document.querySelector('.mic-status');
    if (micStatus) {
        micStatus.textContent = 'Tap to speak';
    }

    console.log('Recording stopped.');
}

// Simulate AI response (demo)
function simulateResponse() {
    const userMessage = "I practiced saying 'Ohayou gozaimasu'";
    const systemResponse = "Great job! Your pronunciation is improving. Let's try another phrase.";

    addMessageToConversation('user', userMessage);
    
    setTimeout(() => {
        addMessageToConversation('system', systemResponse);
        updatePerformanceMetrics();
    }, 1000);
}

// Add message to conversation
function addMessageToConversation(type, text) {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${type}-message`;
    
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const icon = type === 'user' ? 'fa-user' : 'fa-robot';
    const sender = type === 'user' ? 'You' : 'System';

    messageItem.innerHTML = `
        <div class="message-bubble">
            <div class="message-header">
                <span class="icon"><i class="fas ${icon}"></i></span>
                <span class="has-text-weight-semibold">${sender}</span>
                <span class="message-time">${currentTime}</span>
            </div>
            <div class="message-text">${text}</div>
        </div>
    `;

    conversationContent.appendChild(messageItem);
    conversationContent.scrollTop = conversationContent.scrollHeight;
    // Store in history
    appState.conversationHistory.push({ type, text, time: currentTime });
}

// Toggle suggestion card expand/collapse
function toggleSuggestionExpand(card) {
    const isExpanded = card.classList.contains('expanded');
    
    // Close all other expanded cards
    document.querySelectorAll('.suggestion-card.expanded').forEach(c => {
        if (c !== card) {
            c.classList.remove('expanded');
        }
    });
    
    // Toggle this card
    card.classList.toggle('expanded');

    // Update aria state on the card's expand button for a11y
    const expandBtn = card.querySelector('.suggestion-expand');
    if (expandBtn) {
        expandBtn.setAttribute('aria-expanded', String(!isExpanded));
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
    
    console.log(isExpanded ? 'Collapsed suggestion' : 'Expanded suggestion');
}

// Handle suggestion practice
function handleSuggestionPractice(card) {
    const phrase = card.getAttribute('data-phrase');
    const japanese = card.querySelector('.suggestion-japanese').textContent;
    
    console.log('Practice phrase:', phrase);
    
    // Add to conversation
    addMessageToConversation('user', `I want to practice: ${japanese}`);
    
    // Trigger mic button
    setTimeout(() => {
        if (!appState.isRecording) {
            toggleRecording();
        }
    }, 500);
    
    // Show notification
    showNotification(' Mic activated! Start speaking when ready.', 3000);
    
    // Visual feedback
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = '';
    }, 200);
}

// Handle suggestion copy
function handleSuggestionCopy(card) {
    const japanese = card.querySelector('.suggestion-japanese').textContent;
    const romaji = card.querySelector('.suggestion-romaji').textContent;
    const translation = card.querySelector('.suggestion-translation').textContent;
    
    const textToCopy = `${japanese}\n${romaji}\n${translation}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification(' Copied to clipboard!', 2000);
        
        // Visual feedback
        const copyButton = card.querySelector('.suggestion-copy');
        const originalHTML = copyButton.innerHTML;
        copyButton.innerHTML = '<span class="icon"><i class="fas fa-check"></i></span>';
        
        setTimeout(() => {
            copyButton.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy. Please try again.', 2000);
    });
}

// Handle language change
function handleLanguageChange(e) {
    appState.currentLanguage = e.target.value;
    console.log('Language changed to:', appState.currentLanguage);
    
    // Show notification
    showNotification(`Language changed to ${e.target.options[e.target.selectedIndex].text}`);
}

// Handle topic click
function handleTopicClick(tag) {
    const topic = tag.textContent;
    console.log('Topic selected:', topic);
    
    // Highlight selected topic
    document.querySelectorAll('.topic-tag').forEach(t => {
        t.classList.remove('is-primary');
    });
    tag.classList.add('is-primary');
    
    // Add system message about topic
    addMessageToConversation('system', `Great! Let's practice ${topic}. What would you like to learn?`);
}

// Handle resource click
function handleResourceClick(resourceItem) {
    const resourceName = resourceItem.querySelector('span:not(.icon)').textContent;
    console.log('Resource accessed:', resourceName);
    
    showNotification(`Opening: ${resourceName}`);
    
    // In production, this would open the actual resource
    // For demo, just show a notification
}

// Update performance metrics
function updatePerformanceMetrics() {
    // Simulate metric updates (in production, these would come from AI analysis)
    const metrics = ['fluency', 'pronunciation', 'context', 'pitch', 'grammar', 'vocabulary'];
    
    metrics.forEach(metric => {
        const currentValue = appState.performanceMetrics[metric];
        const newValue = Math.min(100, currentValue + Math.floor(Math.random() * 15) + 5);
        appState.performanceMetrics[metric] = newValue;
        
        // Update UI
        const metricCard = document.querySelector(`.metric-card:has(.metric-label:contains("${metric}"))`);
        if (metricCard) {
            updateMetricCard(metric, newValue);
        }
    });

    // Update stats
    appState.stats.sessionsCompleted++;
    appState.stats.trainingTime += Math.floor(Math.random() * 5) + 1;
    appState.stats.phrasesLearned += Math.floor(Math.random() * 3) + 1;
    appState.stats.overallProgress = Math.floor(
        Object.values(appState.performanceMetrics).reduce((a, b) => a + b, 0) / 6
    );

    updateStatsDisplay();
}

// Update metric card
function updateMetricCard(metricName, value) {
    const metricCards = document.querySelectorAll('.metric-card');
    
    metricCards.forEach(card => {
        const label = card.querySelector('.metric-label');
        if (label && label.textContent.toLowerCase() === metricName.toLowerCase()) {
            const valueElement = card.querySelector('.metric-value');
            const progressBar = card.querySelector('.progress');
            
            if (valueElement) {
                animateValue(valueElement, parseInt(valueElement.textContent) || 0, value, 500);
            }
            
            if (progressBar) {
                progressBar.value = value;
            }
        }
    });
}

// Animate number value
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Update stats display
function updateStatsDisplay() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(item => {
        const label = item.querySelector('.stat-label').textContent;
        const valueElement = item.querySelector('.stat-value');
        
        if (label.includes('Sessions')) {
            valueElement.textContent = appState.stats.sessionsCompleted;
        } else if (label.includes('Training Time')) {
            valueElement.textContent = `${appState.stats.trainingTime} min`;
        } else if (label.includes('Progress')) {
            valueElement.textContent = `${appState.stats.overallProgress}%`;
        } else if (label.includes('Phrases')) {
            valueElement.textContent = appState.stats.phrasesLearned;
        }
    });
}

// Show notification
function showNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification is-light';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        max-width: 320px;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    notification.innerHTML = `
        <button class="delete"></button>
        <div style="font-size: 0.9rem; line-height: 1.5;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Add close functionality
    const deleteButton = notification.querySelector('.delete');
    deleteButton.addEventListener('click', () => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after specified duration
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Load user data (from localStorage or API)
function loadUserData() {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem('wagoUserState');
    
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            Object.assign(appState, parsed);
            
            // Update UI with loaded data
            updateAllMetrics();
            updateStatsDisplay();
        } catch (e) {
            console.error('Error loading saved state:', e);
        }
    }
}

// Save user data
function saveUserData() {
    try {
        localStorage.setItem('wagoUserState', JSON.stringify(appState));
        localStorage.setItem('wagoLastTab', appState.currentTab);
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

// Track session time
function startSessionTimer() {
    appState.sessionStartTime = Date.now();
    
    // Update session time every minute
    setInterval(() => {
        if (appState.sessionStartTime) {
            const elapsed = Math.floor((Date.now() - appState.sessionStartTime) / 60000);
            if (elapsed > 0) {
                appState.stats.trainingTime += 1;
                updateStatsDisplay();
                saveUserData();
            }
        }
    }, 60000); // Every minute
}

// Monitor online/offline status
function monitorConnection() {
    window.addEventListener('online', () => {
        appState.isOnline = true;
        showNotification('You are back online!');
    });

    window.addEventListener('offline', () => {
        appState.isOnline = false;
        showNotification('You are offline. Some features may not work.');
    });
}

// Update all metrics on load
function updateAllMetrics() {
    Object.entries(appState.performanceMetrics).forEach(([metric, value]) => {
        updateMetricCard(metric, value);
    });
}

// Save state periodically
setInterval(saveUserData, 30000); // Save every 30 seconds

// Save state before page unload
window.addEventListener('beforeunload', saveUserData);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space bar to toggle recording
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleRecording();
    }
});

// Export for debugging
window.wagoApp = {
    state: appState,
    addMessage: addMessageToConversation,
    updateMetrics: updatePerformanceMetrics,
    showNotification
};

console.log('WaGo Training Interface initialized successfully!');
