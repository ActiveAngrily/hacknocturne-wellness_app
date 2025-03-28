import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

// Message interface
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'orb';
  timestamp: Date;
}

// Props interface for MessageBubble component
interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
}

// Format timestamp for display
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Format time as HH:MM
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedTime = 
    `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  
  // Check if message is from today, yesterday, or earlier
  if (date >= today) {
    return `Today, ${formattedTime}`;
  } else if (date >= yesterday) {
    return `Yesterday, ${formattedTime}`;
  } else {
    // Format as MM/DD/YYYY for older messages
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${formattedTime}`;
  }
};

// MessageBubble component
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showTimestamp = true,
}) => {
  // Determine if the message is from the user or Orb
  const isUserMessage = message.sender === 'user';
  
  return (
    <View style={[
      styles.container, 
      isUserMessage ? styles.userContainer : styles.orbContainer,
    ]}>
      <View style={[
        styles.bubble,
        isUserMessage ? styles.userBubble : styles.orbBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUserMessage ? styles.userText : styles.orbText
        ]}>
          {message.text}
        </Text>
      </View>
      
      {showTimestamp && (
        <Text style={[
          styles.timestamp,
          isUserMessage ? styles.userTimestamp : styles.orbTimestamp
        ]}>
          {formatTimestamp(message.timestamp)}
        </Text>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.small,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: SPACING.medium,
  },
  orbContainer: {
    alignSelf: 'flex-start',
    marginLeft: SPACING.medium,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 0,
  },
  orbBubble: {
    backgroundColor: COLORS.orbBubble,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    ...TYPOGRAPHY.body,
  },
  userText: {
    color: COLORS.text,
  },
  orbText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.tiny,
  },
  userTimestamp: {
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
    marginRight: SPACING.tiny,
  },
  orbTimestamp: {
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
    marginLeft: SPACING.tiny,
  },
});

export default MessageBubble;