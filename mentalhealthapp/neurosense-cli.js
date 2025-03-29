#!/usr/bin/env node

// neurosense-cli.js
// NeuroSense Mental Health Companion
// Featuring personalized assessments and biometric monitoring

// Required modules
require('dotenv').config();
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const gradient = require('gradient-string');
const boxen = require('boxen');
const fs = require('fs');
const path = require('path');
const { chatGptService } = require('./src/services/conversation/chatGptService');
const { conversationStore } = require('./src/services/conversation/conversationStore');

// Data storage path
const DATA_DIR = path.join(__dirname, 'data');
const USER_PROFILE_PATH = path.join(DATA_DIR, 'user_profile.json');
const ASSESSMENT_HISTORY_PATH = path.join(DATA_DIR, 'assessment_history.json');
const BIOMETRIC_HISTORY_PATH = path.join(DATA_DIR, 'biometric_history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// PHQ-9 and GAD-7 Questionnaires
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

// User profile (loaded from storage or defaults)
let userProfile = {
  name: '',
  age: null,
  conditions: [],
  lastAssessment: null,
  assessmentFrequency: 7, // days
  baselineHeartRate: 72,
  baselineSleep: 7.5,
  preferredCheckInTime: '09:00',
  checkInFrequency: 'daily',
  insightsEnabled: true
};

// Assessment history
let assessmentHistory = [];

// Biometric history 
let biometricHistory = [];

// Load existing data
const loadUserData = () => {
  try {
    if (fs.existsSync(USER_PROFILE_PATH)) {
      userProfile = JSON.parse(fs.readFileSync(USER_PROFILE_PATH, 'utf8'));
      console.log(chalk.green('User profile loaded'));
    }
    
    if (fs.existsSync(ASSESSMENT_HISTORY_PATH)) {
      assessmentHistory = JSON.parse(fs.readFileSync(ASSESSMENT_HISTORY_PATH, 'utf8'));
      console.log(chalk.green('Assessment history loaded'));
    }
    
    if (fs.existsSync(BIOMETRIC_HISTORY_PATH)) {
      biometricHistory = JSON.parse(fs.readFileSync(BIOMETRIC_HISTORY_PATH, 'utf8'));
      console.log(chalk.green('Biometric history loaded'));
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

// Save user data
const saveUserData = () => {
  try {
    fs.writeFileSync(USER_PROFILE_PATH, JSON.stringify(userProfile, null, 2));
    fs.writeFileSync(ASSESSMENT_HISTORY_PATH, JSON.stringify(assessmentHistory, null, 2));
    fs.writeFileSync(BIOMETRIC_HISTORY_PATH, JSON.stringify(biometricHistory, null, 2));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Add biometric reading
const addBiometricReading = (type, value, source = 'manual') => {
  const reading = {
    type,
    value,
    source,
    timestamp: new Date().toISOString()
  };
  biometricHistory.push(reading);
  saveUserData();
  return reading;
};

// Add assessment result
const addAssessmentResult = (type, score, assessment, responses) => {
  const result = {
    type,
    score,
    assessment,
    responses,
    timestamp: new Date().toISOString()
  };
  assessmentHistory.push(result);
  userProfile.lastAssessment = new Date().toISOString();
  saveUserData();
  return result;
};

// Get baseline metrics for comparison
const getBaselines = () => {
  // Calculate 7-day averages for relevant metrics
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekTimestamp = lastWeek.toISOString();
  
  // Heart rate baseline
  const recentHeartRates = biometricHistory
    .filter(reading => reading.type === 'heartRate' && reading.timestamp > lastWeekTimestamp)
    .map(reading => reading.value);
  
  if (recentHeartRates.length > 0) {
    const avgHeartRate = recentHeartRates.reduce((sum, val) => sum + val, 0) / recentHeartRates.length;
    userProfile.baselineHeartRate = Math.round(avgHeartRate);
  }
  
  // Sleep baseline
  const recentSleep = biometricHistory
    .filter(reading => reading.type === 'sleepHours' && reading.timestamp > lastWeekTimestamp)
    .map(reading => reading.value);
  
  if (recentSleep.length > 0) {
    const avgSleep = recentSleep.reduce((sum, val) => sum + val, 0) / recentSleep.length;
    userProfile.baselineSleep = avgSleep.toFixed(1);
  }
  
  saveUserData();
  return {
    heartRate: userProfile.baselineHeartRate,
    sleepHours: userProfile.baselineSleep
  };
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fancy UI elements
const UI = {
  // Gradients for app styling
  titleGradient: gradient(['#3A1C71', '#D76D77', '#FFAF7B']),
  healthGradient: gradient(['#00B09B', '#96C93D']),
  alertGradient: gradient(['#FF416C', '#FF4B2B']),
  
  // Display the app title in fancy ASCII art
  showTitle: () => {
    console.clear();
    console.log(
      UI.titleGradient(
        figlet.textSync('NeuroSense', {
          font: 'Standard',
          horizontalLayout: 'fitted'
        })
      )
    );
    console.log(
      boxen(chalk.bold('Your Personalized Mental Wellness Companion'), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#D76D77'
      })
    );
  },
  
  // Display user guidance
  showCommands: () => {
    console.log(
      boxen(
        chalk.cyan.bold('Available Commands:') + '\n\n' +
        chalk.yellow('• dashboard') + chalk.white(' - View your wellness dashboard\n') +
        chalk.yellow('• log [metric] [value]') + chalk.white(' - Log health data (e.g., log sleep 7.5)\n') + 
        chalk.yellow('• assess') + chalk.white(' - Take a mental health assessment\n') +
        chalk.yellow('• insights') + chalk.white(' - Get personalized insights\n') +
        chalk.yellow('• help') + chalk.white(' - Show this guide\n') +
        chalk.yellow('• clear') + chalk.white(' - Clear conversation history\n') +
        chalk.yellow('• profile') + chalk.white(' - View or update your profile\n') +
        chalk.yellow('• exit') + chalk.white(' - Exit the application'),
        {
          padding: 1,
          margin: { top: 1, bottom: 1 },
          borderStyle: 'round',
          borderColor: '#3A1C71'
        }
      )
    );
  },
  
  // Show notification popup
  showNotification: (title, message, color = '#00B4D8') => {
    console.log('\n');
    console.log(
      boxen(
        chalk.white.bold(title) + '\n\n' +
        chalk.white(message),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: color,
          backgroundColor: '#1E1E1E'
        }
      )
    );
  },
  
  // Display dashboard with user data
  showDashboard: () => {
    // Get latest assessment
    const latestAssessment = assessmentHistory.length > 0 
      ? assessmentHistory[assessmentHistory.length - 1] 
      : null;
    
    // Get latest biometrics
    const latestHeartRate = biometricHistory
      .filter(reading => reading.type === 'heartRate')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
    
    const latestSleep = biometricHistory
      .filter(reading => reading.type === 'sleepHours')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
    
    // Calculate days since last assessment
    const daysSinceAssessment = userProfile.lastAssessment 
      ? Math.floor((new Date() - new Date(userProfile.lastAssessment)) / (1000 * 60 * 60 * 24))
      : null;
    
    // Build dashboard
    console.log(
      boxen(
        chalk.bold.white('NEUROSENSE WELLNESS DASHBOARD') + '\n\n' +
        chalk.cyan.bold(`Welcome back, ${userProfile.name || 'User'}!`) + '\n' +
        chalk.white(`Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`) + '\n\n' +
        
        chalk.yellow.bold('WELLNESS SNAPSHOT') + '\n' +
        chalk.white('─'.repeat(50)) + '\n' +
        (latestAssessment 
          ? chalk.white(`Mental Status: ${latestAssessment.assessment} (${latestAssessment.type}: ${latestAssessment.score})`) 
          : chalk.gray('Mental Status: No assessments recorded')) + '\n' +
        (latestHeartRate 
          ? chalk.white(`Heart Rate: ${latestHeartRate.value} bpm (${latestHeartRate.value > userProfile.baselineHeartRate + 10 ? chalk.red('ELEVATED') : chalk.green('NORMAL')})`) 
          : chalk.gray('Heart Rate: No data recorded')) + '\n' +
        (latestSleep 
          ? chalk.white(`Sleep: ${latestSleep.value} hours (${latestSleep.value < userProfile.baselineSleep - 1 ? chalk.red('BELOW AVERAGE') : chalk.green('NORMAL')})`) 
          : chalk.gray('Sleep: No data recorded')) + '\n\n' +
        
        chalk.yellow.bold('RECOMMENDATIONS') + '\n' +
        chalk.white('─'.repeat(50)) + '\n' +
        (daysSinceAssessment === null || daysSinceAssessment >= userProfile.assessmentFrequency
          ? chalk.white(`• It's been ${daysSinceAssessment === null ? 'a while' : daysSinceAssessment + ' days'} since your last assessment. Consider taking a new one.`)
          : chalk.white(`• Next assessment recommended in ${userProfile.assessmentFrequency - daysSinceAssessment} days.`)) + '\n' +
        (latestSleep && latestSleep.value < userProfile.baselineSleep - 1
          ? chalk.white(`• Your sleep is below your baseline. Consider sleep improvement techniques.`)
          : '') + '\n' +
        (latestHeartRate && latestHeartRate.value > userProfile.baselineHeartRate + 10
          ? chalk.white(`• Your heart rate is elevated. Consider relaxation techniques.`)
          : '') + '\n\n' +
          
        chalk.white(`Type ${chalk.cyan('assess')} to take an assessment or ${chalk.cyan('insights')} for personalized guidance.`),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#3A1C71',
          backgroundColor: '#1E1E1E'
        }
      )
    );
  },
  
  // ChatGPT response display
  showAssistantMessage: (message) => {
    console.log(
      boxen(chalk.white(message), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#D76D77',
        backgroundColor: '#1E1E1E'
      })
    );
  },
  
  // User message display
  showUserMessage: (message) => {
    console.log(chalk.cyan(`You: ${message}`));
  },
  
  // Display questionnaire intro
  askToStartQuestionnaire: async () => {
    return new Promise((resolve) => {
      console.log(
        boxen(
          chalk.white.bold("Health Assessment") + '\n\n' +
          chalk.white("Regular assessments help me understand your mental health patterns and provide better support.") + '\n\n' +
          chalk.white("I'd like to run a brief questionnaire about how you've been feeling lately.") + '\n' +
          chalk.white("This will only take about 2-3 minutes. Your responses are private and help me personalize support for you."),
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: '#3A1C71',
            backgroundColor: '#1E1E1E'
          }
        )
      );
      
      rl.question(chalk.cyan('\nWould you like to take an assessment now? (yes/no): '), (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  },
  
  // Choose assessment type
  chooseAssessmentType: async () => {
    return new Promise((resolve) => {
      // Look at history to recommend assessment type
      const recommendedType = getRecommendedAssessmentType();
      
      console.log(chalk.white.bold("\nWhich assessment would you like to take?"));
      console.log(chalk.white(`1. PHQ-9 (Depression Assessment)${recommendedType === 'PHQ-9' ? chalk.green(' [Recommended]') : ''}`));
      console.log(chalk.white(`2. GAD-7 (Anxiety Assessment)${recommendedType === 'GAD-7' ? chalk.green(' [Recommended]') : ''}`));
      
      rl.question(chalk.cyan('Enter your choice (1 or 2): '), (answer) => {
        if (answer === '1') resolve('PHQ-9');
        else if (answer === '2') resolve('GAD-7');
        else {
          console.log(chalk.yellow(`Default to recommended assessment: ${recommendedType}`));
          resolve(recommendedType);
        }
      });
    });
  },
  
  // Display questionnaire form with organic approach
  runQuestionnaire: async (type) => {
    console.log(
      boxen(
        chalk.white.bold(`${type} Assessment`) + '\n\n' +
        chalk.white(`Let's talk about how you've been feeling over the past two weeks.`) + '\n' +
        chalk.white(`For each question, please rate how often you've been bothered by the following problems:`) + '\n\n' +
        chalk.gray('0 - Not at all\n1 - Several days\n2 - More than half the days\n3 - Nearly every day'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#D76D77',
          backgroundColor: '#1E1E1E'
        }
      )
    );

    const questions = questionnaires[type];
    const responses = [];

    for (let i = 0; i < questions.length; i++) {
      // Add transition text to make it feel more conversational
      if (i === Math.floor(questions.length / 2)) {
        console.log(chalk.gray("\nWe're halfway there. You're doing great."));
      }
      
      const answer = await new Promise(resolve => {
        // Format the question more conversationally
        let questionText = `\n${i+1}. Over the last two weeks, how often have you been bothered by: ${questions[i]}`;
        
        rl.question(chalk.cyan(questionText + '\n   0-3: '), (answer) => {
          const num = parseInt(answer);
          if (isNaN(num) || num < 0 || num > 3) {
            console.log(chalk.red('Please enter a valid score (0-3)'));
            resolve(0); // Default to 0 for invalid inputs
          } else {
            // Add feedback based on answer
            if (num >= 2) {
              console.log(chalk.gray("I see. That sounds challenging."));
            }
            resolve(num);
          }
        });
      });
      responses.push(answer);
    }

    const total = responses.reduce((sum, score) => sum + score, 0);
    let severity;
    
    if (type === "PHQ-9") {
      if (total >= 20) severity = "Severe depression";
      else if (total >= 15) severity = "Moderately severe depression";
      else if (total >= 10) severity = "Moderate depression";
      else if (total >= 5) severity = "Mild depression";
      else severity = "None to minimal depression";
    } else { // GAD-7
      if (total >= 15) severity = "Severe anxiety";
      else if (total >= 10) severity = "Moderate anxiety";
      else if (total >= 5) severity = "Mild anxiety";
      else severity = "None to minimal anxiety";
    }
    
    // Store assessment result
    addAssessmentResult(type, total, severity, responses);
    
    console.log(
      boxen(
        chalk.white.bold(`${type} Results`) + '\n\n' +
        chalk.white(`Thank you for completing the assessment. Here's what I understand:`) + '\n\n' +
        chalk.yellow(`Total Score: ${total}`) + '\n' +
        chalk.yellow(`Assessment: ${severity}`) + '\n\n' +
        chalk.white('I\'ll use this information to provide more personalized support.') +
        (total >= 10 ? '\n\n' + chalk.yellow('Note: Your score suggests significant symptoms. Consider discussing these results with a healthcare professional.') : ''),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#D76D77',
          backgroundColor: '#1E1E1E'
        }
      )
    );
    
    // If high score detected, offer immediate support
    if ((type === "GAD-7" && total >= 15) || (type === "PHQ-9" && total >= 20)) {
      await offerSupportForHighScore(type, total);
    }
    
    return { score: total, assessment: severity, responses };
  },
  
  // Show insights based on user data
  showInsights: async () => {
    // Get data to analyze
    const assessments = assessmentHistory.slice(-5); // Last 5 assessments
    const recentBiometrics = biometricHistory.slice(-20); // Last 20 biometric readings
    
    if (assessments.length === 0 && recentBiometrics.length === 0) {
      UI.showNotification(
        "Not Enough Data", 
        "I don't have enough information yet to provide personalized insights. Try logging some health data or completing an assessment.",
        "#D76D77"
      );
      return;
    }
    
    // Prepare context for ChatGPT
    const context = {
      userProfile,
      assessments,
      biometrics: recentBiometrics,
      baselines: getBaselines()
    };
    
    // Tell user we're generating insights
    console.log(chalk.gray("\nAnalyzing your data to generate personalized insights..."));
    
    // Generate insights using ChatGPT
    const insightPrompt = 
      `Based on the user's data, provide 3-4 personalized insights and recommendations about their mental health patterns. Be specific but compassionate.
      
      USER PROFILE:
      - Name: ${userProfile.name || 'User'}
      - Age: ${userProfile.age || 'Unknown'}
      - Conditions: ${userProfile.conditions.join(', ') || 'None specified'}
      
      ASSESSMENT HISTORY:
      ${assessments.map(a => `- ${new Date(a.timestamp).toLocaleDateString()}: ${a.type} score ${a.score} (${a.assessment})`).join('\n')}
      
      RECENT BIOMETRICS:
      - Heart rate baseline: ${context.baselines.heartRate} bpm
      - Sleep baseline: ${context.baselines.sleepHours} hours
      ${recentBiometrics.slice(-5).map(b => `- ${new Date(b.timestamp).toLocaleDateString()}: ${b.type} = ${b.value}`).join('\n')}
      
      FORMAT YOUR RESPONSE WITH:
      1. Brief summary of patterns
      2. 3-4 specific insights with personalized recommendations
      3. One gentle, encouraging statement`;
    
    try {
      const insights = await chatGptService.sendMessage(insightPrompt, {
        userProfile,
        healthData: context.baselines
      });
      
      console.log(
        boxen(
          chalk.white.bold("Your Personalized Insights") + '\n\n' +
          chalk.white(insights),
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: '#3A1C71',
            backgroundColor: '#1E1E1E',
            width: 80
          }
        )
      );
    } catch (error) {
      console.error('Error generating insights:', error);
      UI.showNotification(
        "Error Generating Insights", 
        "I encountered a problem while analyzing your data. Let's try again later.",
        "#FF4B2B"
      );
    }
  },
  
  // Profile management UI
  showProfileManagement: async () => {
    console.log(
      boxen(
        chalk.white.bold("Your Profile") + '\n\n' +
        chalk.white('Name: ') + chalk.cyan(userProfile.name || 'Not set') + '\n' +
        chalk.white('Age: ') + chalk.cyan(userProfile.age || 'Not set') + '\n' +
        chalk.white('Known conditions: ') + chalk.cyan(userProfile.conditions.length > 0 ? userProfile.conditions.join(', ') : 'None specified') + '\n' +
        chalk.white('Baseline heart rate: ') + chalk.cyan(userProfile.baselineHeartRate + ' bpm') + '\n' +
        chalk.white('Baseline sleep: ') + chalk.cyan(userProfile.baselineSleep + ' hours') + '\n' +
        chalk.white('Assessment frequency: ') + chalk.cyan(`Every ${userProfile.assessmentFrequency} days`) + '\n' +
        chalk.white('Check-in frequency: ') + chalk.cyan(userProfile.checkInFrequency),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#D76D77',
          backgroundColor: '#1E1E1E'
        }
      )
    );
    
    const updateProfile = await askYesNoQuestion("Would you like to update your profile?");
    
    if (updateProfile) {
      await updateUserProfile();
    }
  },
  
  // Command prompt
  showPrompt: () => {
    process.stdout.write(UI.titleGradient('NeuroSense > '));
  }
};

// Helper function for yes/no questions
const askYesNoQuestion = async (question) => {
  return new Promise((resolve) => {
    rl.question(chalk.cyan(`\n${question} (yes/no): `), (answer) => {
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
};

// Update user profile
const updateUserProfile = async () => {
  console.log(chalk.cyan.bold("\nUpdating your profile:"));
  
  const name = await new Promise((resolve) => {
    rl.question(chalk.cyan(`Name (${userProfile.name || 'Not set'}): `), (answer) => {
      resolve(answer || userProfile.name);
    });
  });
  
  const age = await new Promise((resolve) => {
    rl.question(chalk.cyan(`Age (${userProfile.age || 'Not set'}): `), (answer) => {
      const num = parseInt(answer);
      resolve(isNaN(num) ? userProfile.age : num);
    });
  });
  
  const conditionsStr = await new Promise((resolve) => {
    rl.question(chalk.cyan(`Known conditions (${userProfile.conditions.join(', ') || 'None'}): `), (answer) => {
      resolve(answer || userProfile.conditions.join(', '));
    });
  });
  
  userProfile.name = name;
  userProfile.age = age;
  userProfile.conditions = conditionsStr ? conditionsStr.split(',').map(c => c.trim()) : [];
  
  const frequencyStr = await new Promise((resolve) => {
    rl.question(chalk.cyan(`Assessment frequency in days (${userProfile.assessmentFrequency}): `), (answer) => {
      const num = parseInt(answer);
      resolve(isNaN(num) ? userProfile.assessmentFrequency : num);
    });
  });
  
  userProfile.assessmentFrequency = parseInt(frequencyStr);
  
  console.log(chalk.green("\nProfile updated successfully!"));
  saveUserData();
};

// Get recommended assessment type based on history
const getRecommendedAssessmentType = () => {
  // If no history, recommend GAD-7 (shorter)
  if (assessmentHistory.length === 0) {
    return 'GAD-7';
  }
  
  // Find most recent of each type
  const lastPhq9 = assessmentHistory
    .filter(a => a.type === 'PHQ-9')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  
  const lastGad7 = assessmentHistory
    .filter(a => a.type === 'GAD-7')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  
  // If one type has never been taken, recommend it
  if (!lastPhq9) return 'PHQ-9';
  if (!lastGad7) return 'GAD-7';
  
  // If one type has a higher score relative to its maximum, recommend it
  const phq9Severity = lastPhq9.score / 27; // PHQ-9 max score
  const gad7Severity = lastGad7.score / 21; // GAD-7 max score
  
  return phq9Severity > gad7Severity ? 'PHQ-9' : 'GAD-7';
};

// Offer immediate support for high scores
const offerSupportForHighScore = async (type, score) => {
  // Different message based on assessment type
  const message = type === 'PHQ-9' 
    ? "Your depression assessment score is in the severe range. I'm here to help."
    : "Your anxiety assessment score is in the severe range. I'm here to help.";
  
  UI.showNotification(
    "Support Check-In",
    message + " Would you like some immediate coping strategies?",
    "#FF4B2B"
  );
  
  const wantsSupport = await askYesNoQuestion("Would you like some immediate coping strategies?");
  
  if (wantsSupport) {
    // Use ChatGPT to generate personalized coping strategies
    const supportPrompt = 
      `The user has scored ${score} on the ${type} assessment indicating ${type === 'PHQ-9' ? 'severe depression' : 'severe anxiety'}.
      Please provide 3-4 immediate, evidence-based coping strategies that they can use right now.
      Keep your response supportive and compassionate, focusing on simple, actionable techniques.
      Include a reminder that these are supplemental to professional help, not a replacement.
      
      USER PROFILE:
      - Name: ${userProfile.name || 'User'}
      - Age: ${userProfile.age || 'Unknown'}
      - Conditions: ${userProfile.conditions.join(', ') || 'None specified'}`;
    
    try {
      const strategies = await chatGptService.sendMessage(supportPrompt);
      UI.showAssistantMessage(strategies);
    } catch (error) {
      console.error('Error generating support strategies:', error);
      UI.showAssistantMessage(
        "I'm sorry I'm having trouble generating specific strategies right now. However, deep breathing, grounding exercises, and reaching out to a trusted person are always good options during difficult moments. Remember that professional support is important."
      );
    }
  }
};

// Log biometric data
const logBiometricData = async (type, value) => {
  // Add the reading
  const reading = addBiometricReading(type, value);
  
  // Acknowledge
  console.log(chalk.green(`\n✓ Logged ${type}: ${value}`));
  
  // Check if there's anything concerning
  let concernMessage = null;
  
  if (type === 'heartRate' && value > userProfile.baselineHeartRate + 15) {
    concernMessage = "Your heart rate is significantly above your baseline. This could indicate stress or anxiety.";
  } else if (type === 'sleepHours' && value < userProfile.baselineSleep - 1.5) {
    concernMessage = "Your sleep is well below your baseline. This might impact your mental wellbeing.";
  }
  
  if (concernMessage) {
    UI.showNotification("Health Alert", concernMessage, "#FF4B2B");
  }
  
  // Update baselines if we have enough data
  getBaselines();
};

// Regular message handling
const sendMessage = async (text) => {
  try {
    UI.showUserMessage(text);
    
    // Use profile and health data for context
    const response = await chatGptService.sendMessage(text, {
      userProfile,
      healthData: {
        heartRate: userProfile.baselineHeartRate,
        heartRateBaseline: userProfile.baselineHeartRate,
        sleepHours: userProfile.baselineSleep,
        sleepBaseline: userProfile.baselineSleep
      }
    });
    
    UI.showAssistantMessage(response);
  } catch (error) {
    console.error('Error sending message:', error);
    UI.showAssistantMessage("I'm having trouble processing your message. Could you try again?");
  }
};

// Handle assessment command
const handleAssessment = async () => {
  const willTakeAssessment = await UI.askToStartQuestionnaire();
  
  if (willTakeAssessment) {
    const assessmentType = await UI.chooseAssessmentType();
    await UI.runQuestionnaire(assessmentType);
    
    // Offer follow-up based on results
    const latestAssessment = assessmentHistory[assessmentHistory.length - 1];
    
    if (latestAssessment.score >= 10) {
      // Get a personalized response based on the assessment
      const followUpPrompt = 
        `The user just completed a ${latestAssessment.type} assessment with a score of ${latestAssessment.score} (${latestAssessment.assessment}).
        Please provide a personalized, supportive response that:
        1. Acknowledges their feelings without being clinical
        2. Offers 1-2 simple suggestions relevant to their result
        3. Assures them you're available to talk more when they need it
        
        User profile context:
        - Name: ${userProfile.name || 'User'}
        - Conditions: ${userProfile.conditions.join(', ') || 'None specified'}
        
        Keep your response warm and conversational, not like a medical report.`;
      
      try {
        const followUp = await chatGptService.sendMessage(followUpPrompt);
        UI.showAssistantMessage(followUp);
      } catch (error) {
        console.error('Error generating follow-up:', error);
      }
    }
  } else {
    console.log(chalk.gray("\nThat's fine. We can do an assessment another time when you're ready."));
  }
};

// Parse and handle log commands
const handleLogCommand = async (input) => {
  // Format: log [metric] [value]
  const parts = input.split(' ');
  
  if (parts.length < 3) {
    console.log(chalk.yellow("\nPlease specify what to log and the value. For example: log sleep 7.5"));
    return;
  }
  
  const metric = parts[1].toLowerCase();
  const value = parseFloat(parts[2]);
  
  if (isNaN(value)) {
    console.log(chalk.yellow("\nPlease provide a valid number. For example: log sleep 7.5"));
    return;
  }
  
  // Handle different metrics
  if (metric === 'sleep' || metric === 'sleephours') {
    await logBiometricData('sleepHours', value);
  } else if (metric === 'heart' || metric === 'heartrate' || metric === 'hr') {
    await logBiometricData('heartRate', value);
  } else if (metric === 'stress' || metric === 'stresslevel') {
    await logBiometricData('stressLevel', value);
  } else if (metric === 'mood') {
    await logBiometricData('moodScore', value);
  } else {
    console.log(chalk.yellow("\nUnknown metric. You can log: sleep, heartrate, stress, or mood"));
  }
};

// Check if user needs onboarding
const checkFirstTimeUser = async () => {
  if (!userProfile.name) {
    console.log(chalk.cyan.bold("\nIt looks like this is your first time using NeuroSense!"));
    console.log(chalk.white("Let's take a moment to personalize your experience."));
    
    await updateUserProfile();
    
    console.log(chalk.green.bold("\nThanks for setting up your profile!"));
    console.log(chalk.white("NeuroSense will use this information to provide more personalized support."));
    console.log(chalk.white("All your data is stored locally on your device for privacy."));
    
    return true;
  }
  return false;
};

// Main CLI function
const startCLI = async () => {
  // Load existing user data
  loadUserData();
  
  // Initialize services
  try {
    console.log(chalk.yellow('Initializing NeuroSense services...'));
    await chatGptService.initialize();
    console.log(chalk.green('✓ Services initialized successfully.'));
  } catch (error) {
    console.error('Error initializing services:', error);
    console.log(chalk.red('⚠ Error initializing AI services. Some features may be limited.'));
  }

  // Show the title
  UI.showTitle();
  
  // Check for first time user
  const isFirstTimeUser = await checkFirstTimeUser();
  
  if (!isFirstTimeUser) {
    // Show dashboard on startup
    UI.showDashboard();
  }
  
  // Show commands
  UI.showCommands();

  // Get initial welcome message
  let welcomeMessage = isFirstTimeUser
    ? `Hi ${userProfile.name || 'there'}! I'm your NeuroSense companion. I'm here to help monitor your mental wellbeing and provide personalized insights. Type 'help' anytime to see available commands.`
    : `Welcome back, ${userProfile.name || 'there'}! How can I help you today?`;
  
  UI.showAssistantMessage(welcomeMessage);

  // Start the prompt loop
  const promptUser = () => {
    UI.showPrompt();
    rl.question('', async (input) => {
      const lowerInput = input.toLowerCase().trim();
      
      // Handle commands
      if (lowerInput === 'exit') {
        console.log(chalk.blue('\nThank you for using NeuroSense. Take care of yourself!\n'));
        rl.close();
        process.exit(0);
      } else if (lowerInput === 'help') {
        UI.showCommands();
        promptUser();
      } else if (lowerInput === 'clear') {
        await conversationStore.clearConversation();
        console.log(chalk.green('Conversation history cleared.'));
        promptUser();
      } else if (lowerInput === 'dashboard') {
        UI.showDashboard();
        promptUser();
      } else if (lowerInput === 'assess') {
        await handleAssessment();
        promptUser();
      } else if (lowerInput === 'insights') {
        await UI.showInsights();
        promptUser();
      } else if (lowerInput === 'profile') {
        await UI.showProfileManagement();
        promptUser();
      } else if (lowerInput.startsWith('log ')) {
        await handleLogCommand(lowerInput);
        promptUser();
      } else {
        // Regular message
        await sendMessage(input);
        promptUser();
      }
    });
  };

  // Start the conversation
  promptUser();
};

// Handle terminal resize
process.stdout.on('resize', () => {
  UI.showTitle();
});

// Start the CLI
startCLI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});