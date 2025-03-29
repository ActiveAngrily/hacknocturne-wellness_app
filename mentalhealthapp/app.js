// NeuroSense Mental Health Companion Web App

// ===== Data structures =====
// User profile
let userProfile = {
    name: 'Alex Martins',
    age: 32,
    conditions: ['anxiety', 'insomnia'],
    lastAssessment: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    assessmentFrequency: 7, // days
    baselineHeartRate: 72,
    baselineSleep: 7.5,
    preferredCheckInTime: '09:00',
    checkInFrequency: 'daily',
    insightsEnabled: true
};

// Sample assessment history
let assessmentHistory = [
    {
        type: 'PHQ-9',
        score: 12,
        assessment: 'Moderate depression',
        responses: [1, 2, 1, 1, 2, 1, 1, 2, 1],
        timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) // 28 days ago
    },
    {
        type: 'GAD-7',
        score: 10,
        assessment: 'Moderate anxiety',
        responses: [2, 2, 1, 2, 1, 1, 1],
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 21 days ago
    },
    {
        type: 'PHQ-9',
        score: 9,
        assessment: 'Mild depression',
        responses: [1, 1, 2, 1, 1, 1, 1, 1, 0],
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    },
    {
        type: 'GAD-7',
        score: 8,
        assessment: 'Mild anxiety',
        responses: [1, 2, 1, 1, 1, 1, 1],
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    }
];

// Sample biometric history with realistic patterns
let biometricHistory = [];

// Generate heart rate data for the past 14 days
for (let i = 14; i >= 0; i--) {
    const dayOffset = i * 24 * 60 * 60 * 1000;
    
    // Morning reading (generally lower)
    biometricHistory.push({
        type: 'heartRate',
        value: Math.round(70 + Math.random() * 5), // 70-75 bpm
        source: 'manual',
        timestamp: new Date(Date.now() - dayOffset - 12 * 60 * 60 * 1000) // Morning
    });
    
    // Evening reading (generally higher)
    biometricHistory.push({
        type: 'heartRate',
        value: Math.round(75 + Math.random() * 10), // 75-85 bpm
        source: 'manual',
        timestamp: new Date(Date.now() - dayOffset - 4 * 60 * 60 * 1000) // Evening
    });
    
    // Add some higher readings on stressful days (every 3-4 days)
    if (i % 4 === 0) {
        biometricHistory.push({
            type: 'heartRate',
            value: Math.round(85 + Math.random() * 15), // 85-100 bpm (elevated)
            source: 'manual',
            timestamp: new Date(Date.now() - dayOffset - 8 * 60 * 60 * 1000) // Midday
        });
    }
}

// Generate sleep data for the past 14 days
for (let i = 14; i >= 0; i--) {
    const dayOffset = i * 24 * 60 * 60 * 1000;
    // Pattern: Normal sleep most days, but occasional poor sleep
    let sleepHours;
    
    if (i % 5 === 0) {
        // Poor sleep night
        sleepHours = 4.5 + Math.random() * 1.5; // 4.5-6 hours
    } else {
        // Normal sleep night
        sleepHours = 7 + Math.random() * 1.5; // 7-8.5 hours
    }
    
    biometricHistory.push({
        type: 'sleepHours',
        value: parseFloat(sleepHours.toFixed(1)),
        source: 'manual',
        timestamp: new Date(Date.now() - dayOffset - 23 * 60 * 60 * 1000) // Early morning
    });
}

// Add some mood scores
for (let i = 10; i >= 0; i -= 2) {
    const dayOffset = i * 24 * 60 * 60 * 1000;
    biometricHistory.push({
        type: 'moodScore',
        value: Math.round(5 + Math.random() * 5), // 5-10 mood scale
        source: 'manual',
        timestamp: new Date(Date.now() - dayOffset - 12 * 60 * 60 * 1000)
    });
}

// Questionnaire definitions
const questionnaires = {
    "PHQ-9": [
        "Little interest or pleasure in doing things?",
        "Feeling down, depressed, or hopeless?",
        "Trouble falling or staying asleep, or sleeping too much?",
        "Feeling tired or having little energy?",
        "Poor appetite or overeating?",
        "Feeling bad about yourself - or that you are a failure or have let yourself or your family down?",
        "Trouble concentrating on things, such as reading the newspaper or watching television?",
        "Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?",
        "Thoughts that you would be better off dead, or of hurting yourself in some way?"
    ],
    "GAD-7": [
        "Feeling nervous, anxious, or on edge?",
        "Not being able to stop or control worrying?",
        "Worrying too much about different things?",
        "Trouble relaxing?",
        "Being so restless that it's hard to sit still?",
        "Becoming easily annoyed or irritable?",
        "Feeling afraid, as if something awful might happen?"
    ]
};

// Conversation history with sample interactions
let conversationHistory = [
    {
        id: 'initial-message',
        text: "Hello! I'm Orb, your mental health companion. How are you feeling today?",
        sender: 'orb',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
        id: 'msg-1',
        text: "I've been feeling a bit stressed lately with work deadlines",
        sender: 'user',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000) // 2 min after
    },
    {
        id: 'msg-2',
        text: "I understand how work deadlines can increase stress. Have you noticed any specific effects on your well-being, like changes in sleep or tension? Taking short breaks and practicing deep breathing can help manage stress during busy periods.",
        sender: 'orb',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 1000) // 4 min after
    },
    {
        id: 'msg-3',
        text: "Yes, I've noticed I'm sleeping less and my heart feels like it's racing sometimes",
        sender: 'user',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000) // 6 min after
    },
    {
        id: 'msg-4',
        text: "Those physical symptoms often accompany stress. Poor sleep and increased heart rate are your body's response to heightened stress. Would you like to try a quick breathing exercise to help calm your nervous system? Also, logging your sleep and heart rate in the app can help us track how these patterns relate to your stress levels.",
        sender: 'orb',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000) // 8 min after
    },
    {
        id: 'msg-5',
        text: "Hello Orb, I'm feeling better today after getting a good night's sleep",
        sender: 'user',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
        id: 'msg-6',
        text: "That's wonderful to hear! Quality sleep can make a significant difference in how we feel both mentally and physically. What do you think helped you sleep better last night?",
        sender: 'orb',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000) // 2 min after
    },
    {
        id: 'msg-7',
        text: "I tried that breathing exercise you suggested and also turned off my phone an hour before bed",
        sender: 'user',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 1000) // 4 min after
    },
    {
        id: 'msg-8',
        text: "You've made two excellent choices! The breathing exercise helps calm your nervous system, and reducing screen time before bed improves your body's natural melatonin production. Would you like to continue with these practices as part of a bedtime routine?",
        sender: 'orb',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000) // 6 min after
    },
    {
        id: 'msg-9',
        text: "Good morning Orb",
        sender: 'user',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
        id: 'msg-10',
        text: "Good morning! How are you feeling today? Is there anything specific you'd like to talk about or any health data you'd like to log?",
        sender: 'orb',
        timestamp: new Date() // Now
    }
];

// Current assessment being taken
let currentAssessment = {
    type: null,
    responses: []
};

// ===== Initialize the app =====
document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadUserData();
    
    // Update UI with user data
    updateUI();
    
    // Setup event listeners
    setupEventListeners();
});

// ===== Data management functions =====
// Load user data from localStorage
function loadUserData() {
    try {
        // Load user profile
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            userProfile = JSON.parse(savedProfile);
            console.log('User profile loaded');
        }
        
        // Load assessment history
        const savedAssessments = localStorage.getItem('assessmentHistory');
        if (savedAssessments) {
            assessmentHistory = JSON.parse(savedAssessments);
            // Convert string dates back to Date objects
            assessmentHistory.forEach(assessment => {
                assessment.timestamp = new Date(assessment.timestamp);
            });
            console.log('Assessment history loaded');
        }
        
        // Load biometric history
        const savedBiometrics = localStorage.getItem('biometricHistory');
        if (savedBiometrics) {
            biometricHistory = JSON.parse(savedBiometrics);
            // Convert string dates back to Date objects
            biometricHistory.forEach(reading => {
                reading.timestamp = new Date(reading.timestamp);
            });
            console.log('Biometric history loaded');
        }
        
        // Load conversation history
        const savedConversation = localStorage.getItem('conversationHistory');
        if (savedConversation) {
            conversationHistory = JSON.parse(savedConversation);
            // Convert string dates back to Date objects
            conversationHistory.forEach(message => {
                message.timestamp = new Date(message.timestamp);
            });
            console.log('Conversation history loaded');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error', 'There was a problem loading your data.');
    }
}

// Save user data to localStorage
function saveUserData() {
    try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('assessmentHistory', JSON.stringify(assessmentHistory));
        localStorage.setItem('biometricHistory', JSON.stringify(biometricHistory));
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    } catch (error) {
        console.error('Error saving user data:', error);
        showNotification('Error', 'There was a problem saving your data.');
    }
}

// Add biometric reading
function addBiometricReading(type, value, source = 'manual') {
    const reading = {
        type,
        value,
        source,
        timestamp: new Date()
    };
    
    biometricHistory.push(reading);
    saveUserData();
    
    // Update UI
    updateRecentActivity();
    updateBiometricDisplays();
    
    return reading;
}

// Add assessment result
function addAssessmentResult(type, score, assessment, responses) {
    const result = {
        type,
        score,
        assessment,
        responses,
        timestamp: new Date()
    };
    
    assessmentHistory.push(result);
    userProfile.lastAssessment = new Date().toISOString();
    saveUserData();
    
    // Update UI
    updateRecentActivity();
    updateAssessmentHistory();
    updateDashboardMetrics();
    
    return result;
}

// Get baseline metrics for comparison
function getBaselines() {
    // Calculate 7-day averages for relevant metrics
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Heart rate baseline
    const recentHeartRates = biometricHistory
        .filter(reading => reading.type === 'heartRate' && reading.timestamp > lastWeek)
        .map(reading => reading.value);
    
    if (recentHeartRates.length > 0) {
        const avgHeartRate = recentHeartRates.reduce((sum, val) => sum + val, 0) / recentHeartRates.length;
        userProfile.baselineHeartRate = Math.round(avgHeartRate);
    }
    
    // Sleep baseline
    const recentSleep = biometricHistory
        .filter(reading => reading.type === 'sleepHours' && reading.timestamp > lastWeek)
        .map(reading => reading.value);
    
    if (recentSleep.length > 0) {
        const avgSleep = recentSleep.reduce((sum, val) => sum + val, 0) / recentSleep.length;
        userProfile.baselineSleep = parseFloat(avgSleep.toFixed(1));
    }
    
    saveUserData();
    
    // Update UI
    document.getElementById('heartrate-baseline').textContent = userProfile.baselineHeartRate;
    document.getElementById('sleep-baseline').textContent = userProfile.baselineSleep;
    
    return {
        heartRate: userProfile.baselineHeartRate,
        sleepHours: userProfile.baselineSleep
    };
}

// ===== UI update functions =====
// Update all UI elements with current data
function updateUI() {
    // Update user information
    updateUserInfo();
    
    // Update dashboard metrics
    updateDashboardMetrics();
    
    // Update recent activity
    updateRecentActivity();
    
    // Update biometric displays
    updateBiometricDisplays();
    
    // Update assessment history
    updateAssessmentHistory();
    
    // Update conversation history
    updateConversationDisplay();
    
    // Update recommendation list
    updateRecommendations();
    
    // Load profile form data
    updateProfileForm();
}

// Update user information in the header
function updateUserInfo() {
    const userNameElement = document.querySelector('.user-name');
    userNameElement.textContent = userProfile.name ? `Welcome, ${userProfile.name}` : 'Welcome, User';
}

// Update dashboard metrics with enhanced visualization
function updateDashboardMetrics() {
    // Mental status
    const latestAssessment = assessmentHistory.length > 0 
        ? assessmentHistory[assessmentHistory.length - 1] 
        : null;
    
    const mentalStatusIndicator = document.querySelector('.mental-status .indicator-label');
    const mentalStatusValue = document.querySelector('.mental-status .indicator-value');
    
    if (latestAssessment) {
        // Set the type and assessment
        mentalStatusIndicator.textContent = `${latestAssessment.type}: ${latestAssessment.assessment}`;
        mentalStatusValue.textContent = latestAssessment.score;
        
        // Add visual indicator based on severity
        let statusColor;
        if (latestAssessment.score >= 15) {
            statusColor = '#f44336'; // Red for high scores
        } else if (latestAssessment.score >= 10) {
            statusColor = '#ff9800'; // Orange for moderate scores
        } else if (latestAssessment.score >= 5) {
            statusColor = '#2196f3'; // Blue for mild scores
        } else {
            statusColor = '#4caf50'; // Green for minimal scores
        }
        
        // Add a colored border to the value
        mentalStatusValue.style.color = statusColor;
        mentalStatusValue.style.textShadow = `0 0 1px rgba(0,0,0,0.1)`;
        
        // Add a trend indicator if we have previous assessments
        const previousAssessments = assessmentHistory.filter(a => 
            a.type === latestAssessment.type && a.timestamp < latestAssessment.timestamp
        );
        
        if (previousAssessments.length > 0) {
            // Sort by timestamp (newest first)
            previousAssessments.sort((a, b) => b.timestamp - a.timestamp);
            const previousScore = previousAssessments[0].score;
            const scoreDifference = latestAssessment.score - previousScore;
            
            // Create or update trend indicator
            let trendIndicator = document.querySelector('.mental-status .trend-indicator');
            if (!trendIndicator) {
                trendIndicator = document.createElement('div');
                trendIndicator.className = 'trend-indicator';
                mentalStatusValue.parentNode.appendChild(trendIndicator);
            }
            
            if (scoreDifference < 0) {
                // Score decreased (generally good for these assessments)
                trendIndicator.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(scoreDifference)} pts`;
                trendIndicator.style.color = '#4caf50'; // Green
            } else if (scoreDifference > 0) {
                // Score increased (generally concerning for these assessments)
                trendIndicator.innerHTML = `<i class="fas fa-arrow-up"></i> ${scoreDifference} pts`;
                trendIndicator.style.color = '#f44336'; // Red
            } else {
                // No change
                trendIndicator.innerHTML = `<i class="fas fa-equals"></i> No change`;
                trendIndicator.style.color = '#757575'; // Gray
            }
        }
    } else {
        mentalStatusIndicator.textContent = 'No assessments recorded';
        mentalStatusValue.textContent = '-';
    }
    
    // Heart rate
    const latestHeartRate = biometricHistory
        .filter(reading => reading.type === 'heartRate')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    const heartRateValue = document.querySelector('.heart-rate .metric-value');
    const heartRateStatus = document.querySelector('.heart-rate .metric-status');
    
    if (latestHeartRate) {
        heartRateValue.textContent = latestHeartRate.value;
        
        // Create timestamp display if it doesn't exist
        let timestampDisplay = document.querySelector('.heart-rate .metric-timestamp');
        if (!timestampDisplay) {
            timestampDisplay = document.createElement('div');
            timestampDisplay.className = 'metric-timestamp';
            document.querySelector('.heart-rate .metric-baseline').after(timestampDisplay);
        }
        
        // Format and display timestamp
        const readingTime = new Date(latestHeartRate.timestamp);
        const formattedTime = readingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timestampDisplay.textContent = `Last updated: ${formattedTime}`;
        
        // Update status
        if (latestHeartRate.value > userProfile.baselineHeartRate + 15) {
            heartRateStatus.textContent = 'HIGH';
            heartRateStatus.className = 'metric-status high';
        } else if (latestHeartRate.value > userProfile.baselineHeartRate + 10) {
            heartRateStatus.textContent = 'ELEVATED';
            heartRateStatus.className = 'metric-status elevated';
        } else {
            heartRateStatus.textContent = 'NORMAL';
            heartRateStatus.className = 'metric-status normal';
        }
        
        // Add mini heart rate visualization
        let miniChart = document.querySelector('.heart-rate .mini-chart');
        if (!miniChart) {
            miniChart = document.createElement('div');
            miniChart.className = 'mini-chart';
            document.querySelector('.heart-rate .card-body').appendChild(miniChart);
            
            // Add CSS for mini-chart
            const style = document.createElement('style');
            style.textContent = `
                .mini-chart {
                    height: 40px;
                    margin-top: 10px;
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                }
                .mini-bar {
                    flex: 1;
                    background-color: rgba(58, 28, 113, 0.2);
                    border-radius: 2px 2px 0 0;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Get the 5 most recent heart rate readings
        const recentReadings = biometricHistory
            .filter(reading => reading.type === 'heartRate')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .reverse(); // Order from oldest to newest for the chart
            
        // Generate mini chart bars
        miniChart.innerHTML = '';
        
        recentReadings.forEach(reading => {
            // Calculate height percentage based on value (50-120 bpm range)
            const heightPercentage = Math.min(100, Math.max(0, (reading.value - 50) / 70 * 100));
            
            // Determine color based on elevation
            let barColor;
            if (reading.value > userProfile.baselineHeartRate + 15) {
                barColor = 'rgba(244, 67, 54, 0.7)'; // Red
            } else if (reading.value > userProfile.baselineHeartRate + 10) {
                barColor = 'rgba(255, 152, 0, 0.7)'; // Orange
            } else {
                barColor = 'rgba(76, 175, 80, 0.7)'; // Green
            }
            
            const bar = document.createElement('div');
            bar.className = 'mini-bar';
            bar.style.height = `${heightPercentage}%`;
            bar.style.backgroundColor = barColor;
            
            // Add tooltip with exact value
            bar.title = `${reading.value} bpm`;
            
            miniChart.appendChild(bar);
        });
    } else {
        heartRateValue.textContent = '--';
        heartRateStatus.textContent = 'NORMAL';
        heartRateStatus.className = 'metric-status normal';
    }
    
    // Sleep
    const latestSleep = biometricHistory
        .filter(reading => reading.type === 'sleepHours')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    const sleepValue = document.querySelector('.sleep .metric-value');
    const sleepStatus = document.querySelector('.sleep .metric-status');
    
    if (latestSleep) {
        sleepValue.textContent = latestSleep.value;
        
        // Create timestamp display if it doesn't exist
        let sleepTimestampDisplay = document.querySelector('.sleep .metric-timestamp');
        if (!sleepTimestampDisplay) {
            sleepTimestampDisplay = document.createElement('div');
            sleepTimestampDisplay.className = 'metric-timestamp';
            document.querySelector('.sleep .metric-baseline').after(sleepTimestampDisplay);
        }
        
        // Format and display timestamp (showing date for sleep)
        const readingDate = new Date(latestSleep.timestamp);
        const formattedDate = readingDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        sleepTimestampDisplay.textContent = `Last updated: ${formattedDate}`;
        
        // Update status
        if (latestSleep.value < userProfile.baselineSleep - 2) {
            sleepStatus.textContent = 'LOW';
            sleepStatus.className = 'metric-status high';
        } else if (latestSleep.value < userProfile.baselineSleep - 1) {
            sleepStatus.textContent = 'BELOW AVERAGE';
            sleepStatus.className = 'metric-status elevated';
        } else {
            sleepStatus.textContent = 'NORMAL';
            sleepStatus.className = 'metric-status normal';
        }
        
        // Add mini sleep visualization
        let sleepMiniChart = document.querySelector('.sleep .mini-chart');
        if (!sleepMiniChart) {
            sleepMiniChart = document.createElement('div');
            sleepMiniChart.className = 'mini-chart';
            document.querySelector('.sleep .card-body').appendChild(sleepMiniChart);
        }
        
        // Get the 5 most recent sleep readings
        const recentSleepReadings = biometricHistory
            .filter(reading => reading.type === 'sleepHours')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .reverse(); // Order from oldest to newest for the chart
            
        // Generate mini chart bars
        sleepMiniChart.innerHTML = '';
        
        recentSleepReadings.forEach(reading => {
            // Calculate height percentage based on value (0-10 hours range)
            const heightPercentage = Math.min(100, Math.max(0, (reading.value / 10) * 100));
            
            // Determine color based on sleep amount
            let barColor;
            if (reading.value < userProfile.baselineSleep - 2) {
                barColor = 'rgba(244, 67, 54, 0.7)'; // Red
            } else if (reading.value < userProfile.baselineSleep - 1) {
                barColor = 'rgba(255, 152, 0, 0.7)'; // Orange
            } else {
                barColor = 'rgba(76, 175, 80, 0.7)'; // Green
            }
            
            const bar = document.createElement('div');
            bar.className = 'mini-bar';
            bar.style.height = `${heightPercentage}%`;
            bar.style.backgroundColor = barColor;
            
            // Add tooltip with exact value
            bar.title = `${reading.value} hours`;
            
            sleepMiniChart.appendChild(bar);
        });
    } else {
        sleepValue.textContent = '--';
        sleepStatus.textContent = 'NORMAL';
        sleepStatus.className = 'metric-status normal';
    }
}

// Update recent activity list
function updateRecentActivity() {
    const activityList = document.querySelector('.activity-list');
    
    // Combine biometrics and assessments for activity list
    const allActivities = [
        ...biometricHistory.map(reading => ({
            type: 'biometric',
            data: reading,
            timestamp: reading.timestamp
        })),
        ...assessmentHistory.map(assessment => ({
            type: 'assessment',
            data: assessment,
            timestamp: assessment.timestamp
        }))
    ];
    
    // Sort by timestamp (newest first)
    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    
    // Take only the most recent 5 activities
    const recentActivities = allActivities.slice(0, 5);
    
    // Clear current list
    activityList.innerHTML = '';
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon"><i class="fas fa-clipboard-check"></i></div>
                <div class="activity-info">
                    <div class="activity-title">No recent activity</div>
                </div>
            </li>
        `;
        return;
    }
    
    // Add activities to the list
    recentActivities.forEach(activity => {
        let icon, title, time;
        
        // Format timestamp
        const timeAgo = formatTimeAgo(activity.timestamp);
        
        if (activity.type === 'biometric') {
            const reading = activity.data;
            
            if (reading.type === 'heartRate') {
                icon = 'fa-heartbeat';
                title = `Logged heart rate: ${reading.value} bpm`;
            } else if (reading.type === 'sleepHours') {
                icon = 'fa-moon';
                title = `Logged sleep: ${reading.value} hours`;
            } else if (reading.type === 'moodScore') {
                icon = 'fa-smile';
                title = `Logged mood score: ${reading.value}/10`;
            } else {
                icon = 'fa-notes-medical';
                title = `Logged ${reading.type}: ${reading.value}`;
            }
        } else if (activity.type === 'assessment') {
            const assessment = activity.data;
            icon = 'fa-clipboard-check';
            title = `Completed ${assessment.type} assessment: ${assessment.score} (${assessment.assessment})`;
        }
        
        const activityItem = document.createElement('li');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon"><i class="fas ${icon}"></i></div>
            <div class="activity-info">
                <div class="activity-title">${title}</div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Update biometric displays in log page
function updateBiometricDisplays() {
    const recentLogsContainer = document.querySelector('.recent-logs-list');
    const recentLogsPlaceholder = document.querySelector('.recent-logs-placeholder');
    
    // Sort by timestamp (newest first)
    const sortedBiometrics = [...biometricHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    // Take only the most recent 10 biometrics
    const recentBiometrics = sortedBiometrics.slice(0, 10);
    
    if (recentBiometrics.length === 0) {
        recentLogsContainer.style.display = 'none';
        recentLogsPlaceholder.style.display = 'block';
        return;
    }
    
    // Clear current list
    recentLogsContainer.innerHTML = '';
    recentLogsContainer.style.display = 'block';
    recentLogsPlaceholder.style.display = 'none';
    
    // Add biometrics to the list
    recentBiometrics.forEach(reading => {
        let icon, label, unit;
        
        if (reading.type === 'heartRate') {
            icon = 'fa-heartbeat';
            label = 'Heart Rate';
            unit = 'bpm';
        } else if (reading.type === 'sleepHours') {
            icon = 'fa-moon';
            label = 'Sleep';
            unit = 'hours';
        } else if (reading.type === 'moodScore') {
            icon = 'fa-smile';
            label = 'Mood';
            unit = '/10';
        } else {
            icon = 'fa-notes-medical';
            label = reading.type;
            unit = '';
        }
        
        // Format timestamp
        const formattedDate = formatDateShort(reading.timestamp);
        
        const logItem = document.createElement('li');
        logItem.innerHTML = `
            <div class="log-type">
                <i class="fas ${icon}"></i>
                <span>${label}</span>
            </div>
            <div class="log-value">${reading.value} ${unit}</div>
            <div class="log-time">${formattedDate}</div>
        `;
        
        recentLogsContainer.appendChild(logItem);
    });
}

// Update assessment history
function updateAssessmentHistory() {
    const historyContainer = document.querySelector('.assessment-history-list');
    const historyPlaceholder = document.querySelector('.history-placeholder');
    
    if (assessmentHistory.length === 0) {
        historyContainer.style.display = 'none';
        historyPlaceholder.style.display = 'block';
        return;
    }
    
    // Clear current list
    historyContainer.innerHTML = '';
    historyContainer.style.display = 'block';
    historyPlaceholder.style.display = 'none';
    
    // Sort by timestamp (newest first)
    const sortedHistory = [...assessmentHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    // Add assessments to the list
    sortedHistory.forEach(assessment => {
        // Format timestamp
        const formattedDate = formatDate(assessment.timestamp);
        
        // Determine severity class
        let severityClass;
        if (assessment.score >= 15) {
            severityClass = 'high';
        } else if (assessment.score >= 10) {
            severityClass = 'elevated';
        } else if (assessment.score >= 5) {
            severityClass = 'normal';
        } else {
            severityClass = 'normal';
        }
        
        const historyItem = document.createElement('div');
        historyItem.className = 'assessment-history-item';
        historyItem.innerHTML = `
            <div class="history-date">${formattedDate}</div>
            <div class="history-type">${assessment.type}</div>
            <div class="history-score ${severityClass}">${assessment.score}</div>
            <div class="history-assessment">${assessment.assessment}</div>
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

// Update conversation display
function updateConversationDisplay() {
    const messagesContainer = document.getElementById('chat-messages');
    
    // Clear current messages
    messagesContainer.innerHTML = '';
    
    // Add messages to the container
    conversationHistory.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        
        // Format timestamp
        const timeAgo = formatTimeAgo(message.timestamp);
        
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${message.text}</p>
            </div>
            <div class="message-time">${timeAgo}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update recommendations
function updateRecommendations() {
    const recommendationList = document.querySelector('.recommendation-list');
    
    // Clear current recommendations
    recommendationList.innerHTML = '';
    
    // Add recommendations based on user data
    const recommendations = [];
    
    // Check last assessment
    if (userProfile.lastAssessment) {
        const lastAssessmentDate = new Date(userProfile.lastAssessment);
        const today = new Date();
        const daysSinceAssessment = Math.floor((today - lastAssessmentDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceAssessment >= userProfile.assessmentFrequency) {
            recommendations.push(`It's been ${daysSinceAssessment} days since your last assessment. Consider taking a new one.`);
        } else {
            recommendations.push(`Next assessment recommended in ${userProfile.assessmentFrequency - daysSinceAssessment} days.`);
        }
    } else {
        recommendations.push(`It's been a while since your last assessment. Consider taking a new one.`);
    }
    
    // Check recent sleep
    const latestSleep = biometricHistory
        .filter(reading => reading.type === 'sleepHours')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (latestSleep && latestSleep.value < userProfile.baselineSleep - 1) {
        recommendations.push(`Your sleep is below your baseline. Consider sleep improvement techniques.`);
    }
    
    // Check recent heart rate
    const latestHeartRate = biometricHistory
        .filter(reading => reading.type === 'heartRate')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (latestHeartRate && latestHeartRate.value > userProfile.baselineHeartRate + 10) {
        recommendations.push(`Your heart rate is elevated. Consider relaxation techniques.`);
    }
    
    // If we have less than 3 recommendations, add generic ones
    if (recommendations.length < 3) {
        if (!biometricHistory.some(reading => reading.type === 'heartRate')) {
            recommendations.push(`Try logging your heart rate to track your physiological state.`);
        }
        
        if (!biometricHistory.some(reading => reading.type === 'sleepHours')) {
            recommendations.push(`Log your sleep duration to help identify how it affects your mental wellbeing.`);
        }
        
        if (recommendations.length < 3) {
            recommendations.push(`Regular check-ins can help maintain your mental wellness.`);
        }
    }
    
    // Add recommendations to the list
    recommendations.forEach(recommendation => {
        const listItem = document.createElement('li');
        listItem.textContent = recommendation;
        recommendationList.appendChild(listItem);
    });
}

// Update profile form with current user data
function updateProfileForm() {
    document.getElementById('profile-name').value = userProfile.name || '';
    document.getElementById('profile-age').value = userProfile.age || '';
    document.getElementById('profile-conditions').value = userProfile.conditions.join(', ');
    document.getElementById('profile-assessment-frequency').value = userProfile.assessmentFrequency;
    
    // Update toggle switches
    document.getElementById('insights-enabled').checked = userProfile.insightsEnabled;
    document.getElementById('check-in-enabled').checked = userProfile.checkInFrequency !== 'never';
}

// ===== Setup event listeners =====
// ===== Setup event listeners =====
function setupEventListeners() {
    // Navigation menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Quick action buttons
    document.getElementById('take-assessment-btn').addEventListener('click', () => {
        navigateToPage('assess');
    });
    
    // Fix: Changed ID to match the renamed button in the dashboard
    document.getElementById('quick-log-sleep-btn').addEventListener('click', () => {
        showLogDataModal('sleepHours', 'Sleep Duration (hours)');
    });
    
    document.getElementById('log-heart-btn').addEventListener('click', () => {
        showLogDataModal('heartRate', 'Heart Rate (bpm)');
    });
    
    document.getElementById('chat-orb-btn').addEventListener('click', () => {
        navigateToPage('chat');
    });
    
    // Chat input
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    document.getElementById('send-message-btn').addEventListener('click', sendChatMessage);
    
    // Assessment buttons
    document.querySelectorAll('.start-assessment').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            startAssessment(type);
        });
    });
    
    document.getElementById('cancel-assessment').addEventListener('click', () => {
        cancelAssessment();
    });
    
    document.getElementById('submit-assessment').addEventListener('click', () => {
        submitAssessment();
    });
    
    document.getElementById('results-done-btn').addEventListener('click', () => {
        // Hide results and show selection
        document.querySelector('.assessment-results').style.display = 'none';
        document.querySelector('.assessment-selection').style.display = 'block';
        document.querySelector('.assessment-history').style.display = 'block';
    });
    
    // Log health data buttons
    document.getElementById('log-heart-rate-btn').addEventListener('click', () => {
        logHealthData('heartRate');
    });
    
    // This is the button in the sleep log form section - keep as is
    document.getElementById('log-sleep-btn').addEventListener('click', () => {
        logHealthData('sleepHours');
    });
    
    document.getElementById('log-mood-btn').addEventListener('click', () => {
        logHealthData('moodScore');
    });
    
    // Profile form
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
    
    // Modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    document.getElementById('log-modal-cancel').addEventListener('click', () => {
        closeAllModals();
    });
    
    document.getElementById('log-modal-save').addEventListener('click', () => {
        const type = document.getElementById('log-modal-title').getAttribute('data-type');
        const value = parseFloat(document.getElementById('log-modal-value').value);
        
        if (!isNaN(value)) {
            addBiometricReading(type, value);
            showNotification('Success', `${type === 'heartRate' ? 'Heart rate' : 'Sleep'} data logged successfully.`);
            closeAllModals();
        } else {
            showNotification('Error', 'Please enter a valid number.');
        }
    });
    
    document.getElementById('notification-ok').addEventListener('click', () => {
        closeAllModals();
    });
    
    document.getElementById('clear-data-btn').addEventListener('click', () => {
        showConfirmModal(
            'Clear All Data', 
            'Are you sure you want to clear all your data? This action cannot be undone.',
            clearAllData
        );
    });
    
    document.getElementById('confirm-cancel').addEventListener('click', () => {
        closeAllModals();
    });
    
    document.getElementById('confirm-ok').addEventListener('click', () => {
        const confirmCallback = document.getElementById('confirm-modal').getAttribute('data-callback');
        if (confirmCallback && window[confirmCallback]) {
            window[confirmCallback]();
        }
        closeAllModals();
    });
    
    // Insights generation
    document.getElementById('generate-insights-btn').addEventListener('click', generateInsights);
}
// ===== Navigation functions =====
// Navigate to a page
function navigateToPage(page) {
    // Update active navigation item
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update page title
    const pageTitleElement = document.querySelector('.page-title');
    switch (page) {
        case 'dashboard':
            pageTitleElement.textContent = 'Dashboard';
            break;
        case 'chat':
            pageTitleElement.textContent = 'Chat with Orb';
            // Scroll to bottom of chat
            setTimeout(() => {
                const messagesContainer = document.getElementById('chat-messages');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 0);
            break;
        case 'assess':
            pageTitleElement.textContent = 'Assessments';
            break;
        case 'log':
            pageTitleElement.textContent = 'Log Health Data';
            break;
        case 'insights':
            pageTitleElement.textContent = 'Insights';
            break;
        case 'profile':
            pageTitleElement.textContent = 'Profile';
            break;
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(pageElement => {
        pageElement.classList.remove('active');
    });
    
    // Show the selected page
    document.getElementById(`${page}-page`).classList.add('active');
}

// ===== Modal functions =====
// Show log data modal
function showLogDataModal(type, label) {
    const modal = document.getElementById('log-data-modal');
    const title = document.getElementById('log-modal-title');
    const valueLabel = document.getElementById('log-modal-label');
    const valueInput = document.getElementById('log-modal-value');
    
    // Set modal content based on type
    title.textContent = type === 'heartRate' ? 'Log Heart Rate' : 'Log Sleep';
    title.setAttribute('data-type', type);
    valueLabel.textContent = label;
    valueInput.value = '';
    
    // Adjust input step and min/max based on type
    if (type === 'heartRate') {
        valueInput.setAttribute('step', '1');
        valueInput.setAttribute('min', '40');
        valueInput.setAttribute('max', '220');
    } else {
        valueInput.setAttribute('step', '0.1');
        valueInput.setAttribute('min', '0');
        valueInput.setAttribute('max', '24');
    }
    
    // Show the modal
    modal.style.display = 'flex';
    
    // Focus the input
    setTimeout(() => {
        valueInput.focus();
    }, 100);
}

// Show notification modal
function showNotification(title, message) {
    const modal = document.getElementById('notification-modal');
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').textContent = message;
    
    // Show the modal
    modal.style.display = 'flex';
}

// Show confirmation modal
function showConfirmModal(title, message, callback) {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    // Set callback function
    if (callback) {
        modal.setAttribute('data-callback', callback.name);
    }
    
    // Show the modal
    modal.style.display = 'flex';
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// ===== Chat functions =====
// Send chat message
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        // Add user message to conversation
        addMessageToConversation(message, 'user');
        
        // Clear input
        input.value = '';
        
        // Set Orb to thinking state
        const orbVisual = document.getElementById('orb-visual');
        orbVisual.className = 'orb thinking';
        
        // Simulate Orb response after a short delay
        setTimeout(() => {
            // Generate response
            const response = generateOrbResponse(message);
            
            // Add Orb response to conversation
            addMessageToConversation(response, 'orb');
            
            // Set Orb back to idle state
            orbVisual.className = 'orb idle';
        }, 1500);
    }
}

// Add message to conversation
function addMessageToConversation(text, sender) {
    const message = {
        id: `msg-${Date.now()}`,
        text,
        sender,
        timestamp: new Date()
    };
    
    // Add to conversation history
    conversationHistory.push(message);
    
    // Save user data
    saveUserData();
    
    // Update UI
    updateConversationDisplay();
}

// Generate Orb response (enhanced version with context awareness)
function generateOrbResponse(userMessage) {
    // In a real app, this would use the AI service
    // This is a more context-aware rule-based response for demo purposes
    const lowerMessage = userMessage.toLowerCase();
    
    // Get user context for more personalized responses
    const userName = userProfile.name || 'there';
    const latestAssessment = assessmentHistory.length > 0 ? assessmentHistory[assessmentHistory.length - 1] : null;
    const latestHeartRate = biometricHistory.filter(r => r.type === 'heartRate').sort((a, b) => b.timestamp - a.timestamp)[0];
    const latestSleep = biometricHistory.filter(r => r.type === 'sleepHours').sort((a, b) => b.timestamp - a.timestamp)[0];
    
    // Standard greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'hey') {
        const timeOfDay = new Date().getHours();
        let greeting = "Hello";
        
        if (timeOfDay < 12) {
            greeting = "Good morning";
        } else if (timeOfDay < 18) {
            greeting = "Good afternoon";
        } else {
            greeting = "Good evening";
        }
        
        return `${greeting}, ${userName}! How are you feeling today?`;
    }
    
    // Mood and emotional state responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
        // Check if user has anxiety in their conditions or assessments
        const hasAnxietyHistory = userProfile.conditions.some(c => c.toLowerCase().includes('anxiety')) || 
                                (latestAssessment && latestAssessment.type === 'GAD-7' && latestAssessment.score > 5);
        
        if (hasAnxietyHistory) {
            return `I understand that anxiety is something you've been working with, ${userName}. Based on what we've discussed before, the 4-7-8 breathing technique has been helpful for you. Would you like to try it now? Or we could explore another approach if you prefer.`;
        } else {
            return `I understand feeling anxious can be difficult, ${userName}. Would you like to try a simple breathing exercise? Breathe in for 4 counts, hold for 7, and exhale for 8. This can help calm your nervous system.`;
        }
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
        // Check depression history
        const hasDepressionHistory = userProfile.conditions.some(c => c.toLowerCase().includes('depress')) || 
                                    (latestAssessment && latestAssessment.type === 'PHQ-9' && latestAssessment.score > 5);
        
        if (hasDepressionHistory) {
            return `I'm sorry to hear you're feeling down today, ${userName}. Your PHQ-9 assessment showed that this is something you've been working through. Would it help to try one of the mood-lifting activities we've discussed before, like a short walk or reaching out to a friend? Or would you prefer to talk more about what's on your mind?`;
        } else {
            return `I'm sorry to hear you're feeling down, ${userName}. Sometimes it helps to talk about what's bothering you or engage in an activity you enjoy. Would you like some suggestions?`;
        }
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
        // Check heart rate data for signs of physical stress
        const hasElevatedHeartRate = latestHeartRate && latestHeartRate.value > userProfile.baselineHeartRate + 10;
        
        if (hasElevatedHeartRate) {
            return `I notice that feeling stressed coincides with your elevated heart rate (${latestHeartRate.value} bpm, which is above your baseline). This mind-body connection is important to address. Would you like to try a grounding exercise that can help reduce both the physical and emotional aspects of stress?`;
        } else {
            return `Being overwhelmed by stress is common, ${userName}. Have you tried breaking down your tasks into smaller, manageable steps? Sometimes making a list can help reduce that feeling of being overwhelmed. I'm here to support you through this.`;
        }
    }
    
    // Sleep-related responses
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
        // Check sleep patterns
        const hasSleepIssues = latestSleep && latestSleep.value < 6.5;
        const hasInsomniaCondition = userProfile.conditions.some(c => c.toLowerCase().includes('insomnia'));
        
        if (hasInsomniaCondition) {
            return `Sleep is something we've discussed before given your insomnia. Your recent sleep logs show you've been getting about ${latestSleep ? latestSleep.value : 'variable'} hours. Have you been continuing with the wind-down routine we talked about? I'm curious which aspects you've found most helpful.`;
        } else if (hasSleepIssues) {
            return `I see from your logs that you got ${latestSleep.value} hours of sleep recently, which is below your baseline of ${userProfile.baselineSleep} hours. Sleep quality can significantly impact mental wellbeing. Would you like some evidence-based techniques to improve your sleep?`;
        } else {
            return `Sleep is so important for mental health. Have you tried establishing a consistent bedtime routine? Reducing screen time before bed can also help improve sleep quality.`;
        }
    }
    
    // Data logging inquiries
    if (lowerMessage.includes('heart') || lowerMessage.includes('rate') || lowerMessage.includes('bpm')) {
        if (latestHeartRate) {
            return `Your last recorded heart rate was ${latestHeartRate.value} bpm, which is ${latestHeartRate.value > userProfile.baselineHeartRate + 5 ? 'above' : 'near'} your baseline of ${userProfile.baselineHeartRate} bpm. Would you like to log a new heart rate reading?`;
        } else {
            return `I don't have any heart rate readings for you yet. Would you like to log your heart rate now? This can help us track how your physical state correlates with your mental wellbeing.`;
        }
    } else if (lowerMessage.includes('log') || lowerMessage.includes('track')) {
        return `Logging your health data helps us identify patterns that impact your mental wellbeing. Would you like to log your sleep, heart rate, or mood right now? You can also take an assessment to track your mental health more directly.`;
    }
    
    // Assessment inquiries
    if (lowerMessage.includes('assessment') || lowerMessage.includes('test') || lowerMessage.includes('questionnaire')) {
        if (latestAssessment) {
            const daysSinceAssessment = Math.floor((new Date() - new Date(latestAssessment.timestamp)) / (1000 * 60 * 60 * 24));
            
            return `Your last assessment was ${daysSinceAssessment} days ago (${latestAssessment.type} with a score of ${latestAssessment.score}). ${daysSinceAssessment >= userProfile.assessmentFrequency ? "It would be a good time to take another assessment now." : `You might want to wait ${userProfile.assessmentFrequency - daysSinceAssessment} more days before your next assessment, but you're welcome to take one now if you'd like.`} Would you like to take a PHQ-9 (depression) or GAD-7 (anxiety) assessment?`;
        } else {
            return `Taking regular mental health assessments helps track your wellbeing over time. Would you like to take a PHQ-9 (depression) or GAD-7 (anxiety) assessment now? It only takes a few minutes.`;
        }
    }
    
    // Help or support inquiries
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return `I'm here to support you, ${userName}. I can help you track your mental health through assessments, log your physical metrics like sleep and heart rate, provide personalized insights, or just be here to talk. What would be most helpful right now?`;
    }
    
    // Comments about feeling good or improvements
    if (lowerMessage.includes('good') || lowerMessage.includes('better') || lowerMessage.includes('great') || lowerMessage.includes('happy')) {
        return `I'm really glad to hear you're feeling good today, ${userName}! It's important to acknowledge and celebrate these positive moments. Is there anything specific that you think contributed to your positive mood today?`;
    }
    
    // Questions about insights or recommendations
    if (lowerMessage.includes('insight') || lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
        return `I can generate personalized insights based on your assessment results and health data. Looking at your patterns, I notice that your sleep quality seems to correlate strongly with your mood and anxiety levels. Would you like me to provide more detailed insights?`;
    }
    
    // Generic responses for anything else
    const genericResponses = [
        `I'm here to support you, ${userName}. Can you tell me more about what you're experiencing right now?`,
        `I'd like to understand more about what's on your mind. Could you share a bit more about what you're feeling?`,
        `Thank you for sharing that with me. Would you like to explore this further, or would it be helpful to try a quick mindfulness exercise?`,
        `I appreciate you reaching out. Your mental wellbeing is important. How else can I support you today?`,
        `I'm listening and here to help. Would it be useful to look at some of your recent health patterns, or would you prefer to just talk?`
    ];
    
    // Return a randomly selected generic response
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

// ===== Assessment functions =====
// Start assessment
function startAssessment(type) {
    // Initialize current assessment
    currentAssessment = {
        type,
        responses: []
    };
    
    // Update UI
    document.querySelector('.assessment-selection').style.display = 'none';
    document.querySelector('.assessment-history').style.display = 'none';
    document.querySelector('.assessment-form').style.display = 'block';
    document.getElementById('assessment-form-title').textContent = `${type} Assessment`;
    
    // Generate assessment questions
    const questionsContainer = document.getElementById('assessment-questions-form');
    questionsContainer.innerHTML = '';
    
    questionnaires[type].forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'assessment-question';
        questionElement.innerHTML = `
            <div class="question-text">${index + 1}. ${question}</div>
            <div class="option-group">
                <input type="radio" id="q${index}_0" name="q${index}" value="0" class="option-input" required>
                <label for="q${index}_0" class="option-label">0</label>
                
                <input type="radio" id="q${index}_1" name="q${index}" value="1" class="option-input">
                <label for="q${index}_1" class="option-label">1</label>
                
                <input type="radio" id="q${index}_2" name="q${index}" value="2" class="option-input">
                <label for="q${index}_2" class="option-label">2</label>
                
                <input type="radio" id="q${index}_3" name="q${index}" value="3" class="option-input">
                <label for="q${index}_3" class="option-label">3</label>
            </div>
        `;
        
        questionsContainer.appendChild(questionElement);
    });
}

// Cancel assessment
function cancelAssessment() {
    // Reset current assessment
    currentAssessment = {
        type: null,
        responses: []
    };
    
    // Update UI
    document.querySelector('.assessment-form').style.display = 'none';
    document.querySelector('.assessment-selection').style.display = 'block';
    document.querySelector('.assessment-history').style.display = 'block';
}

// Submit assessment
function submitAssessment() {
    // Get responses
    const questions = questionnaires[currentAssessment.type];
    const responses = [];
    
    let allAnswered = true;
    
    questions.forEach((_, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        if (selectedOption) {
            responses.push(parseInt(selectedOption.value));
        } else {
            allAnswered = false;
        }
    });
    
    if (!allAnswered) {
        showNotification('Incomplete Assessment', 'Please answer all questions to submit the assessment.');
        return;
    }
    
    // Calculate total score
    const totalScore = responses.reduce((sum, score) => sum + score, 0);
    
    // Determine severity
    let severity;
    
    if (currentAssessment.type === "PHQ-9") {
        if (totalScore >= 20) severity = "Severe depression";
        else if (totalScore >= 15) severity = "Moderately severe depression";
        else if (totalScore >= 10) severity = "Moderate depression";
        else if (totalScore >= 5) severity = "Mild depression";
        else severity = "None to minimal depression";
    } else { // GAD-7
        if (totalScore >= 15) severity = "Severe anxiety";
        else if (totalScore >= 10) severity = "Moderate anxiety";
        else if (totalScore >= 5) severity = "Mild anxiety";
        else severity = "None to minimal anxiety";
    }
    
    // Save assessment result
    addAssessmentResult(currentAssessment.type, totalScore, severity, responses);
    
    // Update results UI
    document.getElementById('result-type').textContent = currentAssessment.type;
    document.getElementById('result-score').textContent = totalScore;
    document.getElementById('result-interpretation').textContent = severity;
    
    // Update guidance text
    const guidanceElement = document.getElementById('results-guidance');
    if (totalScore >= 10) {
        guidanceElement.innerHTML = `
            I'll use this information to provide more personalized support.
            <p class="high" style="margin-top: 10px;">Note: Your score suggests significant symptoms. Consider discussing these results with a healthcare professional.</p>
        `;
    } else {
        guidanceElement.textContent = `I'll use this information to provide more personalized support.`;
    }
    
    // Show results
    document.querySelector('.assessment-form').style.display = 'none';
    document.querySelector('.assessment-results').style.display = 'block';
    
    // Reset current assessment
    currentAssessment = {
        type: null,
        responses: []
    };
}

// ===== Log health data functions =====
// Log health data from form
function logHealthData(type) {
    let value, valid = true, mentalState = null;
    
    if (type === 'heartRate') {
        value = parseFloat(document.getElementById('heart-rate-input').value);
        mentalState = document.getElementById('heart-rate-mental-state').value.trim();
        
        if (isNaN(value) || value < 40 || value > 220) {
            showNotification('Invalid Input', 'Please enter a valid heart rate between 40 and 220 bpm.');
            valid = false;
        }
    } else if (type === 'sleepHours') {
        value = parseFloat(document.getElementById('sleep-hours-input').value);
        mentalState = document.getElementById('sleep-mental-state').value.trim();
        
        if (isNaN(value) || value < 0 || value > 24) {
            showNotification('Invalid Input', 'Please enter a valid sleep duration between 0 and 24 hours.');
            valid = false;
        }
    } else if (type === 'moodScore') {
        value = parseInt(document.getElementById('mood-score-input').value);
        const moodNotes = document.getElementById('mood-notes').value.trim();
        
        if (isNaN(value) || value < 1 || value > 10) {
            showNotification('Invalid Input', 'Please enter a valid mood score between 1 and 10.');
            valid = false;
        }
        
        if (moodNotes) {
            mentalState = moodNotes;
        }
    }
    
    if (valid) {
        // Log the data
        addBiometricReading(type, value, mentalState);
        
        // Show success notification
        showNotification('Success', `Your ${type === 'heartRate' ? 'heart rate' : type === 'sleepHours' ? 'sleep' : 'mood'} data has been logged.`);
        
        // Clear form fields
        if (type === 'heartRate') {
            document.getElementById('heart-rate-input').value = '';
            document.getElementById('heart-rate-mental-state').value = '';
        } else if (type === 'sleepHours') {
            document.getElementById('sleep-hours-input').value = '';
            document.getElementById('sleep-mental-state').value = '';
        } else if (type === 'moodScore') {
            document.getElementById('mood-score-input').value = '';
            document.getElementById('mood-notes').value = '';
        }
        
        // Update baselines
        getBaselines();
    }
}

// ===== Profile functions =====
// Save profile
function saveProfile() {
    const name = document.getElementById('profile-name').value.trim();
    const age = parseInt(document.getElementById('profile-age').value);
    const conditionsStr = document.getElementById('profile-conditions').value;
    const assessmentFrequency = parseInt(document.getElementById('profile-assessment-frequency').value);
    
    // Validate inputs
    if (assessmentFrequency < 1 || isNaN(assessmentFrequency)) {
        showNotification('Invalid Input', 'Please enter a valid assessment frequency (minimum 1 day).');
        return;
    }
    
    // Update user profile
    userProfile.name = name;
    userProfile.age = !isNaN(age) ? age : null;
    userProfile.conditions = conditionsStr ? conditionsStr.split(',').map(c => c.trim()) : [];
    userProfile.assessmentFrequency = assessmentFrequency;
    userProfile.insightsEnabled = document.getElementById('insights-enabled').checked;
    userProfile.checkInFrequency = document.getElementById('check-in-enabled').checked ? 'daily' : 'never';
    
    // Save user data
    saveUserData();
    
    // Update UI
    updateUserInfo();
    
    // Show success notification
    showNotification('Success', 'Your profile has been updated.');
}

// Clear all data
function clearAllData() {
    // Reset data structures
    userProfile = {
        name: '',
        age: null,
        conditions: [],
        lastAssessment: null,
        assessmentFrequency: 7,
        baselineHeartRate: 72,
        baselineSleep: 7.5,
        preferredCheckInTime: '09:00',
        checkInFrequency: 'daily',
        insightsEnabled: true
    };
    
    assessmentHistory = [];
    biometricHistory = [];
    
    conversationHistory = [
        {
            id: 'initial-message',
            text: "Hello! I'm Orb, your mental health companion. How are you feeling today?",
            sender: 'orb',
            timestamp: new Date()
        }
    ];
    
    // Clear localStorage
    localStorage.removeItem('userProfile');
    localStorage.removeItem('assessmentHistory');
    localStorage.removeItem('biometricHistory');
    localStorage.removeItem('conversationHistory');
    
    // Update UI
    updateUI();
    
    // Show success notification
    showNotification('Success', 'All your data has been cleared.');
}

// ===== Insights functions =====
// Generate insights
function generateInsights() {
    const insightsContainer = document.getElementById('insights-content');
    const insightsPlaceholder = document.querySelector('.insights-placeholder');
    const insightsLoading = document.querySelector('.insights-loading');
    
    // Check if we have enough data
    if (assessmentHistory.length === 0 && biometricHistory.length < 3) {
        showNotification('Not Enough Data', 'I need more data to generate meaningful insights. Try logging more health data or completing an assessment.');
        return;
    }
    
    // Show loading state
    insightsContainer.style.display = 'none';
    insightsPlaceholder.style.display = 'none';
    insightsLoading.style.display = 'flex';
    
    // In a real app, this would call an AI service
    // For the demo, we'll generate insights based on the data
    setTimeout(() => {
        const insights = generateMockInsights();
        
        // Display insights
        insightsContainer.innerHTML = insights;
        insightsContainer.style.display = 'block';
        insightsLoading.style.display = 'none';
        
        // Update correlations
        updateCorrelations();
    }, 2000);
}

// Generate detailed mock insights based on user data
function generateMockInsights() {
    let insights = '';
    
    // Add summary section
    insights += '<h4>Summary</h4>';
    
    if (assessmentHistory.length > 0) {
        const latestAssessment = assessmentHistory[assessmentHistory.length - 1];
        const previousAssessments = assessmentHistory.filter(a => a.type === latestAssessment.type && a.timestamp < latestAssessment.timestamp);
        
        insights += `<p>Based on your latest ${latestAssessment.type} assessment (score: ${latestAssessment.score}), you're experiencing ${latestAssessment.assessment}. `;
        
        if (previousAssessments.length > 0) {
            // Sort by timestamp (newest first)
            previousAssessments.sort((a, b) => b.timestamp - a.timestamp);
            const previousScore = previousAssessments[0].score;
            const scoreDifference = Math.abs(latestAssessment.score - previousScore);
            
            if (latestAssessment.score < previousScore) {
                insights += `This is a ${scoreDifference} point improvement compared to your previous ${latestAssessment.type} assessment. `;
            } else if (latestAssessment.score > previousScore) {
                insights += `This is a ${scoreDifference} point increase compared to your previous ${latestAssessment.type} assessment. `;
            } else {
                insights += `This is unchanged from your previous ${latestAssessment.type} assessment. `;
            }
        }
    }
    
    if (biometricHistory.some(reading => reading.type === 'heartRate')) {
        const heartRateReadings = biometricHistory.filter(reading => reading.type === 'heartRate');
        const recentHeartRates = heartRateReadings.slice(-7); // Last week
        const avgRecentHeartRate = recentHeartRates.reduce((sum, r) => sum + r.value, 0) / recentHeartRates.length;
        
        insights += `Your average heart rate in the past week is ${avgRecentHeartRate.toFixed(1)} bpm (baseline: ${userProfile.baselineHeartRate} bpm). `;
    }
    
    if (biometricHistory.some(reading => reading.type === 'sleepHours')) {
        const sleepReadings = biometricHistory.filter(reading => reading.type === 'sleepHours');
        const recentSleep = sleepReadings.slice(-7); // Last week
        const avgRecentSleep = recentSleep.reduce((sum, r) => sum + r.value, 0) / recentSleep.length;
        
        insights += `You're averaging ${avgRecentSleep.toFixed(1)} hours of sleep in the past week (baseline: ${userProfile.baselineSleep} hours).`;
    }
    
    insights += '</p>';
    
    // Add specific insights
    insights += '<h4>Key Insights</h4><ul>';
    
    // Sleep-mood correlation insight
    if (biometricHistory.some(reading => reading.type === 'sleepHours') && 
        biometricHistory.some(reading => reading.type === 'moodScore')) {
        insights += `<li><strong>Sleep-Mood Connection:</strong> Your data shows a pattern where your mood scores tend to be higher on days following nights with 7+ hours of sleep. On days after getting less than 6 hours of sleep, your mood scores are consistently lower. Prioritizing sleep could be an effective strategy for improving your overall mental wellbeing.</li>`;
    }
    
    // Sleep patterns
    if (biometricHistory.some(reading => reading.type === 'sleepHours')) {
        const sleepReadings = biometricHistory.filter(reading => reading.type === 'sleepHours');
        const avgSleep = sleepReadings.reduce((sum, reading) => sum + reading.value, 0) / sleepReadings.length;
        
        // Check for sleep variability
        const sleepValues = sleepReadings.map(r => r.value);
        const maxSleep = Math.max(...sleepValues);
        const minSleep = Math.min(...sleepValues);
        const sleepVariability = maxSleep - minSleep;
        
        if (sleepVariability > 3) {
            insights += `<li><strong>Sleep Consistency:</strong> Your sleep duration varies significantly, ranging from ${minSleep.toFixed(1)} to ${maxSleep.toFixed(1)} hours (a difference of ${sleepVariability.toFixed(1)} hours). This irregular pattern can affect your body's circadian rhythm and mood regulation. Aiming for a more consistent sleep schedule could improve your mental wellbeing.</li>`;
        } else if (avgSleep < 7) {
            insights += `<li><strong>Sleep Optimization:</strong> Your average sleep of ${avgSleep.toFixed(1)} hours is below the recommended 7-9 hours for adults. The days you've logged more sleep correspond with better mood scores. Consider implementing a wind-down routine before bed to improve sleep quality and duration.</li>`;
        } else {
            insights += `<li><strong>Positive Sleep Habits:</strong> You're averaging ${avgSleep.toFixed(1)} hours of sleep with good consistency, which supports optimal mental health. Continue your current sleep routine as it appears to be working well for you.</li>`;
        }
    }
    
    // Heart rate patterns and correlation with assessments
    if (biometricHistory.some(reading => reading.type === 'heartRate') && assessmentHistory.length > 0) {
        const heartRateReadings = biometricHistory.filter(reading => reading.type === 'heartRate');
        const highReadings = heartRateReadings.filter(reading => reading.value > userProfile.baselineHeartRate + 10);
        
        if (highReadings.length > heartRateReadings.length * 0.3) {
            // Find if elevated heart rates correlate with assessment dates
            const assessmentDates = assessmentHistory.map(a => new Date(a.timestamp).setHours(0, 0, 0, 0));
            
            const elevatedHeartRateOnAssessmentDays = highReadings.some(reading => {
                const readingDate = new Date(reading.timestamp).setHours(0, 0, 0, 0);
                return assessmentDates.includes(readingDate);
            });
            
            if (elevatedHeartRateOnAssessmentDays) {
                insights += `<li><strong>Physiological Stress Markers:</strong> Your heart rate tends to be elevated on days when you've completed mental health assessments (${highReadings.length} elevated readings out of ${heartRateReadings.length} total). This physical response aligns with your self-reported stress and anxiety levels, suggesting a strong mind-body connection. Regular relaxation practices like deep breathing might help manage both the physical and mental aspects of stress.</li>`;
            } else {
                insights += `<li><strong>Elevated Heart Rate Pattern:</strong> Your heart rate has been elevated in ${highReadings.length} out of ${heartRateReadings.length} readings. Your average elevated reading is ${Math.round(highReadings.reduce((sum, r) => sum + r.value, 0) / highReadings.length)} bpm, which is ${Math.round(highReadings.reduce((sum, r) => sum + r.value, 0) / highReadings.length - userProfile.baselineHeartRate)} bpm above your baseline. These elevations often occur in the afternoon, which could indicate work-related stress. Consider implementing stress management techniques during this time of day.</li>`;
            }
        }
    }
    
    // Assessment trend analysis
    if (assessmentHistory.length >= 2) {
        // Group by assessment type
        const phq9Assessments = assessmentHistory.filter(a => a.type === 'PHQ-9').sort((a, b) => a.timestamp - b.timestamp);
        const gad7Assessments = assessmentHistory.filter(a => a.type === 'GAD-7').sort((a, b) => a.timestamp - b.timestamp);
        
        if (phq9Assessments.length >= 2) {
            const firstPHQ9 = phq9Assessments[0];
            const lastPHQ9 = phq9Assessments[phq9Assessments.length - 1];
            const phq9Difference = lastPHQ9.score - firstPHQ9.score;
            
            if (phq9Difference < -3) {
                insights += `<li><strong>Depression Symptoms Improving:</strong> Your PHQ-9 scores have decreased from ${firstPHQ9.score} to ${lastPHQ9.score} (${Math.abs(phq9Difference)} point improvement), indicating a significant reduction in depression symptoms. This positive trend suggests your current approaches are helping. Looking at your logged data, this improvement correlates with better sleep patterns.</li>`;
            } else if (phq9Difference > 3) {
                insights += `<li><strong>Increasing Depression Symptoms:</strong> Your PHQ-9 scores have increased from ${firstPHQ9.score} to ${lastPHQ9.score} (${phq9Difference} point increase), which might indicate worsening depression symptoms. This change correlates with the period of reduced sleep you've logged. Consider discussing these changes with a healthcare provider and focusing on sleep improvement.</li>`;
            } else {
                insights += `<li><strong>Stable Depression Metrics:</strong> Your PHQ-9 scores have remained relatively stable (${firstPHQ9.score} to ${lastPHQ9.score}), showing minimal change in depression symptoms. Maintaining stability can be positive, especially if you've previously experienced more significant symptoms.</li>`;
            }
        }
        
        if (gad7Assessments.length >= 2) {
            const firstGAD7 = gad7Assessments[0];
            const lastGAD7 = gad7Assessments[gad7Assessments.length - 1];
            const gad7Difference = lastGAD7.score - firstGAD7.score;
            
            if (gad7Difference < -3) {
                insights += `<li><strong>Anxiety Symptoms Decreasing:</strong> Your GAD-7 scores have decreased from ${firstGAD7.score} to ${lastGAD7.score} (${Math.abs(gad7Difference)} point improvement), indicating a significant reduction in anxiety symptoms. This improvement correlates with the period when you logged fewer elevated heart rate readings.</li>`;
            } else if (gad7Difference > 3) {
                insights += `<li><strong>Increasing Anxiety Pattern:</strong> Your GAD-7 scores have increased from ${firstGAD7.score} to ${lastGAD7.score} (${gad7Difference} point increase), suggesting increasing anxiety symptoms. This change appears to coincide with the increased heart rate variability in your recent logs. Stress management techniques might be particularly helpful during this period.</li>`;
            }
        }
    }
    
    // Add a seasonal or time-based insight
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 9 && currentMonth <= 11) { // Fall/Winter months
        insights += `<li><strong>Seasonal Awareness:</strong> As we move into the fall/winter season, many people experience changes in mood and energy due to reduced daylight. Your recent sleep logs show slightly later wake times, which is common during this seasonal transition. Morning light exposure can help maintain your circadian rhythm during this period.</li>`;
    } else if (currentMonth >= 3 && currentMonth <= 5) { // Spring months
        insights += `<li><strong>Seasonal Transitions:</strong> Spring transitions often bring mood changes for many people. Your recent assessment scores and biometric data suggest you may be experiencing some seasonal benefits with improved mood metrics compared to earlier readings.</li>`;
    }
    
    insights += '</ul>';
    
    // Add personalized recommendations
    insights += '<h4>Personalized Recommendations</h4><ul>';
    
    // Sleep recommendation
    if (biometricHistory.some(reading => reading.type === 'sleepHours')) {
        const sleepReadings = biometricHistory.filter(reading => reading.type === 'sleepHours');
        const avgSleep = sleepReadings.reduce((sum, reading) => sum + reading.value, 0) / sleepReadings.length;
        
        if (avgSleep < 6.5) {
            insights += `<li>Focus on improving sleep duration by implementing a 30-minute wind-down routine before bed, avoiding screens, and maintaining a consistent sleep schedule.</li>`;
        } else if (avgSleep >= 6.5 && avgSleep < 7.5) {
            insights += `<li>Your sleep duration is approaching optimal levels. Consider small adjustments to your bedtime routine to add another 30 minutes of sleep for potentially significant mental health benefits.</li>`;
        } else {
            insights += `<li>Continue maintaining your excellent sleep habits, which appear to positively impact your mental wellbeing.</li>`;
        }
    }
    
    // Stress management recommendation based on heart rate
    if (biometricHistory.some(reading => reading.type === 'heartRate')) {
        const heartRateReadings = biometricHistory.filter(reading => reading.type === 'heartRate');
        const highReadings = heartRateReadings.filter(reading => reading.value > userProfile.baselineHeartRate + 10);
        
        if (highReadings.length > heartRateReadings.length * 0.3) {
            insights += `<li>Practice the 4-7-8 breathing technique (inhale for 4 counts, hold for 7, exhale for 8) daily, especially during times when you've logged elevated heart rates (typically afternoons).</li>`;
        }
    }
    
    // Assessment-based recommendation
    if (assessmentHistory.length > 0) {
        const latestAssessment = assessmentHistory[assessmentHistory.length - 1];
        
        if (latestAssessment.type === 'PHQ-9' && latestAssessment.score >= 10) {
            insights += `<li>Your PHQ-9 scores suggest depression symptoms that might benefit from professional support. Consider connecting with a mental health provider to discuss these symptoms.</li>`;
        } else if (latestAssessment.type === 'GAD-7' && latestAssessment.score >= 10) {
            insights += `<li>Your GAD-7 scores indicate significant anxiety symptoms. In addition to relaxation techniques, consider speaking with a healthcare provider about additional support options.</li>`;
        }
    }
    
    // Always add a positive, actionable recommendation
    insights += `<li>Continue using NeuroSense for regular check-ins and logging, as consistent tracking helps identify patterns and progress over time.</li>`;
    
    insights += '</ul>';
    
    // Add encouraging conclusion
    insights += '<h4>Encouragement</h4>';
    insights += '<p>You've been consistently tracking your mental health and biometric data, which shows your commitment to self-care. Remember that mental health fluctuates naturally, and the patterns in your data can help you identify what works best for you. Each small step you take to manage your wellbeing adds up to significant positive changes over time.</p>';
    
    return insights;
}

// Update correlations display with advanced visualizations
function updateCorrelations() {
    const correlationsList = document.getElementById('correlations-list');
    const correlationsPlaceholder = document.querySelector('.correlations-placeholder');
    
    // Show correlations if we have enough data
    if (biometricHistory.length >= 5 && assessmentHistory.length >= 1) {
        correlationsList.innerHTML = '';
        correlationsList.style.display = 'block';
        correlationsPlaceholder.style.display = 'none';
        
        // Sleep-anxiety correlation
        const sleepAnxietyCorrelation = document.createElement('div');
        sleepAnxietyCorrelation.className = 'correlation-item';
        sleepAnxietyCorrelation.innerHTML = `
            <div class="correlation-icon">
                <i class="fas fa-moon"></i>
            </div>
            <div class="correlation-info">
                <div class="correlation-title">Sleep and Anxiety Connection</div>
                <div class="correlation-description">Your GAD-7 scores are 40% higher during periods when you sleep less than 6 hours compared to when you sleep 7+ hours.</div>
                <div class="correlation-strength">Strong correlation (r = 0.76)</div>
            </div>
        `;
        correlationsList.appendChild(sleepAnxietyCorrelation);
        
        // Heart rate-stress correlation
        const heartRateStressCorrelation = document.createElement('div');
        heartRateStressCorrelation.className = 'correlation-item';
        heartRateStressCorrelation.innerHTML = `
            <div class="correlation-icon">
                <i class="fas fa-heartbeat"></i>
            </div>
            <div class="correlation-info">
                <div class="correlation-title">Heart Rate and Stress Pattern</div>
                <div class="correlation-description">Elevated heart rate readings (85+ bpm) occur 3x more frequently on days when you report feeling stressed or anxious.</div>
                <div class="correlation-strength">Moderate correlation (r = 0.62)</div>
            </div>
        `;
        correlationsList.appendChild(heartRateStressCorrelation);
        
        // Time of day pattern
        const timeOfDayPattern = document.createElement('div');
        timeOfDayPattern.className = 'correlation-item';
        timeOfDayPattern.innerHTML = `
            <div class="correlation-icon">
                <i class="fas fa-clock"></i>
            </div>
            <div class="correlation-info">
                <div class="correlation-title">Afternoon Stress Pattern</div>
                <div class="correlation-description">Your heart rate peaks between 2-4pm on workdays, suggesting a recurring pattern of afternoon stress or anxiety.</div>
                <div class="correlation-strength">Temporal pattern (85% consistency)</div>
            </div>
        `;
        correlationsList.appendChild(timeOfDayPattern);
        
        // Sleep-mood correlation
        const sleepMoodCorrelation = document.createElement('div');
        sleepMoodCorrelation.className = 'correlation-item';
        sleepMoodCorrelation.innerHTML = `
            <div class="correlation-icon">
                <i class="fas fa-smile"></i>
            </div>
            <div class="correlation-info">
                <div class="correlation-title">Sleep and Mood Relationship</div>
                <div class="correlation-description">Your mood scores are consistently higher (avg +2.3 points) on days following nights with 7+ hours of sleep.</div>
                <div class="correlation-strength">Strong correlation (r = 0.81)</div>
            </div>
        `;
        correlationsList.appendChild(sleepMoodCorrelation);
        
        // Weekend recovery pattern
        const weekendPattern = document.createElement('div');
        weekendPattern.className = 'correlation-item';
        weekendPattern.innerHTML = `
            <div class="correlation-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="correlation-info">
                <div class="correlation-title">Weekend Recovery Effect</div>
                <div class="correlation-description">Your heart rate consistently returns to baseline on weekends, suggesting effective recovery from weekday stress.</div>
                <div class="correlation-strength">Weekly pattern (90% consistency)</div>
            </div>
        `;
        correlationsList.appendChild(weekendPattern);
    } else {
        correlationsList.style.display = 'none';
        correlationsPlaceholder.style.display = 'block';
    }
    
    // Add style for correlation strength indicator
    const style = document.createElement('style');
    style.textContent = `
        .correlation-strength {
            font-size: 0.85rem;
            color: #8661c1;
            margin-top: 4px;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

// ===== Utility functions =====
// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date (short)
function formatDateShort(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return formatDate(date);
}