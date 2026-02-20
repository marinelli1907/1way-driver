import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { api } from '@/lib/api';
import { DriverExpense, DriverEarningsSummary } from '@/types';
import { SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { DollarSign, TrendingUp, Plus, Bot, Fuel } from 'lucide-react-native';
import { Button } from '@/components/Button';
import UnoChatModal from '@/components/UnoChatModal';
import { useExpensesStore } from '@/store/expensesStore';

// Mock summary if API fails
const MOCK_SUMMARY: DriverEarningsSummary = {
    gross_earnings: 750.00,
    app_share: 275.00, // 500 * 0.5 + 250 * 0.1 = 250 + 25 = 275
    driver_share: 475.00, // 500 * 0.5 + 250 * 0.9 = 250 + 225 = 475
    expenses_total: 120.00,
    miles_total: 340,
};

export default function FinancesScreen() {
  const { colors } = useTheme();
  const { expenses: storeExpenses, fetchExpenses: fetchStoreExpenses } = useExpensesStore();
  const [summary, setSummary] = useState<DriverEarningsSummary | null>(null);
  const [expenses, setExpenses] = useState<DriverExpense[]>([]);

  const styles = createStyles(colors);
  
  // Modal State
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<DriverExpense>>({
      date: new Date().toISOString().split('T')[0],
      category: 'fuel',
      amount: 0,
  });

  // Uno State
  const [showUno, setShowUno] = useState(false);
  const [unoMessage, setUnoMessage] = useState('');

  const handleCloseUno = () => {
    setShowUno(false);
    fetchStoreExpenses();
  };

  useEffect(() => {
    fetchData();
    fetchStoreExpenses();
  }, [fetchStoreExpenses]);

  useEffect(() => {
    if (storeExpenses.length > 0) {
      const mappedExpenses = storeExpenses.map((exp, index) => ({
        id: typeof exp.id === 'string' ? parseInt(exp.id.replace('exp-', '')) : index,
        driver_id: 1,
        date: exp.date,
        category: exp.category,
        amount: exp.amount,
        miles: exp.miles || 0,
        notes: exp.notes,
      }));
      setExpenses(mappedExpenses);
    }
  }, [storeExpenses]);

  const fetchData = async () => {
    try {
        const earningsRes = await api.get('/v1/driver/earnings').catch(() => ({ data: MOCK_SUMMARY }));
        setSummary(earningsRes.data);
    } catch {
        setSummary(MOCK_SUMMARY);
    } finally {
        console.log('[Earnings] Fetch complete');
    }
  };

  const handleAddExpense = async () => {
      if (!newExpense.amount || !newExpense.category) {
          Alert.alert("Error", "Please enter amount and category");
          return;
      }

      try {
          await api.post('/v1/driver/expenses', newExpense);
          setShowAddExpense(false);
          setNewExpense({ date: new Date().toISOString().split('T')[0], category: 'fuel', amount: 0 });
      } catch {
          Alert.alert("Error", "Failed to add expense");
      }
  };

  const askUnoAboutTaxes = () => {
      setUnoMessage("Help me understand my tax deductions and how to track my expenses for rideshare driving.");
      setShowUno(true);
  };

  const calculateProgress = () => {
      if (!summary) return 0;
      // Threshold is $500 REVENUE for the app? 
      // Requirement: "$500 per month app revenue threshold"
      // "Up to $500 -> split 50% to app, 50% to driver"
      // "After $500 -> 90% to driver, 10% to app"
      // This usually means GROSS REVENUE up to a point, or APP REVENUE up to $500?
      // "App revenue this month: $X of $500".
      // So it tracks APP SHARE.
      return Math.min(summary.app_share / 500, 1);
  };

  const taxDeduction = (summary?.miles_total || 0) * 0.67;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finances</Text>
        <TouchableOpacity onPress={askUnoAboutTaxes} style={styles.unoButton}>
            <Bot size={20} color={colors.primary} />
            <Text style={styles.unoButtonText}>Ask Uno</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Summary Card */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Earnings</Text>
            <View style={styles.earningsRow}>
                <View>
                    <Text style={styles.label}>Gross Earnings</Text>
                    <Text style={styles.value}>${summary?.gross_earnings.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Your Share</Text>
                    <Text style={[styles.value, { color: colors.success }]}>${summary?.driver_share.toFixed(2) || '0.00'}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.revenueShareContainer}>
                <Text style={styles.label}>App Revenue Share Progress</Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${calculateProgress() * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    ${summary?.app_share.toFixed(2) || '0.00'} / $500.00 contributed
                </Text>
                <Text style={styles.helperText}>
                    50/50 split until $500 app revenue, then 90/10 in your favor.
                    {'\n'}Resets on the 1st of each month.
                </Text>
            </View>
        </View>

        {/* Miles & Tax */}
        <View style={styles.statsRow}>
            <View style={[styles.statCard, { marginRight: 8 }]}>
                <TrendingUp size={24} color={colors.primary} />
                <Text style={styles.statValue}>{summary?.miles_total || 0} mi</Text>
                <Text style={styles.statLabel}>Business Miles</Text>
            </View>
            <View style={[styles.statCard, { marginLeft: 8 }]}>
                <DollarSign size={24} color={colors.success} />
                <Text style={styles.statValue}>${taxDeduction.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Est. Tax Deduction</Text>
            </View>
        </View>

        {/* Expenses */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            <Button 
                title="Add" 
                size="small" 
                variant="outline" 
                onPress={() => setShowAddExpense(true)}
                icon={<Plus size={16} color={colors.primary} />}
            />
        </View>

        {expenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses logged this month.</Text>
        ) : (
            expenses.map(exp => (
                <View key={exp.id} style={styles.expenseItem}>
                    <View style={styles.expenseIcon}>
                        <Fuel size={20} color={colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.expenseCategory}>{exp.category.toUpperCase()}</Text>
                        <Text style={styles.expenseDate}>{exp.date}</Text>
                    </View>
                    <Text style={styles.expenseAmount}>-${exp.amount.toFixed(2)}</Text>
                </View>
            ))
        )}

      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={showAddExpense} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Log Expense</Text>
                  
                  <Text style={styles.label}>Amount ($)</Text>
                  <TextInput 
                      style={styles.input} 
                      keyboardType="numeric"
                      placeholder="0.00"
                      onChangeText={t => setNewExpense({...newExpense, amount: Number(t)})} 
                  />

                  <Text style={styles.label}>Category</Text>
                  <View style={styles.chipsRow}>
                      {['fuel', 'maintenance', 'car_wash', 'tolls', 'other'].map(cat => (
                          <TouchableOpacity 
                              key={cat} 
                              style={[styles.chip, newExpense.category === cat && styles.chipActive]}
                              onPress={() => setNewExpense({...newExpense, category: cat as any})}
                          >
                              <Text style={[styles.chipText, newExpense.category === cat && styles.chipTextActive]}>
                                  {cat}
                              </Text>
                          </TouchableOpacity>
                      ))}
                  </View>
                  
                  <Text style={styles.label}>Miles (Optional)</Text>
                  <TextInput 
                      style={styles.input} 
                      keyboardType="numeric"
                      placeholder="0"
                      onChangeText={t => setNewExpense({...newExpense, miles: Number(t)})} 
                  />

                  <View style={styles.modalButtons}>
                      <Button title="Cancel" variant="outline" onPress={() => setShowAddExpense(false)} style={{ flex: 1, marginRight: 8 }} />
                      <Button title="Save" onPress={handleAddExpense} style={{ flex: 1, marginLeft: 8 }} />
                  </View>
              </View>
          </View>
      </Modal>

      {/* Uno Chat Modal */}
      <UnoChatModal 
          visible={showUno} 
          onClose={handleCloseUno} 
          initialMessage={unoMessage}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    padding: SPACING.lg,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700' as const,
    color: colors.text,
  },
  unoButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.primaryLight,
      padding: SPACING.sm,
      borderRadius: RADIUS.full,
  },
  unoButtonText: {
      marginLeft: SPACING.xs,
      color: colors.primary,
      fontWeight: '600' as const,
      fontSize: FONT_SIZE.sm,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  card: {
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  cardTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: SPACING.md,
  },
  earningsRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: SPACING.md,
  },
  label: {
      fontSize: FONT_SIZE.xs,
      color: colors.textSecondary,
      marginBottom: 4,
  },
  value: {
      fontSize: FONT_SIZE.xl,
      fontWeight: '700' as const,
      color: colors.text,
  },
  divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: SPACING.md,
  },
  revenueShareContainer: {
      marginTop: SPACING.xs,
  },
  progressBarBg: {
      height: 8,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 4,
      overflow: 'hidden' as const,
      marginBottom: SPACING.xs,
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
  },
  progressText: {
      fontSize: FONT_SIZE.sm,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 2,
  },
  helperText: {
      fontSize: FONT_SIZE.xs,
      color: colors.textTertiary,
  },
  statsRow: {
      flexDirection: 'row' as const,
      marginBottom: SPACING.lg,
  },
  statCard: {
      flex: 1,
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center' as const,
  },
  statValue: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700' as const,
      color: colors.text,
      marginTop: SPACING.sm,
  },
  statLabel: {
      fontSize: FONT_SIZE.xs,
      color: colors.textSecondary,
  },
  sectionHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: SPACING.md,
  },
  sectionTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700' as const,
      color: colors.text,
  },
  emptyText: {
      color: colors.textSecondary,
      textAlign: 'center' as const,
      fontStyle: 'italic' as const,
  },
  expenseItem: {
      backgroundColor: colors.card,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: RADIUS.md,
  },
  expenseIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: SPACING.md,
  },
  expenseCategory: {
      fontSize: FONT_SIZE.md,
      fontWeight: '600' as const,
      color: colors.text,
  },
  expenseDate: {
      fontSize: FONT_SIZE.xs,
      color: colors.textSecondary,
  },
  expenseAmount: {
      fontSize: FONT_SIZE.md,
      fontWeight: '700' as const,
      color: colors.text,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end' as const,
  },
  modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      padding: SPACING.lg,
      paddingBottom: 40,
  },
  modalTitle: {
      fontSize: FONT_SIZE.xl,
      fontWeight: '700' as const,
      marginBottom: SPACING.lg,
      textAlign: 'center' as const,
      color: colors.text,
  },
  input: {
      backgroundColor: colors.backgroundSecondary,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
      fontSize: FONT_SIZE.md,
      color: colors.text,
  },
  chipsRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: SPACING.sm,
      marginBottom: SPACING.md,
  },
  chip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.full,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
  },
  chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
  },
  chipText: {
      fontSize: FONT_SIZE.sm,
      color: colors.text,
  },
  chipTextActive: {
      color: colors.background,
      fontWeight: '600' as const,
  },
  modalButtons: {
      flexDirection: 'row' as const,
      marginTop: SPACING.md,
  },
});
