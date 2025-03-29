// neurosense-integration.js
// Example of integrating the NeuroSense components together

const { NeuroSenseTrainingSystem, OrbTrainingAdapter } = require('./neurosense-training-system');
const { chatGptService } = require('./src/services/conversation/chatGptService');
const readline = require('readline');
const chalk = require('chalk');
const boxen = require('boxen');
const path = require('path');
const fs = require('fs');

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const USER_PROFILE_PATH = path.join(DATA_DIR, 'user_profile.json');
const ASSESSMENT_HISTORY_PATH = path.join(DATA_DIR, 'assessment_history.json');
const BIOMETRIC_HISTORY_PATH = path.join(DATA_DIR, 'biometric_history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize the training system
const trainingSystem = new NeuroSenseTrainingSystem({
  dataDir: DATA_DIR
});

// Initialize the Orb adapter with the chatbot service
const orbAdapter = new OrbTrainingAdapter(trainingSystem, chatGptService);

// Load user data
let userProfile = {};
let assessmentHistory = [];
let biometricHistory = [];

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

// Add biometric reading and correlate with mental state
const addBiometricReading = (type, value, mentalState = null) => {
  const reading = {
    type,
    value,
    source: 'manual',
    timestamp: new Date().toISOString()
  };
  
  biometricHistory.push(reading);
  
  // If mental state is provided, record the correlation for training
  if (mentalState) {
    orbAdapter.recordPhysiologicalData(type, value, mentalState);
  }
  
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
  
  // Record the mental state based on assessment
  let mentalState = null;
  
  if (type === 'PHQ-9') {
    mentalState = score >= 10 ? 'depression' : 'non-depression';
  } else if (type === 'GAD-7') {
    mentalState = score >= 10 ? 'anxiety' : 'non-anxiety';
  }
  
  // Update recent biometrics with mental state for learning
  const recentBiometrics = biometricHistory
    .filter(reading => {
      // Get readings from the last 24 hours
      const readingDate = new Date(reading.timestamp);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return readingDate >= oneDayAgo;
    });
  
  // Record correlations for each recent biometric reading
  if (mentalState) {
    recentBiometrics.forEach(reading => {
      orbAdapter.recordPhysiologicalData(reading.type, reading.value, mentalState);
    });
  }
  
  saveUserData();
  return result;
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function for yes/no questions
const askYesNoQuestion = async (question) => {
  return new Promise((resolve) => {
    rl.question(chalk.cyan(`\n${question} (yes/no): `), (answer) => {
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
};

// Process a message through the Orb with training
const processMessage = async (message) => {
  console.log(chalk.cyan(`You: ${message}`));
  
  try {
    // Get enhanced profile for context
    const enhancedProfile = {
      ...userProfile,
      recentAssessments: assessmentHistory.slice(-3),
      recentBiometrics: biometricHistory.slice(-10)
    };
    
    // Process the message
    const { text, conversationId } = await orbAdapter.processMessage(message, enhancedProfile);
    
    // Display the response
    console.log(
      boxen(chalk.white(text), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#D76D77',
        backgroundColor: '#1E1E1E'
      })
    );
    
    // Ask for feedback (in a real app, this could be a button or reaction)
    if (conversationId && Math.random() < 0.3) { // Only ask sometimes to avoid fatigue
      const isHelpful = await askYesNoQuestion("Was this response helpful?");
      
      // Process the feedback
      orbAdapter.processFeedback(conversationId, isHelpful);
      
      if (!isHelpful) {
        rl.question(chalk.cyan("How could the response be improved? "), (feedback) => {
          orbAdapter.processFeedback(conversationId, isHelpful, feedback);
        });
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
    console.log(
      boxen(chalk.white("I'm having trouble processing your message. Could you try again?"), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#FF4B2B',
        backgroundColor: '#1E1E1E'
      })
    );
  }
};

// Example usage in a simple console application
const runDemo = async () => {
  // Load existing user data
  loadUserData();
  
  // Initialize chatGPT service
  await chatGptService.initialize();
  
  console.log(chalk.bold('\nNeuroSense Training System Demo\n'));
  console.log(chalk.white('This demonstrates how the Orb learns from interactions and biometric correlations.'));
  console.log(chalk.white('Type "exit" to quit at any time.\n'));
  
  // If no profile yet, collect basic info
  if (!userProfile.name) {
    console.log(chalk.yellow('Let\'s set up your profile first.'));
    
    userProfile.name = await new Promise((resolve) => {
      rl.question(chalk.cyan('What\'s your name? '), (answer) => {
        resolve(answer || 'User');
      });
    });
    
    userProfile.age = await new Promise((resolve) => {
      rl.question(chalk.cyan('What\'s your age? '), (answer) => {
        const num = parseInt(answer);
        resolve(isNaN(num) ? null : num);
      });
    });
    
    saveUserData();
  }
  
  // Log some example biometric data if none exists
  if (biometricHistory.length === 0) {
    console.log(chalk.yellow('\nLogging some sample biometric data for demonstration.'));
    
    // Heart rate examples
    addBiometricReading('heartRate', 72);
    addBiometricReading('heartRate', 75);
    
    // Sleep examples
    addBiometricReading('sleepHours', 7.5);
    addBiometricReading('sleepHours', 6.8);
    
    console.log(chalk.green('Sample data has been added.'));
  }
  
  // Welcome message
  console.log(chalk.green(`\nWelcome, ${userProfile.name || 'User'}!`));
  console.log(chalk.white('You can chat with the Orb assistant, and it will learn from your interactions.'));
  console.log(chalk.white('The system also correlates your biometric data with your mental state.'));
  console.log(chalk.white('This helps Orb provide more personalized responses over time.'));
  
  // Start the conversation loop
  const promptUser = () => {
    rl.question(chalk.magenta('\nNeuroSense > '), async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log(chalk.blue('\nThank you for using NeuroSense. Take care!\n'));
        rl.close();
        process.exit(0);
      } else if (input.toLowerCase().startsWith('log ')) {
        // Handle log command: log [metric] [value] [mental state]
        const parts = input.split(' ');
        
        if (parts.length >= 3) {
          const metric = parts[1].toLowerCase();
          const value = parseFloat(parts[2]);
          const mentalState = parts.length > 3 ? parts.slice(3).join(' ').toLowerCase() : null;
          
          if (!isNaN(value)) {
            if (metric === 'heart' || metric === 'heartrate') {
              addBiometricReading('heartRate', value, mentalState);
              console.log(chalk.green(`Logged heart rate: ${value} bpm ${mentalState ? `with mental state: ${mentalState}` : ''}`));
            } else if (metric === 'sleep') {
              addBiometricReading('sleepHours', value, mentalState);
              console.log(chalk.green(`Logged sleep: ${value} hours ${mentalState ? `with mental state: ${mentalState}` : ''}`));
            } else {
              console.log(chalk.yellow('Unknown metric. Try "heart" or "sleep".'));
            }
          } else {
            console.log(chalk.yellow('Invalid value. Please provide a number.'));
          }
        } else {
          console.log(chalk.yellow('Usage: log [metric] [value] [optional: mental state]'));
        }
        
        promptUser();
      } else {
        // Process regular message
        await processMessage(input);
        promptUser();
      }
    });
  };
  
  promptUser();
};

// Run the demo
runDemo().catch(error => {
  console.error('Error in demo:', error);
  process.exit(1);
});