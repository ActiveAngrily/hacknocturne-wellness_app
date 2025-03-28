import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/index';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import MessageBubble, { Message } from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';

// Import realConversationService
const { getMessages, sendMessage, resetConversation } = require('../services/realConversationService');

// Get screen dimensions
const { width } = Dimensions.get('window');

// Define props interface
type ChatScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Chat'>;
};

// ChatScreen component
const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for FlatList
  const flatListRef = useRef<FlatList<Message>>(null);
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading initial messages...');
        const initialMessages = await getMessages();
        setMessages(initialMessages);
        
        // Scroll to bottom once messages load
        setTimeout(() => {
          if (flatListRef.current && initialMessages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }, 200);
      } catch (error) {
        console.error('Error loading messages:', error);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Optional: reset conversation when component unmounts
    // return () => {
    //   resetConversation();
    // };
  }, []);
  
  // Function to handle sending a new message
  const handleSendMessage = async (text: string) => {
    try {
      // Show loading state
      setLoading(true);
      setError(null);
      
      // Add temporary user message for immediate feedback
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Update UI with temp message
      setMessages(prevMessages => [...prevMessages, tempUserMessage]);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
      
      // Actually send message and get updated conversation
      console.log('Sending message to conversation service...');
      const updatedMessages = await sendMessage(text);
      
      // Update with real messages from service
      setMessages(updatedMessages);
      
      // Scroll to bottom again after response
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get a response. Please try again.');
      Alert.alert('Error', 'Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to go back to voice interface
  const handleGoToVoiceInterface = () => {
    navigation.navigate('Orb');
  };
  
  // Function to test the API with a predefined message
  const handleTestAPI = () => {
    handleSendMessage("I'm feeling anxious today. Can you suggest some calming techniques?");
  };
  
  // Render a message item
  const renderMessageItem = ({ item }: { item: Message }) => {
    return <MessageBubble message={item} />;
  };
  
  // Get message key
  const getMessageKey = (item: Message) => item.id;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handleBar} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoToVoiceInterface}
        >
          <Text style={styles.backButtonText}>Voice Mode</Text>
        </TouchableOpacity>
        
        {/* Test API Button - Remove this in production */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestAPI}
        >
          <Text style={styles.testButtonText}>Test API</Text>
        </TouchableOpacity>
      </View>
      
      {/* Error message if any */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={getMessageKey}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      
      {/* Chat input */}
      <ChatInput onSend={handleSendMessage} />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    marginBottom: SPACING.small,
    position: 'absolute',
    top: SPACING.small,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.medium,
    bottom: SPACING.small,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  testButton: {
    position: 'absolute',
    right: SPACING.medium,
    bottom: SPACING.small,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: SPACING.medium,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    margin: SPACING.small,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
});

export default ChatScreen;