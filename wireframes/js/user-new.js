// WaGo Training App - Interactive JavaScript
// Option 3: Progressive Disclosure Design

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== ELEMENTS ====================
    const navItems = document.querySelectorAll('.nav-item');
    const trainingMain = document.getElementById('trainingMain');
    const conversationScreen = document.getElementById('conversationScreen');
    const tipsSheet = document.getElementById('tipsSheet');
    const performanceScreen = document.getElementById('performanceScreen');
    const resourcesScreen = document.getElementById('resourcesScreen');
    const profileMenu = document.getElementById('profileMenu');
    const emergencyScreen = document.getElementById('emergencyScreen');
    const scenariosScreen = document.getElementById('scenariosScreen');
    const visualScreen = document.getElementById('visualScreen');
    const teamScreen = document.getElementById('teamScreen');
    
    const micButton = document.getElementById('micButton');
    const profileBtn = document.getElementById('profileBtn');
    const notificationBtn = document.getElementById('notificationBtn');
    const playAudioBtn = document.getElementById('playAudio');
    const bookmarkBtn = document.getElementById('bookmarkPhrase');
    const changeVoiceBtn = document.getElementById('changeVoice');
    const skipPhraseBtn = document.getElementById('skipPhrase');
    const prevPhraseBtn = document.getElementById('prevPhrase');
    const nextPhraseBtn = document.getElementById('nextPhrase');
    const pronScore = document.getElementById('pronScore');
    const emergencyBtn = document.getElementById('emergencyBtn');
    const closeEmergency = document.getElementById('closeEmergency');
    const waveformBox = document.getElementById('waveformBox');
    const topicSelectorBtn = document.getElementById('topicSelectorBtn');
    const topicSheet = document.getElementById('topicSheet');
    const closeTopicSheet = document.getElementById('closeTopicSheet');
    const currentTopicName = document.getElementById('currentTopicName');
    const categoryBadge = document.getElementById('categoryBadge');
    const scenariosList = document.getElementById('scenariosList');
    const pathsScreen = document.getElementById('pathsScreen');
    const backFromCulture = document.getElementById('backFromCulture');
    const backFromPaths = document.getElementById('backFromPaths');
    
    // New training elements
    // Mode pills (may not exist on some screens)
    const modeListenRepeat = document.getElementById('modeListenRepeat');
    const modeTest = document.getElementById('modeTest');
    const modeFreeTalk = document.getElementById('modeFreeTalk');

    // Sections (some may be removed/hidden depending on layout)
    const audioControls = document.getElementById('audioControls');
    const visualCardsGrid = document.getElementById('visualCardsGrid');
    const trainingSteps = document.getElementById('trainingSteps');
    
    // Conversation elements (Card-Based UI)
    const conversationInterface = document.getElementById('conversationInterface');
    const mainActionButton = document.getElementById('mainActionButton');
    const actionIcon = document.getElementById('actionIcon');
    const actionText = document.getElementById('actionText');
    const liveStatus = document.getElementById('liveStatus');
    const statusText = document.getElementById('statusText');
    const currentCard = document.getElementById('currentCard');
    const cardSpeaker = document.getElementById('cardSpeaker');
    const cardContent = document.getElementById('cardContent');
    const exchangesList = document.getElementById('exchangesList');
    const conversationTopic = document.getElementById('conversationTopic');
    const progressContainer = document.getElementById('progressContainer');
    const micZone = document.getElementById('micZone');
    const phraseCard = document.getElementById('phraseCard');
    
    // Back buttons
    const backFromConversation = document.getElementById('backFromConversation');
    const backFromPerformance = document.getElementById('backFromPerformance');
    const backFromResources = document.getElementById('backFromResources');
    const backFromScenarios = document.getElementById('backFromScenarios');
    const backFromVisual = document.getElementById('backFromVisual');
    const backFromTeam = document.getElementById('backFromTeam');
    const closeConversation = document.getElementById('closeConversation');
    const closeTips = document.getElementById('closeTips');
    
    let isRecording = false;
    let currentScreen = 'training';
    let sessionStartTime = Date.now();
    let timerInterval = null;
    let currentPhraseIndex = 0; // navigation index within current topic
    let isBookmarked = false;
    let currentTopic = 'basic-phrases';
    let assignedTopics = [];
    let currentMode = 'listen-repeat';
    let currentStep = 1;
    let isPlayingAudio = false;
    let phrasesData = []; // ordered phrases of current topic
    let completedSet = new Set(); // keys of completed phrases (topic:index)
    let bestScores = {}; // map key => best score
    let conversationHistory = []; // audio conversation history
    let conversationRunning = false; // Is conversation loop active
    let currentConversationState = 'idle'; // idle, listening, bot-speaking
    
    // ==================== NAVIGATION ====================
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const screen = this.getAttribute('data-screen');
            navigateToScreen(screen);
        });
    });
    
    function navigateToScreen(screen) {
        console.log('Navigating to screen:', screen);
        
        // Remove active from all nav items
        navItems.forEach(item => item.classList.remove('active'));
        
        // Hide all screens
        hideAllScreens();
        
        currentScreen = screen;
        
        // Add active to current nav item
        const navItem = document.querySelector(`[data-screen="${screen}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        switch(screen) {
            case 'training':
                if (trainingMain) {
                    trainingMain.style.display = 'flex';
                }
                break;
                
            case 'conversation':
                if (conversationScreen) conversationScreen.classList.add('active');
                break;
                
            case 'tips':
                if (tipsSheet) tipsSheet.classList.add('active');
                break;
                
            case 'performance':
                if (performanceScreen) performanceScreen.classList.add('active');
                break;
                
            case 'resources':
                if (resourcesScreen) resourcesScreen.classList.add('active');
                break;
                
            case 'scenarios':
                if (scenariosScreen) scenariosScreen.classList.add('active');
                break;
                
            case 'visual':
                if (visualScreen) visualScreen.classList.add('active');
                break;
                
            case 'team':
                if (teamScreen) teamScreen.classList.add('active');
                break;
                
            case 'culture':
                if (cultureScreen) cultureScreen.classList.add('active');
                break;
                
            case 'paths':
                if (pathsScreen) pathsScreen.classList.add('active');
                break;
                
            default:
                // Default to training screen
                if (trainingMain) {
                    trainingMain.style.display = 'flex';
                }
                const trainingNav = document.querySelector('[data-screen="training"]');
                if (trainingNav) trainingNav.classList.add('active');
        }
        
        console.log('Navigation complete');
    }
    
    function hideAllScreens() {
        if (trainingMain) trainingMain.style.display = 'none';
        if (conversationScreen) conversationScreen.classList.remove('active');
        if (tipsSheet) tipsSheet.classList.remove('active');
        if (performanceScreen) performanceScreen.classList.remove('active');
        if (resourcesScreen) resourcesScreen.classList.remove('active');
        if (emergencyScreen) emergencyScreen.classList.remove('active');
        if (scenariosScreen) scenariosScreen.classList.remove('active');
        if (visualScreen) visualScreen.classList.remove('active');
        if (teamScreen) teamScreen.classList.remove('active');
        if (cultureScreen) cultureScreen.classList.remove('active');
        if (pathsScreen) pathsScreen.classList.remove('active');
    }
    
    // ==================== BACK BUTTONS ====================
    if (backFromConversation) backFromConversation.addEventListener('click', backToTraining);
    if (closeConversation) closeConversation.addEventListener('click', backToTraining);
    if (backFromPerformance) backFromPerformance.addEventListener('click', backToTraining);
    if (backFromResources) backFromResources.addEventListener('click', backToTraining);
    if (backFromScenarios) backFromScenarios.addEventListener('click', backToTraining);
    if (backFromVisual) backFromVisual.addEventListener('click', backToTraining);
    if (backFromTeam) backFromTeam.addEventListener('click', backToTraining);
    if (backFromCulture) backFromCulture.addEventListener('click', backToTraining);
    if (backFromPaths) backFromPaths.addEventListener('click', backToTraining);
    if (closeTips) closeTips.addEventListener('click', backToTraining);
    
    function backToTraining() {
        navigateToScreen('training');
    }
    
    // ==================== MIC BUTTON ====================
    if (micButton) {
        micButton.addEventListener('click', function() {
            if (!isRecording) {
                startRecording();
            } else {
            }
        });
    }
    
    function startRecording() {
        isRecording = true;
        if (micButton) {
            micButton.classList.add('is-recording', 'recording');
            const micIcon = micButton.querySelector('i');
            if (micIcon) {
                micIcon.classList.remove('fa-microphone');
                micIcon.classList.add('fa-stop');
            }
        }
        
        // Show recording indicator with sound wave
        const recordingIndicator = document.getElementById('recordingIndicator');
        const micHint = document.getElementById('micHint');
        if (recordingIndicator) {
            recordingIndicator.style.display = 'flex';
        }
        if (micHint) {
            micHint.style.display = 'none';
        }
        
        showNotification('🎤 Recording... Speak now!');
        showLiveFeedback('🎤 Recording', 'Speak clearly now...', 'warning');
        
        // Hide waveform during recording
        if (waveformBox) {
            waveformBox.style.display = 'none';
        }
        
        // Update step 2 to completed
        setTimeout(() => {
            updateTrainingStep(2, 'completed');
            animateConnector('connector2');
        }, 1500);
        
        // Simulate recording duration
        setTimeout(() => {
            stopRecording();
        }, 3000);
    }
    
    function stopRecording() {
        isRecording = false;
        if (micButton) {
            micButton.classList.remove('is-recording', 'recording');
            const micIcon = micButton.querySelector('i');
            if (micIcon) {
                micIcon.classList.remove('fa-stop');
                micIcon.classList.add('fa-microphone');
            }
        }
        
        // Hide recording indicator
        const recordingIndicator = document.getElementById('recordingIndicator');
        const micHint = document.getElementById('micHint');
        if (recordingIndicator) {
            recordingIndicator.style.display = 'none';
        }
        if (micHint) {
            micHint.style.display = 'block';
        }
        
        showNotification('✅ Processing your pronunciation...');
        
        // Update step 3 to current
        updateTrainingStep(3, 'current');
        
        // Simulate processing and show score
        setTimeout(() => {
            showPronunciationScore();
        }, 1000);
    }
    
    function showPronunciationScore() {
        // Generate random score
        const score = Math.floor(Math.random() * 30) + 70; // 70-100
        
        // Complete step 3
        updateTrainingStep(3, 'completed');
        
        if (pronScore) {
            pronScore.style.display = 'flex';
            const scoreValueEl = document.getElementById('scoreValue');
            const feedbackText = document.getElementById('scoreFeedback');
            const bestBadge = document.getElementById('bestScoreBadge');
            const bestValueEl = document.getElementById('bestScoreValue');
            const phraseKey = `${currentTopic}:${currentPhraseIndex}`;
            const previousBest = bestScores[phraseKey] || 0;
            // Show previous best if user has completed before
            if (bestBadge && bestValueEl) {
                if (previousBest > 0) {
                    bestBadge.style.display = 'inline-flex';
                    bestValueEl.textContent = previousBest;
                } else {
                    bestBadge.style.display = 'none';
                }
            }
            
            // Animate score counting up
            if (scoreValueEl) {
                let currentScore = 0;
                const interval = setInterval(() => {
                    currentScore += 3;
                    if (currentScore >= score) {
                        currentScore = score;
                        clearInterval(interval);
                    }
                    scoreValueEl.textContent = currentScore;
                }, 30);
            }
            
            // Set feedback based on score
            if (feedbackText) {
                if (score >= 90) {
                    feedbackText.textContent = 'Perfect! 🎉';
                    showLiveFeedback('🎉 Excellent!', `${score}% - Perfect pronunciation!`, 'success');
                } else if (score >= 75) {
                    feedbackText.textContent = 'Great job! 😊';
                    showLiveFeedback('😊 Great Job!', `${score}% - Well done!`, 'success');
                } else {
                    feedbackText.textContent = 'Good effort! Keep practicing 💪';
                    showLiveFeedback('💪 Keep Going!', `${score}% - Try again for better score`, 'warning');
                }
            }
            
            // Show waveform comparison
            if (waveformBox) {
                setTimeout(() => {
                    waveformBox.style.display = 'flex';
                }, 500);
            }
            
            // Show success notification
            setTimeout(() => {
                showNotification(`🎯 Score: ${score}% - ${score >= 90 ? 'Excellent!' : score >= 75 ? 'Well done!' : 'Keep going!'}`);
            }, 800);
            
            // Reset for next phrase after delay
            setTimeout(() => {
                resetTrainingSteps();
                if (pronScore) {
                    pronScore.style.display = 'none';
                }
                if (waveformBox) {
                    waveformBox.style.display = 'none';
                }
            }, 6000);
        }
        
        // Update best score and completion tracking
        const phraseKey = `${currentTopic}:${currentPhraseIndex}`;
        const prevBest = bestScores[phraseKey] || 0;
        bestScores[phraseKey] = Math.max(prevBest, score);
        if (!completedSet.has(phraseKey)) {
            completedSet.add(phraseKey);
            // Update progress bar on first completion of this phrase
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                let currentWidth = parseInt(progressFill.style.width) || 0;
                let increment = Math.ceil(100 / Math.max(phrasesData.length || 20, 1));
                let newWidth = Math.min(currentWidth + increment, 100);
                progressFill.style.width = newWidth + '%';
                const progressText = document.querySelector('.progress-text');
                if (progressText) progressText.textContent = newWidth + '% Complete';
            }
        }
        // Update phrases completed count display
        const phrasesCount = document.querySelector('.phrases-count');
        if (phrasesCount) {
            const total = phrasesData.length || 20;
            phrasesCount.textContent = `${Math.min(completedSet.size, total)}/${total} phrases`;
        }
        // Update goal ring based on unique completions
        updateGoalProgress();
    }
    
    function resetTrainingSteps() {
        // Reset all steps to initial state
        updateTrainingStep(1, '');
        updateTrainingStep(2, '');
        updateTrainingStep(3, '');
        
        // Reset connectors
        const connector1 = document.getElementById('connector1');
        const connector2 = document.getElementById('connector2');
        if (connector1) {
            const progress1 = connector1.querySelector('.connector-progress');
            if (progress1) progress1.style.width = '0%';
        }
        if (connector2) {
            const progress2 = connector2.querySelector('.connector-progress');
            if (progress2) progress2.style.width = '0%';
        }
    }
    
    // ==================== SESSION TIMER ====================
    function startSessionTimer() {
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            const timerText = document.getElementById('timerText');
            if (timerText) {
                timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    // ==================== GOAL PROGRESS ====================
    function updateGoalProgress() {
        const goalProgress = document.querySelector('.goal-progress');
        const goalText = document.querySelector('.goal-text');
        
        if (goalProgress && goalText) {
            const current = Math.min(completedSet.size, 5);
            const percentage = (current / 5) * 100;
            const circumference = 87.96;
            const offset = circumference - (percentage / 100) * circumference;
            
            goalProgress.style.strokeDashoffset = offset;
            goalText.textContent = `${current}/5`;
            
            // Celebrate when goal reached
            if (current === 5) {
                showNotification('🎉 Daily goal completed!');
            }
        }
    }
    
    // ==================== AUDIO PLAYBACK ====================
    let audioPlaying = false;
    let audioProgress = 0;
    let audioProgressInterval = null;
    let audioCurrentTime = 0;
    let audioDuration = 5; // 5 seconds simulated duration
    let playbackSpeed = 1;
    
    if (playAudioBtn) {
        playAudioBtn.addEventListener('click', function() {
            this.classList.add('active');
            
            // Simulate audio playing
            showNotification('🔊 Playing audio...');
            playAudioWithFeedback();
            
            // Reset after 2 seconds
            setTimeout(() => {
                this.classList.remove('active');
            }, 2000);
        });
    }
    
    // ==================== NEW UI COMPONENTS ====================
    
    // Live Feedback Function
    function showLiveFeedback(title, message, type = 'success') {
        const liveFeedback = document.getElementById('liveFeedback');
        const feedbackTitle = document.getElementById('feedbackTitle');
        const feedbackMessage = document.getElementById('feedbackMessage');
        const feedbackIcon = liveFeedback.querySelector('.feedback-icon i');
        
        if (!liveFeedback) return;
        
        // Set content
        if (feedbackTitle) feedbackTitle.textContent = title;
        if (feedbackMessage) feedbackMessage.textContent = message;
        
        // Set icon based on type
        if (feedbackIcon) {
            feedbackIcon.className = type === 'success' ? 'fas fa-check-circle' : 
                                     type === 'error' ? 'fas fa-exclamation-circle' : 
                                     type === 'warning' ? 'fas fa-info-circle' : 
                                     'fas fa-check-circle';
        }
        
        // Set style class
        liveFeedback.className = 'live-feedback ' + type;
        liveFeedback.style.display = 'flex';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            liveFeedback.style.display = 'none';
        }, 3000);
    }
    
    // Fixed Audio Player Controls
    const playerPlayBtn = document.getElementById('playerPlayBtn');
    const playerRepeatBtn = document.getElementById('playerRepeatBtn');
    const audioSeekBar = document.getElementById('audioSeekBar');
    const audioProgressFill = document.getElementById('audioProgressFill');
    const audioCurrentTimeEl = document.getElementById('audioCurrentTime');
    const audioDurationEl = document.getElementById('audioDuration');
    
    function playAudioWithFeedback() {
        if (audioPlaying) return;
        
        audioPlaying = true;
        audioCurrentTime = 0;
        
        // Update play button
        if (playerPlayBtn) {
            playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        // Animate phrase card
        const phraseCard = document.getElementById('phraseCard');
        if (phraseCard) {
            phraseCard.classList.add('playing');
        }
        
        // Start progress animation
        audioProgressInterval = setInterval(() => {
            audioCurrentTime += 0.1 * playbackSpeed;
            
            if (audioCurrentTime >= audioDuration) {
                stopAudio();
                return;
            }
            
            updateAudioProgress();
        }, 100);
        
        // Stop after duration
        setTimeout(() => {
            stopAudio();
        }, (audioDuration / playbackSpeed) * 1000);
    }
    
    function pauseAudio() {
        if (!audioPlaying) return;
        
        audioPlaying = false;
        if (audioProgressInterval) {
            clearInterval(audioProgressInterval);
        }
        
        // Update buttons
        if (playerPlayBtn) {
            playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // Remove playing effect
        const phraseCard = document.getElementById('phraseCard');
        if (phraseCard) {
            phraseCard.classList.remove('playing');
        }
    }
    
    function stopAudio() {
        audioPlaying = false;
        audioCurrentTime = 0;
        
        if (audioProgressInterval) {
            clearInterval(audioProgressInterval);
        }
        
        // Reset UI
        if (playerPlayBtn) {
            playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        updateAudioProgress();
        
        const phraseCard = document.getElementById('phraseCard');
        if (phraseCard) {
            phraseCard.classList.remove('playing');
        }
    }
    
    function repeatAudio() {
        stopAudio();
        setTimeout(() => playAudioWithFeedback(), 200);
    }
    
    function updateAudioProgress() {
        const progress = (audioCurrentTime / audioDuration) * 100;
        
        if (audioProgressFill) {
            audioProgressFill.style.width = progress + '%';
        }
        if (audioSeekBar) {
            audioSeekBar.value = progress;
        }
        if (audioCurrentTimeEl) {
            const mins = Math.floor(audioCurrentTime / 60);
            const secs = Math.floor(audioCurrentTime % 60);
            audioCurrentTimeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        if (audioDurationEl) {
            const mins = Math.floor(audioDuration / 60);
            const secs = Math.floor(audioDuration % 60);
            audioDurationEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    // Player Play Button
    if (playerPlayBtn) {
        playerPlayBtn.addEventListener('click', function() {
            if (audioPlaying) {
                pauseAudio();
            } else {
                playAudioWithFeedback();
                showLiveFeedback('▶️ Playing', 'Native speaker audio', 'success');
            }
        });
    }
    
    // Seek Bar
    if (audioSeekBar) {
        audioSeekBar.addEventListener('input', function() {
            const seekPercent = this.value;
            audioCurrentTime = (seekPercent / 100) * audioDuration;
            updateAudioProgress();
        });
    }
    
    // Repeat Button
    if (playerRepeatBtn) {
        playerRepeatBtn.addEventListener('click', function() {
            repeatAudio();
            showLiveFeedback('🔁 Repeating', 'Playing audio again', 'success');
        });
    }
    
    // Initialize audio display
    updateAudioProgress();
    
    // ==================== BOOKMARK ====================
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            isBookmarked = !isBookmarked;
            
            if (isBookmarked) {
                this.classList.add('active');
                this.innerHTML = '<i class="fas fa-bookmark"></i>';
                showNotification('📌 Phrase bookmarked!');
            } else {
                this.classList.remove('active');
                this.innerHTML = '<i class="far fa-bookmark"></i>';
                showNotification('Bookmark removed');
            }
        });
    }
    
    // ==================== CHANGE VOICE ====================
    if (changeVoiceBtn) {
        const accents = ['Tokyo Accent', 'Kansai Accent', 'Kyushu Accent', 'Neutral'];
        let currentAccentIndex = 0;
        
        changeVoiceBtn.addEventListener('click', function() {
            currentAccentIndex = (currentAccentIndex + 1) % accents.length;
            const voiceIndicator = document.querySelector('.voice-indicator strong');
            
            if (voiceIndicator) {
                voiceIndicator.textContent = accents[currentAccentIndex];
            }
            
            showNotification(`Voice changed to ${accents[currentAccentIndex]}`);
        });
    }
    
    // ==================== SKIP / PREV / NEXT PHRASE ====================
    function showPhrase(index) {
        if (!phrasesData || phrasesData.length === 0) return;
        const i = Math.min(Math.max(index, 0), phrasesData.length - 1);
        currentPhraseIndex = i;
        const p = phrasesData[i];
        document.querySelector('.phrase-japanese').textContent = p.japanese;
        document.querySelector('.phrase-romaji').textContent = p.romaji;
        document.querySelector('.phrase-english').textContent = `"${p.english}"`;
        const contextElement = document.querySelector('.phrase-context');
        if (contextElement) contextElement.innerHTML = `<i class="fas fa-info-circle"></i> ${p.context}`;
        // Update next preview label
        const nextPreview = document.querySelector('.next-phrase');
        if (nextPreview) {
            const next = phrasesData[i + 1];
            nextPreview.textContent = next ? next.japanese : '—';
        }
        
        // Update speak prompt card if in test mode
        if (currentMode === 'test') {
            addSpeakPromptCard();
        }
    }

    function goNextPhrase() {
        if (!phrasesData.length) return;
        const nextIndex = Math.min(currentPhraseIndex + 1, phrasesData.length - 1);
        if (nextIndex === currentPhraseIndex) {
            showNotification('✅ Last phrase in this topic');
        }
        showPhrase(nextIndex);
    }

    function goPrevPhrase() {
        if (!phrasesData.length) return;
        const prevIndex = Math.max(currentPhraseIndex - 1, 0);
        if (prevIndex === currentPhraseIndex) {
            showNotification('⛔ Already at first phrase');
        }
        showPhrase(prevIndex);
    }

    if (skipPhraseBtn) {
        skipPhraseBtn.addEventListener('click', function() {
            goNextPhrase();
        });
    }
    if (nextPhraseBtn) {
        nextPhraseBtn.addEventListener('click', function() {
            goNextPhrase();
        });
    }
    if (prevPhraseBtn) {
        prevPhraseBtn.addEventListener('click', function() {
            goPrevPhrase();
        });
    }
    
    // ==================== EMERGENCY SOS ====================
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function() {
            emergencyScreen.classList.add('active');
            showNotification('🚨 Emergency phrases ready!');
        });
    }
    
    if (closeEmergency) {
        closeEmergency.addEventListener('click', function() {
            emergencyScreen.classList.remove('active');
        });
    }
    
    // Emergency phrase cards
    const emergencyCards = document.querySelectorAll('.emergency-card');
    emergencyCards.forEach(card => {
        card.addEventListener('click', function() {
            const phrase = this.getAttribute('data-phrase');
            const jp = this.querySelector('.emergency-jp').textContent;
            const rom = this.querySelector('.emergency-rom').textContent;
            
            // Simulate audio playback
            showNotification(`🔊 ${rom}`);
            
            // Visual feedback
            this.style.background = 'rgba(231, 76, 60, 0.2)';
            setTimeout(() => {
                this.style.background = '';
            }, 500);
        });
    });
    
    // ==================== WORKPLACE SCENARIOS ====================
    const scenarioCards = document.querySelectorAll('.scenario-card .btn-start');
    scenarioCards.forEach(btn => {
        btn.addEventListener('click', function() {
            const scenarioName = this.closest('.scenario-card').querySelector('h3').textContent;
            showNotification(`🏗️ Starting: ${scenarioName}`);
            
            // Close scenarios and go back to training with scenario context
            setTimeout(() => {
                navigateToScreen('training');
            }, 1000);
        });
    });
    
    // ==================== VISUAL LEARNING ====================
    const visualCards = document.querySelectorAll('.visual-card');
    visualCards.forEach(card => {
        card.addEventListener('click', function() {
            const japanese = this.querySelector('.visual-label').textContent;
            const romaji = this.querySelector('.visual-romaji').textContent;
            const english = this.querySelector('.visual-english').textContent;
            
            // Load into training screen
            document.querySelector('.phrase-japanese').textContent = japanese;
            document.querySelector('.phrase-romaji').textContent = romaji;
            document.querySelector('.phrase-english').textContent = `"${english}"`;
            
            showNotification(`📸 Loaded: ${english}`);
            
            // Go back to training
            setTimeout(() => {
                navigateToScreen('training');
            }, 500);
        });
    });
    
    // ==================== TEAM LEADERBOARD ====================
    const leaderboardTabs = document.querySelectorAll('.tab-btn');
    leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            leaderboardTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.textContent;
            showNotification(`Showing ${period} stats`);
        });
    });
    
    // ==================== TOPIC SELECTION ====================
    if (topicSelectorBtn) {
        topicSelectorBtn.addEventListener('click', function() {
            topicSheet.classList.add('active');
        });
    }
    
    if (closeTopicSheet) {
        closeTopicSheet.addEventListener('click', function() {
            topicSheet.classList.remove('active');
        });
    }
    
    // Topic filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterTopics(filter);
        });
    });
    
    function filterTopics(filter) {
        const topicItems = document.querySelectorAll('.topic-item');
        
        topicItems.forEach(item => {
            const status = item.querySelector('.topic-status').textContent.toLowerCase();
            const progressText = item.querySelector('.topic-progress').textContent;
            const isCompleted = progressText === '100% complete';
            const isAssigned = status === 'assigned';
            
            let show = true;
            
            if (filter === 'assigned' && !isAssigned) {
                show = false;
            } else if (filter === 'completed' && !isCompleted) {
                show = false;
            }
            
            item.style.display = show ? 'flex' : 'none';
        });
        
        // Hide empty categories
        const categories = document.querySelectorAll('.topic-category-group');
        categories.forEach(cat => {
            const visibleItems = Array.from(cat.querySelectorAll('.topic-item'))
                .filter(item => item.style.display !== 'none');
            cat.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    }
    
    // Topic selection
    const topicItems = document.querySelectorAll('.topic-item');
    topicItems.forEach(item => {
        item.addEventListener('click', function() {
            const isLocked = this.classList.contains('locked');
            if (isLocked) {
                showNotification('🔒 Complete previous topics to unlock this one');
                return;
            }
            
            const topicId = this.getAttribute('data-topic');
            const topicName = this.querySelector('h5').textContent;
            const category = this.getAttribute('data-category');
            
            // Update active state
            topicItems.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Load topic
            loadTopic(topicId, topicName, category);
            
            // Close sheet
            topicSheet.classList.remove('active');
            
            showNotification(`📚 Loaded: ${topicName}`);
        });
    });
    
    function loadTopic(topicId, topicName, category) {
        currentTopic = topicId;
        
        // Update UI
        if (currentTopicName) currentTopicName.textContent = topicName;
        if (categoryBadge) categoryBadge.textContent = category;
        
        // Load phrases for this topic
        loadPhrasesForTopic(topicId);
        
        // Reset progress for new topic
        currentPhraseIndex = 0;
        completedSet.clear();
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            // Get progress from topic item
            const topicItem = document.querySelector(`[data-topic="${topicId}"]`);
            if (topicItem) {
                const progressText = topicItem.querySelector('.topic-progress').textContent;
                const progress = parseInt(progressText);
                progressFill.style.width = progress + '%';
            }
        }
        
        // Update goal progress
        updateGoalProgress();
    }
    
    function loadPhrasesForTopic(topicId) {
        // This would fetch from backend in production
        // For now, load demo phrases based on topic
        const phrasesDatabase = {
            'basic-phrases': [
                {
                    japanese: '日本語を練習するのが楽しいです',
                    romaji: 'Nihongo wo renshuu suru no ga tanoshii desu',
                    english: 'I enjoy practicing Japanese',
                    context: 'Use when expressing enjoyment in learning'
                },
                {
                    japanese: 'おはようございます',
                    romaji: 'Ohayou gozaimasu',
                    english: 'Good morning',
                    context: 'Formal morning greeting for coworkers'
                }
            ],
            'safety-procedures': [
                {
                    japanese: 'ヘルメットをかぶってください',
                    romaji: 'Herumetto wo kabutte kudasai',
                    english: 'Please wear your helmet',
                    context: 'Safety reminder at construction site'
                },
                {
                    japanese: '危険ですから、近づかないでください',
                    romaji: 'Kiken desu kara, chikazukanaide kudasai',
                    english: 'It\'s dangerous, please don\'t get close',
                    context: 'Warning about hazardous area'
                }
            ],
            'emergency-phrases': [
                {
                    japanese: '助けてください',
                    romaji: 'Tasukete kudasai',
                    english: 'Please help me',
                    context: 'Call for help in emergency'
                },
                {
                    japanese: '救急車を呼んでください',
                    romaji: 'Kyuukyuusha wo yonde kudasai',
                    english: 'Please call an ambulance',
                    context: 'Medical emergency'
                }
            ],
            'factory-floor': [
                {
                    japanese: '機械を止めてください',
                    romaji: 'Kikai wo tomete kudasai',
                    english: 'Please stop the machine',
                    context: 'Emergency stop command'
                },
                {
                    japanese: '品質チェックをお願いします',
                    romaji: 'Hinshitsu chekku wo onegai shimasu',
                    english: 'Please do a quality check',
                    context: 'Requesting quality inspection'
                }
            ]
        };
        phrasesData = phrasesDatabase[topicId] || phrasesDatabase['basic-phrases'];
        showPhrase(0);
    }
    
    // Request new topic button
    const btnRequestTopic = document.querySelector('.btn-request-topic');
    if (btnRequestTopic) {
        btnRequestTopic.addEventListener('click', function() {
            showNotification('📨 Your request has been sent to the admin!');
            topicSheet.classList.remove('active');
        });
    }
    
    // ==================== TRAINING MODES ====================
    if (modeListenRepeat) {
        modeListenRepeat.addEventListener('click', function() {
            switchMode('listen-repeat');
        });
    }
    
    if (modeTest) {
        modeTest.addEventListener('click', function() {
            switchMode('test');
        });
    }
    
    if (modeFreeTalk) {
        modeFreeTalk.addEventListener('click', function() {
            switchMode('free-talk');
        });
    }
    
    function switchMode(mode) {
        currentMode = mode;
        
        // Update active state
        const pills = document.querySelectorAll('.mode-pill');
        if (pills && pills.length) {
            pills.forEach(pill => pill.classList.remove('active'));
        }
        
        if (mode === 'listen-repeat') {
            if (modeListenRepeat) modeListenRepeat.classList.add('active');
            if (audioControls) audioControls.style.display = 'flex';
            if (trainingSteps) trainingSteps.style.display = 'block';
            if (conversationInterface) conversationInterface.style.display = 'none';
            if (micZone) micZone.style.display = 'block';
            if (progressContainer) progressContainer.style.display = 'block';
            if (phraseCard) phraseCard.style.display = 'block';
            
            // Remove test mode class and speak prompt
            document.body.classList.remove('test-mode');
            if (micZone) {
                const existingPrompt = micZone.querySelector('.speak-prompt-card');
                if (existingPrompt) existingPrompt.remove();
            }
            
            showNotification('🎧 Listen & Repeat Mode - Follow the 3 steps');
        } else if (mode === 'test') {
            if (modeTest) modeTest.classList.add('active');
            if (audioControls) audioControls.style.display = 'none';
            if (trainingSteps) trainingSteps.style.display = 'none';
            if (conversationInterface) conversationInterface.style.display = 'none';
            if (micZone) micZone.style.display = 'block';
            if (progressContainer) progressContainer.style.display = 'block';
            
            // Hide original phrase card - speak prompt replaces it
            if (phraseCard) phraseCard.style.display = 'none';
            document.body.classList.add('test-mode');
            
            // Add speak prompt card to mic zone
            if (typeof addSpeakPromptCard === 'function') addSpeakPromptCard();
            
            showNotification('🎯 Test Mode - Speak the phrase shown');
        } else if (mode === 'free-talk') {
            if (modeFreeTalk) modeFreeTalk.classList.add('active');
            if (audioControls) audioControls.style.display = 'none';
            if (trainingSteps) trainingSteps.style.display = 'none';
            if (conversationInterface) conversationInterface.style.display = 'block';
            if (micZone) micZone.style.display = 'none';
            if (progressContainer) progressContainer.style.display = 'none';
            if (phraseCard) phraseCard.style.display = 'none';
            
            // Remove test mode class and speak prompt
            document.body.classList.remove('test-mode');
            if (micZone) {
                const existingPrompt = micZone.querySelector('.speak-prompt-card');
                if (existingPrompt) existingPrompt.remove();
            }
            
            // Update conversation topic
            if (conversationTopic) {
                const topicName = currentTopicName ? currentTopicName.textContent : 'Basic Phrases';
                conversationTopic.textContent = topicName || 'Basic Phrases';
            }
            
            // Reset conversation state
            conversationRunning = false;
            currentConversationState = 'idle';
            updateLiveStatus('ready', 'Ready');
            
            showNotification('🎤 Free Talk Mode - Press "Start Talking" to begin!');
        }
    }
    
    // ==================== LISTEN & REPEAT WORKFLOW ====================
    // Old audio controls removed - using new fixed audio player instead
    
    function animateConnector(connectorId) {
        const connector = document.getElementById(connectorId);
        if (connector) {
            const progress = connector.querySelector('.connector-progress');
            if (progress) {
                progress.style.width = '100%';
            }
        }
    }
    
    function updateTrainingStep(stepNum, status) {
        const step = document.getElementById(`step${stepNum}`);
        if (step) {
            step.className = 'step-item ' + status;
        }
    }
    
    // ==================== CULTURE DEMOS ====================
    const watchDemoButtons = document.querySelectorAll('.btn-watch-demo');
    watchDemoButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const videoType = this.getAttribute('data-video');
            showNotification(`🎥 Playing ${videoType} demonstration...`);
            
            // In production: open video player modal
            setTimeout(() => {
                showNotification('🎬 Video demo completed!');
            }, 2000);
        });
    });
    
    // ==================== LEARNING PATHS ====================
    const continuePathButtons = document.querySelectorAll('.btn-continue-path');
    continuePathButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const pathCard = this.closest('.path-card');
            const pathName = pathCard.querySelector('h3').textContent;
            
            showNotification(`🗺️ Continuing ${pathName}...`);
            
            // Go back to training with current module
            setTimeout(() => {
                navigateToScreen('training');
            }, 1000);
        });
    });
    
    // ==================== VISUAL CARDS ====================
    function loadVisualCards() {
        const visualDatabase = {
            'basic-phrases': [
                { icon: '👋', japanese: 'こんにちは', romaji: 'Konnichiwa', english: 'Hello' },
                { icon: '🙏', japanese: 'ありがとう', romaji: 'Arigatou', english: 'Thank you' },
                { icon: '🙇', japanese: 'すみません', romaji: 'Sumimasen', english: 'Excuse me' }
            ],
            'safety-procedures': [
                { icon: '⛑️', japanese: 'ヘルメット', romaji: 'Herumetto', english: 'Helmet' },
                { icon: '🧤', japanese: '手袋', romaji: 'Tebukuro', english: 'Gloves' },
                { icon: '🚧', japanese: '危険', romaji: 'Kiken', english: 'Danger' }
            ],
            'factory-floor': [
                { icon: '🔧', japanese: '工具', romaji: 'Kougu', english: 'Tool' },
                { icon: '⚙️', japanese: '機械', romaji: 'Kikai', english: 'Machine' },
                { icon: '📦', japanese: '箱', romaji: 'Hako', english: 'Box' }
            ]
        };
        
        const cards = visualDatabase[currentTopic] || visualDatabase['basic-phrases'];
        
        if (visualCardsGrid) {
            visualCardsGrid.innerHTML = cards.map(card => `
                <div class="visual-card" data-word="${card.romaji}">
                    <div class="visual-image">${card.icon}</div>
                    <div class="visual-label">${card.japanese}</div>
                    <div class="visual-romaji">${card.romaji}</div>
                    <div class="visual-english">${card.english}</div>
                </div>
            `).join('');
            
            // Add click handlers
            const visualCards = visualCardsGrid.querySelectorAll('.visual-card');
            visualCards.forEach(card => {
                card.addEventListener('click', function() {
                    const word = this.getAttribute('data-word');
                    const japanese = this.querySelector('.visual-label').textContent;
                    const english = this.querySelector('.visual-english').textContent;
                    
                    showNotification(`🔊 ${word} - ${english}`);
                    
                    // Load into training
                    document.querySelector('.phrase-japanese').textContent = japanese;
                    document.querySelector('.phrase-romaji').textContent = word;
                    document.querySelector('.phrase-english').textContent = `"${english}"`;
                });
            });
        }
    }
    
    // ==================== DYNAMIC SCENARIOS ====================
    function loadScenarios() {
        // This would fetch from backend based on assigned topics
        const scenarios = [
            {
                id: 'construction-site',
                icon: '🏗️',
                title: 'Construction Site',
                phrases: 12,
                duration: '5 min',
                description: 'Safety gear, tools, measurements',
                requiredTopic: 'safety-procedures'
            },
            {
                id: 'factory-floor',
                icon: '🏭',
                title: 'Factory Floor',
                phrases: 15,
                duration: '7 min',
                description: 'Machine operation, quality control',
                requiredTopic: 'factory-floor'
            },
            {
                id: 'break-time',
                icon: '🍱',
                title: 'Break Time',
                phrases: 10,
                duration: '4 min',
                description: 'Small talk, lunch, 休憩',
                requiredTopic: 'basic-phrases'
            },
            {
                id: 'meeting-supervisor',
                icon: '👔',
                title: 'Meeting Supervisor',
                phrases: 8,
                duration: '3 min',
                description: 'Reporting, asking permission, bowing',
                requiredTopic: 'business-norms'
            }
        ];
        
        if (scenariosList) {
            scenariosList.innerHTML = scenarios.map(scenario => `
                <div class="scenario-card">
                    <div class="scenario-header">
                        <div class="scenario-icon">${scenario.icon}</div>
                        <div class="scenario-info">
                            <h3>${scenario.title}</h3>
                            <p>${scenario.phrases} phrases • ${scenario.duration}</p>
                        </div>
                        <button class="btn-start" data-scenario="${scenario.id}">Start</button>
                    </div>
                    <div class="scenario-preview">${scenario.description}</div>
                </div>
            `).join('');
            
            // Add event listeners to scenario buttons
            const scenarioButtons = scenariosList.querySelectorAll('.btn-start');
            scenarioButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const scenarioId = this.getAttribute('data-scenario');
                    const scenarioCard = this.closest('.scenario-card');
                    const scenarioName = scenarioCard.querySelector('h3').textContent;
                    
                    showNotification(`🏗️ Starting: ${scenarioName}`);
                    
                    // Load scenario and go back to training
                    setTimeout(() => {
                        navigateToScreen('training');
                    }, 1000);
                });
            });
        }
    }
    
    // ==================== NOTIFICATION BUTTON ====================
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotification('📬 You have 2 new achievements!\n🎯 Perfect Pronunciation\n🔥 3-Day Streak');
            
            // Remove badge
            const badge = this.querySelector('.notification-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
    }
    
    // ==================== PROFILE MENU ====================
    profileBtn.addEventListener('click', function() {
        profileMenu.classList.toggle('active');
    });
    
    // Close profile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!profileBtn.contains(event.target) && !profileMenu.contains(event.target)) {
            profileMenu.classList.remove('active');
        }
    });
    
    // ==================== PRACTICE BUTTONS IN TIPS ====================
    const practiceButtons = document.querySelectorAll('.btn-practice');
    practiceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Get the phrase from the tip card
            const tipCard = this.closest('.tip-card');
            const japanese = tipCard.querySelector('.tip-japanese').textContent;
            const romaji = tipCard.querySelector('.tip-romaji').textContent;
            const english = tipCard.querySelector('.tip-english').textContent;
            
            // Update the main training phrase
            document.querySelector('.phrase-japanese').textContent = japanese;
            document.querySelector('.phrase-romaji').textContent = romaji;
            document.querySelector('.phrase-english').textContent = english;
            
            // Close tips and return to training
            navigateToScreen('training');
            
            // Show notification
            showNotification('Phrase loaded! Ready to practice.');
        });
    });
    
    // ==================== INFO BUTTONS IN TIPS ====================
    const infoButtons = document.querySelectorAll('.btn-info');
    infoButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tipCard = this.closest('.tip-card');
            const japanese = tipCard.querySelector('.tip-japanese').textContent;
            
            // Simple alert for demo (replace with modal in production)
            alert(`More info about: ${japanese}\n\nThis phrase is commonly used in everyday conversation.`);
        });
    });
    
    // ==================== TOPIC TAGS ====================
    const topicTags = document.querySelectorAll('.topic-tag');
    topicTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Toggle active state
            this.classList.toggle('active');
            
            // Visual feedback
            if (this.classList.contains('active')) {
                this.style.background = '#4a90e2';
                this.style.borderColor = '#4a90e2';
            } else {
                this.style.background = '';
                this.style.borderColor = '';
            }
            
            showNotification(`Topic: ${this.textContent}`);
        });
    });
    
    // ==================== RESOURCE BUTTONS ====================
    const resourceButtons = document.querySelectorAll('.btn-resource');
    resourceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceItem = this.closest('.resource-item');
            const resourceName = resourceItem.querySelector('.resource-name').textContent;
            
            showNotification(`Opening: ${resourceName}`);
            
            // In production, this would open the actual resource
            console.log('Opening resource:', resourceName);
        });
    });
    
    // ==================== PROFILE ACTIONS ====================
    const profileButtons = document.querySelectorAll('.profile-btn');
    profileButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action.includes('Logout')) {
                if (confirm('Are you sure you want to logout?')) {
                    window.location.href = 'index.html';
                }
            } else if (action.includes('Settings')) {
                showNotification('Settings coming soon!');
            } else if (action.includes('Achievements')) {
                showNotification('Achievements coming soon!');
            }
        });
    });
    
    // ==================== NOTIFICATION SYSTEM ====================
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: #2a2a3e;
            color: white;
            padding: 0.875rem 1.5rem;
            border-radius: 8px;
            border: 2px solid #000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            font-size: 0.9rem;
            font-weight: 600;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Add animation keyframes if not already added
        if (!document.querySelector('#notification-keyframes')) {
            const style = document.createElement('style');
            style.id = 'notification-keyframes';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove after 2.5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            notification.style.transition = 'all 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
    
    // ==================== SWIPE GESTURES (Optional Enhancement) ====================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // Add touch handlers to bottom sheet
    if (tipsSheet) {
        tipsSheet.addEventListener('touchstart', function(e) {
            touchStartY = e.changedTouches[0].screenY;
        }, false);
        
        tipsSheet.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, false);
    }
    
    function handleSwipe() {
        // Swipe down to close tips
        if (touchEndY > touchStartY + 50 && tipsSheet.classList.contains('active')) {
            navigateToScreen('training');
        }
    }
    
    // ==================== KEYBOARD SHORTCUTS ====================
    document.addEventListener('keydown', function(e) {
        // Space bar to toggle mic
        if (e.code === 'Space' && currentScreen === 'training') {
            e.preventDefault();
            micButton.click();
        }
        
        // Escape to go back
        if (e.code === 'Escape' && currentScreen !== 'training') {
            backToTraining();
        }
        
        // Number keys for navigation
        if (e.code === 'Digit1') navigateToScreen('training');
        if (e.code === 'Digit2') navigateToScreen('conversation');
        if (e.code === 'Digit3') navigateToScreen('tips');
        if (e.code === 'Digit4') navigateToScreen('performance');
        if (e.code === 'Digit5') navigateToScreen('resources');
    });
    
    // ==================== FREE TALK CARD-BASED CONVERSATION ====================
    function updateLiveStatus(state, text) {
        if (statusText) statusText.textContent = text;
        if (liveStatus) {
            liveStatus.className = 'live-status ' + state;
        }
    }
    
    function updateCurrentCard(speaker, japanese, romaji, english) {
        const speakerIcon = speaker === 'user' ? '👤' : '🤖';
        const speakerLabel = speaker === 'user' ? 'YOU' : 'SENSEI';
        
        cardSpeaker.innerHTML = `
            <span class="speaker-icon">${speakerIcon}</span>
            <span class="speaker-label">${speakerLabel}</span>
        `;
        
        cardContent.innerHTML = `
            <div class="card-japanese">${escapeHtml(japanese)}</div>
            <div class="card-romaji">${escapeHtml(romaji)}</div>
            <div class="card-english">${escapeHtml(english)}</div>
        `;
        
        currentCard.className = 'current-card ' + speaker;
    }
    
    function addToExchangesList(role, japanese, romaji, english) {
        // Remove empty state if exists
        const emptyState = exchangesList.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        const exchangeItem = document.createElement('div');
        exchangeItem.className = `exchange-item ${role}-exchange`;
        const icon = role === 'user' ? '👤' : '🤖';
        
        exchangeItem.innerHTML = `
            <span class="exchange-icon">${icon}</span>
            <div class="exchange-text">
                <span class="exchange-japanese">${escapeHtml(japanese)}</span>
                <span class="exchange-romaji">${escapeHtml(romaji)}</span>
            </div>
        `;
        
        exchangesList.appendChild(exchangeItem);
        
        // Keep only last 5 exchanges
        const items = exchangesList.querySelectorAll('.exchange-item');
        if (items.length > 5) {
            items[0].remove();
        }
        
        // Scroll to bottom
        exchangesList.scrollTop = exchangesList.scrollHeight;
        
        conversationHistory.push({ role, japanese, romaji, english });
    }
    
    function generateBotVoiceResponse(userJapanese) {
        // Generate topic-based voice responses with Japanese, romaji, and English
        const topicResponses = {
            'basic-phrases': [
                { japanese: 'いいですね！', romaji: 'Ii desu ne!', english: 'That\'s great! Now try asking "元気ですか？" (How are you?)' },
                { japanese: '素晴らしい！', romaji: 'Subarashii!', english: 'Wonderful! Try saying "よろしくお願いします" (Nice to meet you)' },
                { japanese: 'その通りです！', romaji: 'Sono toori desu!', english: 'Exactly! Practice "ありがとうございます" (Thank you very much)' },
                { japanese: '上手ですね！', romaji: 'Jouzu desu ne!', english: 'Well done! Try "すみません" (Excuse me)' }
            ],
            'safety-procedures': [
                { japanese: '安全第一！', romaji: 'Anzen daiichi!', english: 'Safety first! Now say "ヘルメットをかぶってください" (Please wear helmet)' },
                { japanese: '危ない！', romaji: 'Abunai!', english: 'Dangerous! Practice warning others about hazards' },
                { japanese: '気をつけて！', romaji: 'Ki wo tsukete!', english: 'Be careful! Important safety phrase' },
                { japanese: '正解です！', romaji: 'Seikai desu!', english: 'Correct! Always prioritize safety communication' }
            ],
            'factory-floor': [
                { japanese: 'いいね！', romaji: 'Ii ne!', english: 'Good! Try "機械を止めてください" (Please stop the machine)' },
                { japanese: 'その通り！', romaji: 'Sono toori!', english: 'That\'s right! Practice "品質チェック" (Quality check)' },
                { japanese: '完璧！', romaji: 'Kanpeki!', english: 'Perfect! Say "作業開始" (Starting work)' },
                { japanese: '頑張って！', romaji: 'Ganbatte!', english: 'Keep it up! Try reporting: "報告します"' }
            ]
        };
        
        const responses = topicResponses[currentTopic] || topicResponses['basic-phrases'];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    function startConversation() {
        conversationRunning = true;
        actionIcon.className = 'fas fa-stop';
        actionText.textContent = 'Stop Talking';
        mainActionButton.classList.add('active');
        updateLiveStatus('active', 'Active');
        
        showNotification('🎤 Conversation started - speak naturally!');
        
        // Start with bot greeting if first time
        if (conversationHistory.length === 0) {
            setTimeout(() => {
                playBotVoiceResponse('こんにちは！', 'Konnichiwa!', 'Welcome! Let\'s practice Japanese conversation together.');
            }, 800);
        } else {
            // Continue conversation - start listening
            startListening();
        }
    }
    
    function stopConversation() {
        conversationRunning = false;
        currentConversationState = 'idle';
        actionIcon.className = 'fas fa-play';
        actionText.textContent = 'Start Talking';
        mainActionButton.classList.remove('active');
        updateLiveStatus('paused', 'Paused');
        
        showNotification('⏸️ Conversation paused');
    }
    
    function startListening() {
        if (!conversationRunning) return;
        
        currentConversationState = 'listening';
        updateLiveStatus('listening', 'Listening...');
        
        // Show listening state in card
        cardSpeaker.innerHTML = `
            <span class="speaker-icon">🎤</span>
            <span class="speaker-label">LISTENING...</span>
        `;
        cardContent.innerHTML = `
            <div class="listening-animation">
                <div class="sound-wave">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
                <p>Speak naturally in Japanese</p>
            </div>
        `;
        currentCard.className = 'current-card listening';
        
        // Simulate voice activity detection (2-5 seconds)
        const listenDuration = 2000 + Math.random() * 3000;
        
        setTimeout(() => {
            if (conversationRunning) {
                processUserSpeech();
            }
        }, listenDuration);
    }
    
    function processUserSpeech() {
        if (!conversationRunning) return;
        
        updateLiveStatus('processing', 'Processing...');
        
        // Simulate transcription
        const userPhrases = [
            { japanese: 'おはようございます', romaji: 'Ohayou gozaimasu', english: 'Good morning' },
            { japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu', english: 'Thank you very much' },
            { japanese: 'お願いします', romaji: 'Onegai shimasu', english: 'Please' },
            { japanese: '元気です', romaji: 'Genki desu', english: 'I\'m fine' },
            { japanese: 'わかりました', romaji: 'Wakarimashita', english: 'I understand' },
            { japanese: 'すみません', romaji: 'Sumimasen', english: 'Excuse me' }
        ];
        
        const userPhrase = userPhrases[Math.floor(Math.random() * userPhrases.length)];
        
        // Show user transcription in current card
        updateCurrentCard('user', userPhrase.japanese, userPhrase.romaji, userPhrase.english);
        
        // Add to exchanges list
        addToExchangesList('user', userPhrase.japanese, userPhrase.romaji, userPhrase.english);
        
        // Bot response after brief delay
        setTimeout(() => {
            if (conversationRunning) {
                const botResponse = generateBotVoiceResponse(userPhrase.japanese);
                playBotVoiceResponse(botResponse.japanese, botResponse.romaji, botResponse.english);
            }
        }, 800);
    }
    
    function playBotVoiceResponse(japanese, romaji, english) {
        if (!conversationRunning) return;
        
        currentConversationState = 'bot-speaking';
        updateLiveStatus('speaking', 'Sensei Speaking');
        
        // Show bot transcription in current card
        updateCurrentCard('bot', japanese, romaji, english);
        
        // Simulate bot speaking (2-4 seconds)
        const speakDuration = 2000 + Math.random() * 2000;
        
        setTimeout(() => {
            if (!conversationRunning) return;
            
            // Add to exchanges list
            addToExchangesList('bot', japanese, romaji, english);
            
            // Automatically start listening again (continuous loop)
            setTimeout(() => {
                if (conversationRunning) {
                    startListening();
                }
            }, 500);
        }, speakDuration);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Toggle conversation on/off
    if (mainActionButton) {
        mainActionButton.addEventListener('click', function() {
            if (conversationRunning) {
                stopConversation();
            } else {
                startConversation();
            }
        });
    }
    
    // ==================== TRAINING STEPS MODAL ====================
    const trainingStepsModal = document.getElementById('trainingStepsModal');
    const closeStepsModal = document.getElementById('closeStepsModal');
    const startLearningBtn = document.getElementById('startLearningBtn');
    
    // Show modal on page load (only first time)
    const hasSeenModal = localStorage.getItem('hasSeenTrainingModal');
    if (!hasSeenModal) {
        setTimeout(() => {
            if (trainingStepsModal) {
                trainingStepsModal.classList.add('active');
            }
        }, 800);
    }
    
    // Close modal
    if (closeStepsModal) {
        closeStepsModal.addEventListener('click', function() {
            if (trainingStepsModal) {
                trainingStepsModal.classList.remove('active');
            }
        });
    }
    
    // Start Learning button
    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', function() {
            if (trainingStepsModal) {
                trainingStepsModal.classList.remove('active');
                localStorage.setItem('hasSeenTrainingModal', 'true');
                showNotification('🎯 Let\'s start learning! Play the audio to begin.');
            }
        });
    }
    
    // Close modal on overlay click
    if (trainingStepsModal) {
        trainingStepsModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                trainingStepsModal.classList.remove('active');
            }
        });
    }
    
    // ==================== INITIALIZATION ====================
    console.log('WaGo Training App - UNIQUE Features Loaded');
    console.log('Standard Features:');
    console.log('  - Session timer');
    console.log('  - Pronunciation scoring');
    console.log('  - Audio playback');
    console.log('  - Bookmarking');
    console.log('  - Voice switching');
    console.log('  - Next phrase preview');
    console.log('UNIQUE Features:');
    console.log('  💬 Free Talk - Audio conversation mode');
    console.log('  🚨 Emergency SOS button');
    console.log('  🏗️ Workplace scenarios');
    console.log('  📸 Visual learning cards');
    console.log('  👥 Team leaderboard');
    console.log('  🎵 Waveform comparison');
    console.log('Keyboard shortcuts:');
    console.log('  Space - Toggle microphone');
    console.log('  Escape - Back to training');
    console.log('  1-5 - Quick navigation');
    
    // Start session timer
    startSessionTimer();
    
    // Initialize goal progress
    updateGoalProgress();
    
    // Load scenarios dynamically
    loadScenarios();
    
    // Load visual cards
    loadVisualCards();
    
    // Load initial phrases for default topic so navigation works immediately
    loadPhrasesForTopic(currentTopic);
    const phrasesCountInit = document.querySelector('.phrases-count');
    if (phrasesCountInit) {
        const total = (phrasesData && phrasesData.length) ? phrasesData.length : 20;
        phrasesCountInit.textContent = `0/${total} phrases`;
    }
    
    // Show welcome notification (only if modal not shown)
    if (hasSeenModal) {
        setTimeout(() => {
            showNotification('🎯 Welcome back to WaGo!');
        }, 500);
    }
    
    // Intro tour for unique features
    setTimeout(() => {
        showNotification('💡 Tip: Try "Culture" tab to learn Japanese workplace etiquette!');
    }, 6000);
    
    // ==================== SPEAK PROMPT CARD ====================
    function addSpeakPromptCard() {
        // Remove existing speak prompt if any
        const existingPrompt = micZone.querySelector('.speak-prompt-card');
        if (existingPrompt) {
            existingPrompt.remove();
        }
        
        // Get current phrase data
        const currentPhrase = phrasesData[currentPhraseIndex] || {
            japanese: '日本語を練習するのが楽しいです',
            romaji: 'Nihongo wo renshuu suru no ga tanoshii desu'
        };
        
        // Create speak prompt card
        const speakPromptCard = document.createElement('div');
        speakPromptCard.className = 'speak-prompt-card';
        speakPromptCard.innerHTML = `
            <div class="speak-prompt-header">
                <i class="fas fa-volume-up"></i>
                <span>SPEAK THIS PHRASE:</span>
            </div>
            <div class="speak-prompt-divider"></div>
            <div class="speak-prompt-japanese">${escapeHtml(currentPhrase.japanese)}</div>
            <div class="speak-prompt-romaji">${escapeHtml(currentPhrase.romaji)}</div>
        `;
        
        // Insert as first child of mic zone
        micZone.insertBefore(speakPromptCard, micZone.firstChild);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
});
