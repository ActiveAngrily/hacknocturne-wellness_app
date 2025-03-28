import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/index';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import MessageBubble, { Message } from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';

// Import your real service instead of the mock
import { getMessages, sendMessage } from '../services/realConversationService';

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
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const initialMessages = await getMessages();
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, []);
  
  // Function to handle sending a new message
  const handleSendMessage = async (text: string) => {
    try {
      // Show some loading state if needed
      setLoading(true);
      
      // Send message and get updated conversation
      const updatedMessages = await sendMessage(text);
      setMessages(updatedMessages);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        if (flatListRef.current && messages.length > 0) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to go back to voice interface
  const goBackToVoiceInterface = () => {
    navigation.navigate('Orb');
  };
  
  // Ref for FlatList
  const flatListRef = useRef<FlatList<Message>>(null);
  
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
});

export default ChatScreen;