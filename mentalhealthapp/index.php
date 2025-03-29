<?php
// Simple PHP file to serve the NeuroSense Web App
// This allows for easy integration with existing server-side code

// You can add server-side logic here if needed
// For example, you could check for login status or load user data from a database

// Set content type to HTML
header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeuroSense | Mental Health Companion</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="logo-container">
                <div class="logo">NeuroSense</div>
                <p class="logo-subtitle">Mental Health Companion</p>
            </div>
            <nav class="nav-menu">
                <ul>
                    <li class="nav-item active" data-page="dashboard">
                        <i class="fas fa-chart-line"></i>
                        <span>Dashboard</span>
                    </li>
                    <li class="nav-item" data-page="chat">
                        <i class="fas fa-comment-dots"></i>
                        <span>Chat with Orb</span>
                    </li>
                    <li class="nav-item" data-page="assess">
                        <i class="fas fa-clipboard-check"></i>
                        <span>Assessments</span>
                    </li>
                    <li class="nav-item" data-page="log">
                        <i class="fas fa-heartbeat"></i>
                        <span>Log Health Data</span>
                    </li>
                    <li class="nav-item" data-page="insights">
                        <i class="fas fa-lightbulb"></i>
                        <span>Insights</span>
                    </li>
                    <li class="nav-item" data-page="profile">
                        <i class="fas fa-user-circle"></i>
                        <span>Profile</span>
                    </li>
                </ul>
            </nav>
            <div class="sidebar-footer">
                <p>&copy; 2025 NeuroSense</p>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
            <!-- Header Bar -->
            <header class="header">
                <div class="page-title">Dashboard</div>
                <div class="user-info">
                    <span class="user-name">Welcome, User</span>
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            </header>

            <!-- Dashboard Page -->
            <section class="page active" id="dashboard-page">
                <div class="dashboard-grid">
                    <!-- Mental Status Card -->
                    <div class="card mental-status">
                        <div class="card-header">
                            <h3><i class="fas fa-brain"></i> Mental Status</h3>
                        </div>
                        <div class="card-body">
                            <div class="status-indicator">
                                <div class="indicator-label">No assessments recorded</div>
                                <div class="indicator-value">-</div>
                            </div>
                            <button class="btn btn-primary" id="take-assessment-btn">Take Assessment</button>
                        </div>
                    </div>

                    <!-- Heart Rate Card -->
                    <div class="card heart-rate">
                        <div class="card-header">
                            <h3><i class="fas fa-heartbeat"></i> Heart Rate</h3>
                        </div>
                        <div class="card-body">
                            <div class="metric">
                                <span class="metric-value">--</span>
                                <span class="metric-unit">bpm</span>
                            </div>
                            <div class="metric-status normal">NORMAL</div>
                            <div class="metric-baseline">Baseline: <span id="heartrate-baseline">72</span> bpm</div>
                        </div>
                    </div>

                    <!-- Sleep Card -->
                    <div class="card sleep">
                        <div class="card-header">
                            <h3><i class="fas fa-moon"></i> Sleep</h3>
                        </div>
                        <div class="card-body">
                            <div class="metric">
                                <span class="metric-value">--</span>
                                <span class="metric-unit">hours</span>
                            </div>
                            <div class="metric-status normal">NORMAL</div>
                            <div class="metric-baseline">Baseline: <span id="sleep-baseline">7.5</span> hours</div>
                        </div>
                    </div>

                    <!-- Quick Actions Card -->
                    <div class="card quick-actions">
                        <div class="card-header">
                            <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                        </div>
                        <div class="card-body">
                        <button class="btn btn-secondary" id="quick-log-sleep-btn">
    <i class="fas fa-moon"></i> Log Sleep
</button>
                            <button class="btn btn-secondary" id="log-heart-btn">
                                <i class="fas fa-heartbeat"></i> Log Heart Rate
                            </button>
                            <button class="btn btn-secondary" id="chat-orb-btn">
                                <i class="fas fa-comment-dots"></i> Chat with Orb
                            </button>
                        </div>
                    </div>

                    <!-- Recommendations Card -->
                    <div class="card recommendations">
                        <div class="card-header">
                            <h3><i class="fas fa-lightbulb"></i> Recommendations</h3>
                        </div>
                        <div class="card-body">
                            <ul class="recommendation-list">
                                <li>It's been a while since your last assessment. Consider taking a new one.</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Recent Activity Card -->
                    <div class="card recent-activity">
                        <div class="card-header">
                            <h3><i class="fas fa-history"></i> Recent Activity</h3>
                        </div>
                        <div class="card-body">
                            <ul class="activity-list">
                                <li class="activity-item">
                                    <div class="activity-icon"><i class="fas fa-clipboard-check"></i></div>
                                    <div class="activity-info">
                                        <div class="activity-title">No recent activity</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Chat Page -->
            <section class="page" id="chat-page">
                <div class="chat-container">
                    <div class="chat-messages" id="chat-messages">
                        <div class="message orb-message">
                            <div class="message-content">
                                <p>Hello! I'm Orb, your mental health companion. How are you feeling today?</p>
                            </div>
                            <div class="message-time">Just now</div>
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <div class="orb-visualization">
                            <div class="orb idle" id="orb-visual"></div>
                        </div>
                        <div class="chat-input-wrapper">
                            <input type="text" id="chat-input" placeholder="Type your message...">
                            <button id="send-message-btn"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Assessments Page -->
            <section class="page" id="assess-page">
                <div class="page-header">
                    <h2>Mental Health Assessments</h2>
                    <p>Regular assessments help me understand your mental health patterns and provide better support.</p>
                </div>
                
                <div class="assessment-selection">
                    <div class="card">
                        <div class="card-header">
                            <h3>Choose an Assessment</h3>
                        </div>
                        <div class="card-body">
                            <div class="assessment-option" data-type="PHQ-9">
                                <div class="assessment-info">
                                    <h4>PHQ-9 (Depression Assessment)</h4>
                                    <p>9 questions about symptoms of depression over the past two weeks</p>
                                </div>
                                <button class="btn btn-primary start-assessment" data-type="PHQ-9">Start</button>
                            </div>
                            <div class="assessment-option" data-type="GAD-7">
                                <div class="assessment-info">
                                    <h4>GAD-7 (Anxiety Assessment)</h4>
                                    <p>7 questions about symptoms of anxiety over the past two weeks</p>
                                </div>
                                <button class="btn btn-primary start-assessment" data-type="GAD-7">Start</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="assessment-history">
                    <div class="card">
                        <div class="card-header">
                            <h3>Assessment History</h3>
                        </div>
                        <div class="card-body">
                            <div class="history-placeholder">No assessment history available</div>
                            <div class="assessment-history-list" style="display: none;">
                                <!-- Will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Assessment Form (hidden initially) -->
                <div class="assessment-form" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <h3 id="assessment-form-title">PHQ-9 Assessment</h3>
                            <p>Over the last two weeks, how often have you been bothered by the following problems?</p>
                            <div class="assessment-legend">
                                <span>0 - Not at all</span>
                                <span>1 - Several days</span>
                                <span>2 - More than half the days</span>
                                <span>3 - Nearly every day</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <form id="assessment-questions-form">
                                <!-- Questions will be inserted here by JavaScript -->
                            </form>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-assessment">Cancel</button>
                                <button type="button" class="btn btn-primary" id="submit-assessment">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Assessment Results (hidden initially) -->
                <div class="assessment-results" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <h3>Assessment Results</h3>
                        </div>
                        <div class="card-body">
                            <div class="results-summary">
                                <div class="result-item">
                                    <div class="result-label">Assessment Type:</div>
                                    <div class="result-value" id="result-type">PHQ-9</div>
                                </div>
                                <div class="result-item">
                                    <div class="result-label">Total Score:</div>
                                    <div class="result-value" id="result-score">0</div>
                                </div>
                                <div class="result-item">
                                    <div class="result-label">Interpretation:</div>
                                    <div class="result-value" id="result-interpretation">None to minimal depression</div>
                                </div>
                            </div>
                            <div class="results-guidance" id="results-guidance">
                                I'll use this information to provide more personalized support.
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-primary" id="results-done-btn">Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Log Health Data Page -->
            <section class="page" id="log-page">
                <div class="page-header">
                    <h2>Log Health Data</h2>
                    <p>Track your physical metrics to help NeuroSense provide better insights about your mental wellbeing</p>
                </div>
                
                <div class="log-options">
                    <div class="card heart-rate-log">
                        <div class="card-header">
                            <h3><i class="fas fa-heartbeat"></i> Heart Rate</h3>
                        </div>
                        <div class="card-body">
                            <div class="log-form">
                                <div class="form-group">
                                    <label for="heart-rate-input">Heart Rate (bpm)</label>
                                    <input type="number" id="heart-rate-input" min="40" max="220" placeholder="Enter your heart rate">
                                </div>
                                <div class="form-group optional">
                                    <label for="heart-rate-mental-state">Mental state (optional)</label>
                                    <input type="text" id="heart-rate-mental-state" placeholder="How are you feeling?">
                                </div>
                                <button class="btn btn-primary" id="log-heart-rate-btn">Log Heart Rate</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card sleep-log">
                        <div class="card-header">
                            <h3><i class="fas fa-moon"></i> Sleep</h3>
                        </div>
                        <div class="card-body">
                            <div class="log-form">
                                <div class="form-group">
                                    <label for="sleep-hours-input">Sleep Duration (hours)</label>
                                    <input type="number" id="sleep-hours-input" min="0" max="24" step="0.1" placeholder="Hours of sleep">
                                </div>
                                <div class="form-group optional">
                                    <label for="sleep-mental-state">Mental state (optional)</label>
                                    <input type="text" id="sleep-mental-state" placeholder="How are you feeling?">
                                </div>
                                <button class="btn btn-primary" id="log-sleep-btn">Log Sleep</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mood-log">
                        <div class="card-header">
                            <h3><i class="fas fa-smile"></i> Mood</h3>
                        </div>
                        <div class="card-body">
                            <div class="log-form">
                                <div class="form-group">
                                    <label for="mood-score-input">Mood Score (1-10)</label>
                                    <input type="number" id="mood-score-input" min="1" max="10" placeholder="Rate your mood">
                                </div>
                                <div class="form-group">
                                    <label for="mood-notes">Notes</label>
                                    <textarea id="mood-notes" placeholder="What's contributing to your mood?"></textarea>
                                </div>
                                <button class="btn btn-primary" id="log-mood-btn">Log Mood</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="recent-logs">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-history"></i> Recent Logs</h3>
                        </div>
                        <div class="card-body">
                            <div class="recent-logs-placeholder">No recent logs available</div>
                            <ul class="recent-logs-list" style="display: none;">
                                <!-- Will be populated by JavaScript -->
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Insights Page -->
            <section class="page" id="insights-page">
                <div class="page-header">
                    <h2>Personalized Insights</h2>
                    <p>Based on your assessments and health data, here are some personalized insights</p>
                </div>
                
                <div class="insights-container">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-lightbulb"></i> Your Insights</h3>
                        </div>
                        <div class="card-body">
                            <div class="insights-loading" style="display: none;">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Analyzing your data to generate personalized insights...</p>
                            </div>
                            <div class="insights-placeholder">
                                <p>Not enough data to generate insights yet.</p>
                                <p>Try logging some health data or completing an assessment.</p>
                            </div>
                            <div class="insights-content" id="insights-content" style="display: none;">
                                <!-- Will be populated by JavaScript -->
                            </div>
                            <button class="btn btn-primary" id="generate-insights-btn">Generate Insights</button>
                        </div>
                    </div>
                </div>
                
                <div class="correlations-container">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-link"></i> Health Correlations</h3>
                        </div>
                        <div class="card-body">
                            <div class="correlations-placeholder">
                                <p>Health correlations will appear here as NeuroSense learns more about your patterns.</p>
                            </div>
                            <div class="correlations-list" id="correlations-list" style="display: none;">
                                <!-- Will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Profile Page -->
            <section class="page" id="profile-page">
                <div class="page-header">
                    <h2>Your Profile</h2>
                    <p>Manage your personal information and preferences</p>
                </div>
                
                <div class="profile-container">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-user-edit"></i> Profile Information</h3>
                        </div>
                        <div class="card-body">
                            <form id="profile-form">
                                <div class="form-group">
                                    <label for="profile-name">Name</label>
                                    <input type="text" id="profile-name" placeholder="Your name">
                                </div>
                                <div class="form-group">
                                    <label for="profile-age">Age</label>
                                    <input type="number" id="profile-age" min="1" max="120" placeholder="Your age">
                                </div>
                                <div class="form-group">
                                    <label for="profile-conditions">Known conditions (comma separated)</label>
                                    <input type="text" id="profile-conditions" placeholder="e.g., anxiety, insomnia">
                                </div>
                                <div class="form-group">
                                    <label for="profile-assessment-frequency">Assessment frequency (days)</label>
                                    <input type="number" id="profile-assessment-frequency" min="1" max="90" value="7">
                                </div>
                                <button type="button" class="btn btn-primary" id="save-profile-btn">Save Profile</button>
                            </form>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-cog"></i> Preferences</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group toggle">
                                <label for="insights-enabled">Enable Personalized Insights</label>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="insights-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </div>
                            </div>
                            <div class="form-group toggle">
                                <label for="check-in-enabled">Enable Daily Check-ins</label>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="check-in-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </div>
                            </div>
                            <button type="button" class="btn btn-danger" id="clear-data-btn">Clear My Data</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Modals -->
    <div class="modal" id="log-data-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="log-modal-title">Log Health Data</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label id="log-modal-label">Value</label>
                    <input type="number" id="log-modal-value" step="0.1">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="log-modal-cancel">Cancel</button>
                <button class="btn btn-primary" id="log-modal-save">Save</button>
            </div>
        </div>
    </div>

    <div class="modal" id="notification-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="notification-title">Notification</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p id="notification-message"></p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="notification-ok">OK</button>
            </div>
        </div>
    </div>

    <div class="modal" id="confirm-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="confirm-title">Confirm Action</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p id="confirm-message">Are you sure you want to proceed?</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
                <button class="btn btn-danger" id="confirm-ok">Confirm</button>
            </div>
        </div>
    </div>

    <!-- Loading the JS files -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js"></script>
    <script src="app.js"></script>
</body>
</html>