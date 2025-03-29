// mentalhealthcli.js
// Mental Health Companion Hackathon CLI Demo
// Focusing on panic attack detection via Google Fit data and questionnaires

// Required modules
require('dotenv').config();
const readline = require('readline');
const chalk = require('chalk'); // npm install chalk
const figlet = require('figlet'); // npm install figlet
const gradient = require('gradient-string'); // npm install gradient-string
const boxen = require('boxen'); // npm install boxen
const { chatGptService } = require('./src/services/conversation/chatGptService');
const { conversationStore } = require('./src/services/conversation/conversationStore');

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

// Panic attack metrics from the table
const healthMetrics = {
  normal: {
    heartRate: '70-80',
    respiratoryRate: '12-18',
    spO2: '97-100%',
    bloodPressure: '120/80',
    sleepDuration: '7-8 hours',
    sleepQuality: 'Normal',
    hrvValue: '40-60ms'
  },
  mild: {
    heartRate: '85-95',
    respiratoryRate: '18-20',
    spO2: '96-99%',
    bloodPressure: '125/82',
    sleepDuration: '6-7 hours',
    sleepQuality: 'Slight Restlessness',
    hrvValue: '30-40ms'
  },
  moderate: {
    heartRate: '115-135',
    respiratoryRate: '25-32',
    spO2: '94-96%',
    bloodPressure: '140/88',
    sleepDuration: '5-6 hours',
    sleepQuality: 'Frequent Arousals',
    hrvValue: '15-25ms'
  },
  severe: {
    heartRate: '130-160',
    respiratoryRate: '30-40',
    spO2: '92-95%',
    bloodPressure: '150/90',
    sleepDuration: '<5 hours',
    sleepQuality: 'Disturbed REM',
    hrvValue: '<20ms'
  }
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fancy UI elements
const UI = {
  // Gradients for app styling
  titleGradient: gradient(['#8A2BE2', '#FF69B4', '#87CEFA']),
  healthGradient: gradient(['#00FF00', '#FFFF00', '#FF0000']),
  
  // Display the app title in fancy ASCII art
  showTitle: () => {
    console.clear();
    console.log(
      UI.titleGradient(
        figlet.textSync('MindfulMonitor', {
          font: 'Standard',
          horizontalLayout: 'fitted'
        })
      )
    );
    console.log(
      boxen(chalk.bold('Mental Health Companion - Hackathon Demo'), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#8A2BE2'
      })
    );
  },
  
  // Display user guidance
  showGuide: () => {
    console.log(
      boxen(
        chalk.cyan.bold('Available Commands:') + '\n\n' +
        chalk.yellow('• <current_fit>') + chalk.white(' - Show your current Google Fit data\n') +
        chalk.yellow('• <panic>') + chalk.white(' - Simulate panic attack detection\n') +
        chalk.yellow('• <questionnaire>') + chalk.white(' - Take PHQ-9/GAD-7 assessment\n') +
        chalk.yellow('• <help>') + chalk.white(' - Show this guide\n') +
        chalk.yellow('• <clear>') + chalk.white(' - Clear conversation history\n') +
        chalk.yellow('• <exit>') + chalk.white(' - Exit the application'),
        {
          padding: 1,
          margin: { top: 1, bottom: 1 },
          borderStyle: 'round',
          borderColor: '#87CEFA'
        }
      )
    );
  },
  
  // Show notification popup
  showNotification: (title, message) => {
    console.log('\n');
    console.log(
      boxen(
        chalk.bgBlue.white.bold(' NOTIFICATION ') + '\n\n' +
        chalk.bold.white(title) + '\n' +
        chalk.white(message),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#00BFFF',
          backgroundColor: '#0000FF'
        }
      )
    );
    rl.question(chalk.blue.bold('\n• Tap to respond: '), () => {
      console.log(chalk.blue('Opening support session...\n'));
    });
  },
  
  // Display Google Fit health data
  showHealthData: (state = 'normal') => {
    const metrics = healthMetrics[state];
    const title = state === 'normal' ? 'Current Google Fit Data' : 
                 `Google Fit Data - ${state.toUpperCase()} PANIC ATTACK DETECTED`;
    const borderColor = state === 'normal' ? '#4CAF50' : '#FF0000';
    
    const content = 
      chalk.bold.white(title) + '\n\n' +
      chalk.yellow('Heart Rate: ') + chalk.white(`${metrics.heartRate} bpm\n`) +
      chalk.yellow('Respiratory Rate: ') + chalk.white(`${metrics.respiratoryRate} breaths/min\n`) +
      chalk.yellow('Blood Pressure: ') + chalk.white(`${metrics.bloodPressure} mmHg\n`) +
      chalk.yellow('SpO2: ') + chalk.white(`${metrics.spO2}\n`) +
      chalk.yellow('Sleep Duration: ') + chalk.white(`${metrics.sleepDuration}\n`) +
      chalk.yellow('Sleep Quality: ') + chalk.white(`${metrics.sleepQuality}\n`) +
      chalk.yellow('HRV: ') + chalk.white(`${metrics.hrvValue}\n`) +
      chalk.gray(`\nLast updated: ${new Date().toLocaleString()}`);
    
    console.log(
      boxen(content, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: borderColor
      })
    );
  },
  
  // ChatGPT response display
  showAssistantMessage: (message) => {
    console.log(
      boxen(chalk.magentaBright(message), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#9932CC'
      })
    );
  },
  
  // User message display
  showUserMessage: (message) => {
    console.log(chalk.cyan(`You: ${message}`));
  },
  
  // Display questionnaire form
  showQuestionnaire: async (type) => {
    console.log(
      boxen(
        chalk.white.bold(`${type} Questionnaire`) + '\n' +
        chalk.gray('Rate how often you have been bothered by the following problems over the last 2 weeks:') + '\n' +
        chalk.gray('0 - Not at all | 1 - Several days | 2 - More than half the days | 3 - Nearly every day\n'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#FF69B4'
        }
      )
    );

    const questions = questionnaires[type];
    const responses = [];

    for (let i = 0; i < questions.length; i++) {
      const answer = await new Promise(resolve => {
        rl.question(chalk.magentaBright(`${i+1}. ${questions[i]} (0-3): `), (answer) => {
          const num = parseInt(answer);
          if (isNaN(num) || num < 0 || num > 3) {
            console.log(chalk.red('Please enter a valid score (0-3)'));
            resolve(0); // Default to 0 for invalid inputs
          } else {
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
    
    console.log(
      boxen(
        chalk.white.bold(`${type} Results`) + '\n\n' +
        chalk.yellow(`Total Score: ${total}`) + '\n' +
        chalk.yellow(`Assessment: ${severity}`) + '\n\n' +
        chalk.white('This information will be shared with your Mental Health Companion.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#FF69B4'
        }
      )
    );
    
    // If high anxiety detected, trigger panic alert
    if ((type === "GAD-7" && total >= 15) || (type === "PHQ-9" && total >= 20)) {
      await simulatePanicAlert("severe");
    }
    
    return { score: total, assessment: severity };
  },
  
  // Command prompt
  showPrompt: () => {
    process.stdout.write(gradient(['#8A2BE2', '#FF69B4'])('> '));
  }
};

// Simulate a panic attack alert
const simulatePanicAlert = async (severity = 'severe') => {
  // Show Google Fit data for panic state
  UI.showHealthData(severity);
  
  // Show notification
  UI.showNotification(
    'Panic Attack Detected',
    'Abnormal biometric signals detected. Would you like assistance with managing your symptoms?'
  );
  
  // Get ChatGPT analysis
  const context = {
    healthData: {
      heartRate: 145,
      respiratoryRate: 35,
      oxygenSaturation: 93,
      bloodPressure: '150/90',
      hrv: 15,
      sleepQuality: 'Disturbed'
    },
    mentalState: 'panic'
  };
  
  const response = await sendContextualMessage(
    "I'm experiencing a severe panic attack with elevated heart rate, rapid breathing, and feeling like I might pass out.", 
    context
  );
};

// Send a message with health context
const sendContextualMessage = async (text, context) => {
  try {
    // Format the context for ChatGPT
    const healthData = {
      heartRate: context.healthData.heartRate,
      heartRateBaseline: 75,
      respiratoryRate: context.healthData.respiratoryRate,
      oxygenSaturation: context.healthData.oxygenSaturation,
      bloodPressure: context.healthData.bloodPressure,
      hrv: context.healthData.hrv,
      sleepQuality: context.healthData.sleepQuality,
      mentalState: context.mentalState
    };

    // Send to ChatGPT
    const response = await chatGptService.sendMessage(text, {
      healthData: healthData,
      userProfile: {
        name: 'User',
        conditions: ['anxiety', 'panic disorder']
      }
    });

    UI.showAssistantMessage(response);
    return response;
  } catch (error) {
    console.error('Error communicating with AI:', error);
    UI.showAssistantMessage(
      "I'm having trouble analyzing your health data right now. Let's focus on some immediate grounding techniques. " +
      "Try taking slow, deep breaths and focus on your surroundings. Name 5 things you can see, 4 things you can touch, " +
      "3 things you can hear, 2 things you can smell, and 1 thing you can taste."
    );
    return null;
  }
};

// Regular message handling
const sendMessage = async (text) => {
  try {
    UI.showUserMessage(text);
    const response = await chatGptService.sendMessage(text);
    UI.showAssistantMessage(response);
  } catch (error) {
    console.error('Error sending message:', error);
    UI.showAssistantMessage("I'm having trouble processing your message. Could you try again?");
  }
};

// Choose questionnaire type
const chooseQuestionnaire = async () => {
  console.log(chalk.yellow('\nWhich assessment would you like to take?'));
  console.log(chalk.white('1. PHQ-9 (Depression Assessment)'));
  console.log(chalk.white('2. GAD-7 (Anxiety Assessment)'));
  
  const choice = await new Promise(resolve => {
    rl.question(chalk.cyan('Enter your choice (1 or 2): '), (answer) => {
      if (answer === '1') resolve('PHQ-9');
      else if (answer === '2') resolve('GAD-7');
      else {
        console.log(chalk.red('Invalid choice. Defaulting to GAD-7.'));
        resolve('GAD-7');
      }
    });
  });
  
  return await UI.showQuestionnaire(choice);
};

// Main CLI function
const startCLI = async () => {
  // Initialize services
  try {
    console.log(chalk.yellow('Initializing MindfulMonitor services...'));
    await chatGptService.initialize();
    console.log(chalk.green('✓ Services initialized successfully.'));
  } catch (error) {
    console.error('Error initializing services:', error);
    console.log(chalk.red('⚠ Error initializing AI services. Some features may be limited.'));
  }

  // Show the title and guide
  UI.showTitle();
  UI.showGuide();

  // Get initial welcome message
  const welcomeMessage = "Hi there! I'm your Mental Health Companion. I can help monitor your wellbeing using Google Fit data and brief questionnaires. How are you feeling today?";
  UI.showAssistantMessage(welcomeMessage);

  // Start the prompt loop
  const promptUser = () => {
    UI.showPrompt();
    rl.question('', async (input) => {
      // Handle commands
      if (input.toLowerCase() === '<exit>') {
        console.log(chalk.blue('\nThank you for using MindfulMonitor. Take care of yourself!\n'));
        rl.close();
        process.exit(0);
      } else if (input.toLowerCase() === '<help>') {
        UI.showGuide();
        promptUser();
      } else if (input.toLowerCase() === '<clear>') {
        await conversationStore.clearConversation();
        console.log(chalk.green('Conversation history cleared.'));
        promptUser();
      } else if (input.toLowerCase() === '<current_fit>') {
        UI.showHealthData('normal');
        promptUser();
      } else if (input.toLowerCase() === '<panic>') {
        await simulatePanicAlert();
        promptUser();
      } else if (input.toLowerCase() === '<questionnaire>') {
        await chooseQuestionnaire();
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
  UI.showGuide();
});

// Start the CLI
startCLI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});