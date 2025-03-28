// src/screens/TestScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

// Import conversation service
const { getMessages, sendMessage, resetConversation } = require('../services/realConversationService');

// Test screen for direct API testing
const TestScreen = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Add log message
  const addToLog = (message: string) => {
    setLog(prevLog => [message, ...prevLog]);
  };
  
  // Send test message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      setLoading(true);
      addToLog(`Sending: "${input}"`);
      
      await sendMessage(input);
      
      const messages = await getMessages();
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        setResponse(lastMessage.text);
        addToLog(`Received: "${lastMessage.text.substring(0, 50)}..."`);
      }
    } catch (error) {
      addToLog(`ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear conversation history
  const handleClearConversation = async () => {
    try {
      setLoading(true);
      addToLog('Clearing conversation...');
      await resetConversation();
      setResponse('');
      addToLog('Conversation cleared.');
    } catch (error) {
      addToLog(`ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ChatGPT API Test</Text>
      
      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message to test"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
      
      {/* Response area */}
      <View style={styles.responseContainer}>
        <Text style={styles.sectionTitle}>Response:</Text>
        <ScrollView style={styles.responseScroll}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <Text style={styles.responseText}>{response || '(No response yet)'}</Text>
          )}
        </ScrollView>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearConversation}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear Conversation</Text>
        </TouchableOpacity>
      </View>
      
      {/* Log area */}
      <View style={styles.logContainer}>
        <Text style={styles.sectionTitle}>Log:</Text>
        <ScrollView style={styles.logScroll}>
          {log.map((entry, index) => (
            <Text key={index} style={styles.logEntry}>{entry}</Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.medium,
    backgroundColor: COLORS.background,
  },
  title: {
    ...TYPOGRAPHY.heading,
    textAlign: 'center',
    marginVertical: SPACING.medium,
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    padding: SPACING.small,
    backgroundColor: COLORS.surface,
    minHeight: 80,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.small,
    borderRadius: 8,
    marginLeft: SPACING.small,
    alignSelf: 'flex-end',
    width: 60,
  },
  buttonText: {
    color: COLORS.textLight,
    fontWeight: '500',
  },
  responseContainer: {
    flex: 2,
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subheading,
    marginBottom: SPACING.small,
  },
  responseScroll: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: SPACING.small,
  },
  responseText: {
    ...TYPOGRAPHY.body,
  },
  controls: {
    marginBottom: SPACING.medium,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.small,
    borderRadius: 8,
    alignItems: 'center',
    width: '50%',
  },
  logContainer: {
    flex: 3,
  },
  logScroll: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: SPACING.small,
  },
  logEntry: {
    ...TYPOGRAPHY.caption,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingVertical: SPACING.tiny,
  },
});

export default TestScreen;