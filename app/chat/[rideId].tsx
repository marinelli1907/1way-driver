import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Send, User } from 'lucide-react-native';
import type { ChatMessage } from '@/types';

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    rideId: '101',
    senderId: 'p1',
    senderType: 'passenger',
    message: "Hi! I am outside the building entrance",
    timestamp: '2024-01-15T14:25:00Z',
    read: true,
  },
  {
    id: '2',
    rideId: '101',
    senderId: 'd1',
    senderType: 'driver',
    message: "Perfect! I will be there in 2 minutes",
    timestamp: '2024-01-15T14:25:30Z',
    read: true,
  },
  {
    id: '3',
    rideId: '101',
    senderId: 'p1',
    senderType: 'passenger',
    message: 'Great, thank you!',
    timestamp: '2024-01-15T14:26:00Z',
    read: true,
  },
];

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const rideId = params.rideId as string;
  const passengerName = params.passengerName as string || 'Passenger';
  
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      rideId,
      senderId: 'd1',
      senderType: 'driver',
      message: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ 
        headerShown: true,
        title: passengerName,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
      }} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => {
          const isDriver = message.senderType === 'driver';
          return (
            <View
              key={message.id}
              style={[styles.messageBubble, isDriver ? styles.driverBubble : styles.passengerBubble]}
            >
              {!isDriver && (
                <View style={styles.avatarSmall}>
                  <User size={16} color={COLORS.primary} />
                </View>
              )}
              <View style={[styles.messageContent, isDriver && styles.driverMessage]}>
                <Text style={[styles.messageText, isDriver && styles.driverMessageText]}>
                  {message.message}
                </Text>
                <Text style={[styles.messageTime, isDriver && styles.driverMessageTime]}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit',
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim().length === 0 && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={inputText.trim().length === 0}
        >
          <Send size={20} color={inputText.trim().length > 0 ? COLORS.background : COLORS.textTertiary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  messagesContainer: {
    padding: SPACING.lg,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    maxWidth: '80%',
  },
  driverBubble: {
    alignSelf: 'flex-end',
  },
  passengerBubble: {
    alignSelf: 'flex-start',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  messageContent: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  driverMessage: {
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  driverMessageText: {
    color: COLORS.background,
  },
  messageTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  driverMessageTime: {
    color: COLORS.background + 'CC',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
  },
});
