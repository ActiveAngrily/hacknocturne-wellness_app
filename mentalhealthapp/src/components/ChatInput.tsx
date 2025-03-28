import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
  Platform
} from 'react-native';
import { COLORS, SPACING } from '../theme';

// Simple Send icon component using View
const SendIcon = () => (
  <View style={{
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    {/* Arrow shape */}
    <View style={{
      width: 8,
      height: 8,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: COLORS.textLight,
      transform: [{ rotate: '45deg' }, { translateX: -1 }]
    }} />
  </View>
);

// Props interface for ChatInput
interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

// ChatInput component
const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
}) => {
  // State for input text
  const [text, setText] = useState('');
  
  // State for input height
  const [inputHeight, setInputHeight] = useState(44);
  
  // Ref for TextInput
  const inputRef = useRef<TextInput>(null);
  
  // Handle text change
  const handleTextChange = (value: string) => {
    setText(value);
    
    // Adjust input height based on text length
    if (value.length > 40 && inputHeight < 88) {
      setInputHeight(88);
    } else if (value.length <= 40 && inputHeight > 44) {
      setInputHeight(44);
    }
  };
  
  // Handle send button press
  const handleSend = () => {
    if (text.trim().length > 0) {
      onSend(text.trim());
      setText('');
      Keyboard.dismiss();
      
      // Reset input height
      setInputHeight(44);
    }
  };
  
  // Focus the input
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.inputContainer}
        onPress={focusInput}
      >
        <View style={{ height: inputHeight }}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
            multiline
            autoCapitalize="sentences"
            blurOnSubmit={false}
          />
        </View>
        
        {text.trim().length > 0 && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.7}
          >
            <SendIcon />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: SPACING.medium,
    paddingVertical: Platform.OS === 'ios' ? SPACING.small : 0,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginRight: SPACING.medium,
    marginVertical: SPACING.small,
    maxHeight: 100,
  },
  sendButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.small,
    marginLeft: SPACING.small,
    padding: SPACING.small,
  },
});

export default ChatInput;