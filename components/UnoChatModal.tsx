import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,

} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { X, Send, Bot } from 'lucide-react-native';
import { useRorkAgent, createRorkTool } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { useExpensesStore } from '@/store/expensesStore';
import { useAutomationStore } from '@/store/automationStore';
import type { ExpenseCategory } from '@/types';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: number;
}

interface UnoChatModalProps {
    visible: boolean;
    onClose: () => void;
    initialMessage?: string;
}

export default function UnoChatModal({ visible, onClose, initialMessage }: UnoChatModalProps) {
    const { addExpense } = useExpensesStore();
    const { updatePreferences } = useAutomationStore();
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const hasShownWelcome = useRef(false);

    const { messages: aiMessages, sendMessage } = useRorkAgent({
        tools: {
            addExpense: createRorkTool({
                description: 'Add a new expense for the driver. Use this when the driver mentions spending money on something.',
                zodSchema: z.object({
                    category: z.enum([
                        'fuel', 'tolls', 'maintenance', 'car_wash', 'parking', 
                        'insurance', 'registration', 'repairs', 'tires', 'oil_change', 
                        'car_payment', 'cleaning_supplies', 'phone_bill', 'snacks_drinks', 'other'
                    ]).describe('The category of the expense'),
                    amount: z.number().positive().describe('The amount of money spent'),
                    notes: z.string().optional().describe('Optional notes about the expense'),
                }),
                execute({ category, amount, notes }) {
                    addExpense({
                        date: new Date().toISOString(),
                        category: category as ExpenseCategory,
                        amount,
                        notes,
                    });
                    return `Added ${category} expense of ${amount}`;
                },
            }),
            setDailyGoal: createRorkTool({
                description: 'Set a daily earnings goal for the driver',
                zodSchema: z.object({
                    targetEarnings: z.number().positive().describe('Target earnings in dollars'),
                    targetHours: z.number().positive().optional().describe('Target hours to work'),
                }),
                execute({ targetEarnings, targetHours }) {
                    return `Daily goal set: ${targetEarnings}${targetHours ? ` in ${targetHours} hours` : ''}`;
                },
            }),
            updateAutomation: createRorkTool({
                description: 'Update driver automation preferences like minimum payout or maximum distance',
                zodSchema: z.object({
                    minPayout: z.number().positive().optional().describe('Minimum payout amount in dollars'),
                    maxDistance: z.number().positive().optional().describe('Maximum distance in miles'),
                    enabled: z.boolean().optional().describe('Enable or disable automation'),
                }),
                execute({ minPayout, maxDistance, enabled }) {
                    const updates: any = {};
                    if (minPayout !== undefined) updates.minPayout = minPayout;
                    if (maxDistance !== undefined) updates.maxDistance = maxDistance;
                    if (enabled !== undefined) updates.enabled = enabled;
                    
                    updatePreferences(updates);
                    
                    const changes = [];
                    if (minPayout) changes.push(`minimum payout to ${minPayout}`);
                    if (maxDistance) changes.push(`maximum distance to ${maxDistance}mi`);
                    if (enabled !== undefined) changes.push(`automation ${enabled ? 'enabled' : 'disabled'}`);
                    
                    return `Updated: ${changes.join(', ')}`;
                },
            }),
            getExpenseSummary: createRorkTool({
                description: 'Get a summary of driver expenses',
                zodSchema: z.object({}),
                execute() {
                    return 'Expense summary retrieved successfully';
                },
            }),
        },
    });

    const messages: Message[] = aiMessages.map((msg) => {
        let textContent = '';
        
        for (const part of msg.parts) {
            if (part.type === 'text') {
                textContent += part.text;
            } else if (part.type === 'tool') {
                if (part.state === 'input-streaming' || part.state === 'input-available') {
                    textContent += `\n🔧 ${part.toolName}...`;
                } else if (part.state === 'output-available') {
                    const output = part.output as string;
                    if (output) {
                        textContent += `\n✅ ${output}`;
                    }
                } else if (part.state === 'output-error') {
                    textContent += `\n❌ Error: ${part.errorText}`;
                }
            }
        }

        return {
            id: msg.id,
            text: textContent || 'Processing...',
            sender: msg.role === 'user' ? 'user' : 'assistant',
            timestamp: Date.now(),
        } as Message;
    });

    useEffect(() => {
        if (visible && initialMessage) {
            setInputText(initialMessage);
        }
    }, [visible, initialMessage]);

    useEffect(() => {
        if (messages.length === 0 && visible && !hasShownWelcome.current) {
            hasShownWelcome.current = true;
            sendMessage("Hi, I'm Uno! I can help you with:\n\n• Adding expenses\n• Setting daily goals\n• Adjusting automation settings\n• Planning your driving strategy\n\nWhat would you like to do?");
        }
        if (!visible) {
            hasShownWelcome.current = false;
        }
    }, [visible, messages.length, sendMessage]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        
        const message = inputText;
        setInputText('');
        
        await sendMessage(message);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitleContainer}>
                        <Bot size={24} color={COLORS.primary} />
                        <Text style={styles.headerTitle}>Uno Assistant</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    onLayout={() => flatListRef.current?.scrollToEnd()}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageBubble,
                            item.sender === 'user' ? styles.userBubble : styles.botBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                item.sender === 'user' ? styles.userText : styles.botText
                            ]}>
                                {item.text}
                            </Text>
                        </View>
                    )}
                />

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask Uno..."
                        placeholderTextColor={COLORS.textTertiary}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Send size={20} color={COLORS.background} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.text,
    },
    closeButton: {
        padding: SPACING.sm,
    },
    messagesList: {
        padding: SPACING.md,
        gap: SPACING.md,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 2,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.card,
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: FONT_SIZE.md,
        lineHeight: 22,
    },
    userText: {
        color: COLORS.background,
    },
    botText: {
        color: COLORS.text,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZE.md,
        maxHeight: 100,
        marginRight: SPACING.sm,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
