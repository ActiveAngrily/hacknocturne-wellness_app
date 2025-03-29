import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import MessageBubble, { Message } from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';

// Import from our service index
import * as ConversationService from '../services';

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
  
  // Ref for FlatList
  const flatListRef = useRef<FlatList>(null);
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const initialMessages = await ConversationService.getMessages();
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        // If there's an error, provide at least an initial message
        setMessages([{
          id: 'initial',
          text: "Hello! I'm Orb, your mental health companion. How can I help you today?",
          sender: 'orb',
          timestamp: new Date()
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, []);
  
  // Function to handle sending a new message
  const handleSendMessage = async (text: string) => {
    try {
      // Create a temporary user message to show immediately
      const tempUserMessage: Message = {
        id: `user-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Update UI immediately with the user message
      setMessages(prev => [...prev, tempUserMessage]);
      
      // Show loading state
      setLoading(true);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        if (flatListRef.current && messages.length > 0) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
      
      // Send message and get updated conversation
      const updatedMessages = await ConversationService.sendMessage(text);
      setMessages(updatedMessages);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // If sending fails, at least add a generic response
      const errorOrbMessage: Message = {
        id: `orb-${Date.now()}`,
        text: "I'm having trouble connecting right now. Could you try again in a moment?",
        sender: 'orb',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorOrbMessage]);
    } finally {
      setLoading(false);
      
      // Scroll to bottom after getting response
      setTimeout(() => {
        if (flatListRef.current && messages.length > 0) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  };
  
  // Function to go back to voice interface
  const goBackToVoiceInterface = () => {
    navigation.navigate('Orb');
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
          onPress={goBackToVoiceInterface}
        >
          <Text style={styles.backButtonText}>Voice Mode</Text>
        </TouchableOpacity>
      </View>
      
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
          <ActivityIndicator size="small" color={COLORS.primary} />
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
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    marginBottom: SPACING.small,
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
  messagesList: {
    flexGrow: 1,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
  },
  loadingContainer: {
    padding: SPACING.small,
    alignItems: 'center',
  },
});

export default ChatScreen;