import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { DriverExpense, DriverEarningsSummary, ExpenseCategory } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { DollarSign, TrendingUp, Plus, Bot, Fuel, Clock, Star, Award, Zap, Target } from 'lucide-react-native';
import { Button } from '@/components/Button';
import UnoChatModal from '@/components/UnoChatModal';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { usePunchInStore } from '@/store/punchInStore';
import PunchInModal from '@/components/PunchInModal';

const MOCK_SUMMARY: DriverEarningsSummary = {
    gross_earnings: 750.00,
    app_share: 275.00,
    driver_share: 475.00,
    expenses_total: 120.00,
    miles_total: 340,
};

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'fuel', 'maintenance', 'car_wash', 'tolls', 'parking', 'insurance', 
  'registration', 'repairs', 'tires', 'oil_change', 'car_payment', 
  'cleaning_supplies', 'phone_bill', 'snacks_drinks', 'other'
];

const CUSTOM_CATEGORIES_KEY = '@1way/custom_expense_categories';

export default function AnalyticsScreen() {
  const [summary, setSummary] = useState<DriverEarningsSummary | null>(null);
  const [expenses, setExpenses] = useState<DriverExpense[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<DriverExpense>>({
      date: new Date().toISOString().split('T')[0],
      category: 'fuel',
      amount: 0,
  });

  const [showUno, setShowUno] = useState(false);
  const [unoMessage, setUnoMessage] = useState('');
  
  const [showPunchIn, setShowPunchIn] = useState(false);
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  
  const { analytics, loadAnalytics } = useAnalyticsStore();
  const { isPunchedIn, loadCurrentSession } = usePunchInStore();

  useEffect(() => {
    fetchData();
    loadAnalytics();
    loadCurrentSession();
    loadCustomCategories();
  }, [loadAnalytics, loadCurrentSession]);

  const loadCustomCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  const addCustomCategory = async () => {
    if (!newCategoryName.trim()) return;
    const updated = [...customCategories, newCategoryName.trim()];
    setCustomCategories(updated);
    await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  const fetchData = async () => {
    try {
        const [earningsRes, expensesRes] = await Promise.all([
            api.get('/v1/driver/earnings').catch(() => ({ data: MOCK_SUMMARY })),
            api.get('/v1/driver/expenses').catch(() => ({ data: [] }))
        ]);
        
        setSummary(earningsRes.data);
        setExpenses(expensesRes.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        setSummary(MOCK_SUMMARY);
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
          fetchData();
          setNewExpense({ date: new Date().toISOString().split('T')[0], category: 'fuel', amount: 0 });
      } catch (error) {
          console.error('Error adding expense:', error);
          Alert.alert("Error", "Failed to add expense");
      }
  };

  const askUnoAboutTaxes = () => {
      setUnoMessage("Help me understand my tax deductions and how to track my expenses for rideshare driving.");
      setShowUno(true);
  };

  const handlePunchInOut = () => {
    setPunchType(isPunchedIn ? 'out' : 'in');
    setShowPunchIn(true);
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMembershipDuration = (memberSince: string) => {
    const start = new Date(memberSince);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const allCategories = [...EXPENSE_CATEGORIES, ...customCategories];
  const appShare = summary?.app_share || 0;
  const isPostThreshold = appShare >= 500;
  const progress = Math.min(appShare / 500, 1);
  const taxDeduction = (summary?.miles_total || 0) * 0.67;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Track your performance</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handlePunchInOut} style={[styles.punchButton, isPunchedIn && styles.punchButtonActive]}>
            <Clock size={18} color={isPunchedIn ? COLORS.background : COLORS.primary} />
            <Text style={[styles.punchButtonText, isPunchedIn && styles.punchButtonTextActive]}>
              {isPunchedIn ? 'Out' : 'In'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={askUnoAboutTaxes} style={styles.unoButton}>
              <Bot size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Big Percentage Tracker */}
        <View style={styles.percentageCard}>
          <Text style={styles.percentageLabel}>Your Revenue Share</Text>
          <View style={styles.percentageDisplay}>
            <Text style={[
              styles.percentageNumber,
              { color: isPostThreshold ? COLORS.success : COLORS.primary }
            ]}>
              {isPostThreshold ? '90' : '50'}%
            </Text>
            {isPostThreshold && (
              <View style={styles.badgeContainer}>
                <Zap size={20} color={COLORS.success} />
                <Text style={styles.badgeText}>Maximum Rate!</Text>
              </View>
            )}
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            ${appShare.toFixed(2)} / $500.00 app revenue this month
          </Text>
          <Text style={styles.helperText}>
            {isPostThreshold 
              ? 'You\'re earning 90% of gross revenue! Keep it up!' 
              : `${((500 - appShare) / 0.5).toFixed(0)} more in revenue to reach 90/10 split`}
          </Text>
        </View>

        {/* Analytics Cards Grid */}
        <View style={styles.analyticsGrid}>
          <View style={[styles.miniCard, { marginRight: 8 }]}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.miniCardValue}>{formatDuration(analytics?.totalSecondsWorked || 0)}</Text>
            <Text style={styles.miniCardLabel}>Total Hours</Text>
          </View>
          <View style={[styles.miniCard, { marginLeft: 8 }]}>
            <Target size={20} color={COLORS.success} />
            <Text style={styles.miniCardValue}>{analytics?.totalRides || 0}</Text>
            <Text style={styles.miniCardLabel}>Total Rides</Text>
          </View>
        </View>

        <View style={styles.analyticsGrid}>
          <View style={[styles.miniCard, { marginRight: 8 }]}>
            <DollarSign size={20} color={COLORS.accent} />
            <Text style={styles.miniCardValue}>${analytics?.totalTips.toFixed(0) || '0'}</Text>
            <Text style={styles.miniCardLabel}>Total Tips</Text>
          </View>
          <View style={[styles.miniCard, { marginLeft: 8 }]}>
            <Star size={20} color={COLORS.warning} />
            <Text style={styles.miniCardValue}>{analytics?.averageRating.toFixed(1) || '0'}</Text>
            <Text style={styles.miniCardLabel}>{analytics?.totalReviews || 0} Reviews</Text>
          </View>
        </View>

        {/* Membership */}
        <View style={styles.card}>
          <View style={styles.membershipHeader}>
            <Award size={24} color={COLORS.primary} />
            <View style={{ marginLeft: SPACING.md }}>
              <Text style={styles.cardTitle}>1Way Member</Text>
              <Text style={styles.membershipDuration}>
                {analytics?.memberSince ? formatMembershipDuration(analytics.memberSince) : 'New member'}
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Summary */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>This Month</Text>
            <View style={styles.earningsRow}>
                <View>
                    <Text style={styles.label}>Gross Earnings</Text>
                    <Text style={styles.value}>${summary?.gross_earnings.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Your Share</Text>
                    <Text style={[styles.value, { color: COLORS.success }]}>${summary?.driver_share.toFixed(2) || '0.00'}</Text>
                </View>
            </View>
        </View>

        {/* Miles & Tax */}
        <View style={styles.statsRow}>
            <View style={[styles.statCard, { marginRight: 8 }]}>
                <TrendingUp size={24} color={COLORS.primary} />
                <Text style={styles.statValue}>{summary?.miles_total || 0} mi</Text>
                <Text style={styles.statLabel}>Business Miles</Text>
            </View>
            <View style={[styles.statCard, { marginLeft: 8 }]}>
                <DollarSign size={24} color={COLORS.success} />
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
                icon={<Plus size={16} color={COLORS.primary} />}
            />
        </View>

        {expenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses logged this month.</Text>
        ) : (
            expenses.map(exp => (
                <View key={exp.id} style={styles.expenseItem}>
                    <View style={styles.expenseIcon}>
                        <Fuel size={20} color={COLORS.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.expenseCategory}>{String(exp.category).replace('_', ' ').toUpperCase()}</Text>
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
                      placeholderTextColor={COLORS.textTertiary}
                      onChangeText={t => setNewExpense({...newExpense, amount: Number(t)})} 
                  />

                  <Text style={styles.label}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 150 }}>
                    <View style={styles.chipsRow}>
                        {allCategories.map((cat) => (
                            <TouchableOpacity 
                                key={cat} 
                                style={[styles.chip, newExpense.category === cat && styles.chipActive]}
                                onPress={() => setNewExpense({...newExpense, category: cat})}
                            >
                                <Text style={[styles.chipText, newExpense.category === cat && styles.chipTextActive]}>
                                    {String(cat).replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {showNewCategoryInput ? (
                          <View style={styles.newCategoryInput}>
                            <TextInput
                              style={styles.newCategoryTextInput}
                              value={newCategoryName}
                              onChangeText={setNewCategoryName}
                              placeholder="Category name"
                              placeholderTextColor={COLORS.textTertiary}
                              onSubmitEditing={addCustomCategory}
                            />
                            <TouchableOpacity onPress={addCustomCategory}>
                              <Text style={styles.newCategoryAdd}>✓</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                              style={[styles.chip, styles.chipAdd]}
                              onPress={() => setShowNewCategoryInput(true)}
                          >
                              <Text style={styles.chipText}>+ Custom</Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  </ScrollView>
                  
                  <Text style={styles.label}>Miles (Optional)</Text>
                  <TextInput 
                      style={styles.input} 
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={COLORS.textTertiary}
                      onChangeText={t => setNewExpense({...newExpense, miles: Number(t)})} 
                  />

                  <View style={styles.modalButtons}>
                      <Button title="Cancel" variant="outline" onPress={() => setShowAddExpense(false)} style={{ flex: 1, marginRight: 8 }} />
                      <Button title="Save" onPress={handleAddExpense} style={{ flex: 1, marginLeft: 8 }} />
                  </View>
              </View>
          </View>
      </Modal>

      <UnoChatModal 
          visible={showUno} 
          onClose={() => setShowUno(false)} 
          initialMessage={unoMessage}
      />
      
      <PunchInModal
        visible={showPunchIn}
        onClose={() => setShowPunchIn(false)}
        type={punchType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  punchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  punchButtonActive: {
    backgroundColor: COLORS.primary,
  },
  punchButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  punchButtonTextActive: {
    color: COLORS.background,
  },
  unoButton: {
      backgroundColor: COLORS.primaryLight,
      padding: SPACING.sm,
      borderRadius: RADIUS.full,
      justifyContent: 'center',
      alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  percentageCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  percentageLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  percentageDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  percentageNumber: {
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    gap: 4,
  },
  badgeText: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
  },
  progressBarBg: {
      height: 12,
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: SPACING.sm,
      width: '100%',
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: COLORS.primary,
  },
  progressText: {
      fontSize: FONT_SIZE.md,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 4,
  },
  helperText: {
      fontSize: FONT_SIZE.sm,
      color: COLORS.textSecondary,
      textAlign: 'center',
  },
  analyticsGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  miniCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  miniCardValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: 2,
  },
  miniCardLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
      backgroundColor: COLORS.card,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700',
      color: COLORS.text,
  },
  membershipDuration: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  earningsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING.md,
  },
  label: {
      fontSize: FONT_SIZE.sm,
      color: COLORS.textSecondary,
      marginBottom: 4,
      fontWeight: '600',
  },
  value: {
      fontSize: FONT_SIZE.xl,
      fontWeight: '700',
      color: COLORS.text,
  },
  statsRow: {
      flexDirection: 'row',
      marginBottom: SPACING.lg,
  },
  statCard: {
      flex: 1,
      backgroundColor: COLORS.card,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
  },
  statValue: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700',
      color: COLORS.text,
      marginTop: SPACING.sm,
  },
  statLabel: {
      fontSize: FONT_SIZE.xs,
      color: COLORS.textSecondary,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
  },
  sectionTitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700',
      color: COLORS.text,
  },
  emptyText: {
      color: COLORS.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
  },
  expenseItem: {
      backgroundColor: COLORS.card,
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: RADIUS.md,
  },
  expenseIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
  },
  expenseCategory: {
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
      color: COLORS.text,
  },
  expenseDate: {
      fontSize: FONT_SIZE.xs,
      color: COLORS.textSecondary,
  },
  expenseAmount: {
      fontSize: FONT_SIZE.md,
      fontWeight: '700',
      color: COLORS.text,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      backgroundColor: COLORS.background,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      padding: SPACING.lg,
      paddingBottom: 40,
  },
  modalTitle: {
      fontSize: FONT_SIZE.xl,
      fontWeight: '700',
      marginBottom: SPACING.lg,
      textAlign: 'center',
  },
  input: {
      backgroundColor: COLORS.backgroundSecondary,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
      fontSize: FONT_SIZE.md,
  },
  chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
  },
  chip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.full,
      backgroundColor: COLORS.backgroundSecondary,
      borderWidth: 1,
      borderColor: COLORS.border,
  },
  chipActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
  },
  chipAdd: {
    borderStyle: 'dashed',
  },
  chipText: {
      fontSize: FONT_SIZE.sm,
      color: COLORS.text,
  },
  chipTextActive: {
      color: COLORS.background,
      fontWeight: '600',
  },
  newCategoryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.full,
    paddingLeft: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  newCategoryTextInput: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    minWidth: 100,
  },
  newCategoryAdd: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary,
    fontWeight: '700',
    paddingHorizontal: SPACING.sm,
  },
  modalButtons: {
      flexDirection: 'row',
      marginTop: SPACING.md,
  },
});
