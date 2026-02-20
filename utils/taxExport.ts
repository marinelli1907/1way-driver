import { Alert, Share } from 'react-native';
import type { Expense, MileageEntry, TimePeriod } from '@/types';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear, format } from 'date-fns';

export const getDateRange = (period: TimePeriod) => {
  const now = new Date();
  switch (period) {
    case 'daily':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'weekly':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'monthly':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'yearly':
      return { start: startOfYear(now), end: endOfYear(now) };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
};

export const generateCSV = (
  expenses: Expense[],
  mileageEntries: MileageEntry[],
  period: TimePeriod
): string => {
  const { start, end } = getDateRange(period);
  
  let csv = `Tax Export Report (${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')})\n\n`;
  
  csv += 'EXPENSES\n';
  csv += 'Date,Category,Amount,Notes\n';
  
  expenses.forEach((expense) => {
    const date = format(new Date(expense.date), 'MM/dd/yyyy');
    const notes = (expense.notes || '').replace(/,/g, ';');
    csv += `${date},${expense.category},${expense.amount.toFixed(2)},${notes}\n`;
  });
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  csv += `\nTotal Expenses,$${totalExpenses.toFixed(2)}\n\n`;
  
  csv += 'MILEAGE LOG\n';
  csv += 'Date,Distance (miles),Purpose\n';
  
  mileageEntries.forEach((entry) => {
    const date = format(new Date(entry.date), 'MM/dd/yyyy');
    const purpose = (entry.purpose ?? '').replace(/,/g, ';');
    csv += `${date},${entry.distance.toFixed(1)},${purpose}\n`;
  });
  
  const totalMileage = mileageEntries.reduce((sum, e) => sum + e.distance, 0);
  const mileageDeduction = totalMileage * 0.67;
  
  csv += `\nTotal Miles,${totalMileage.toFixed(1)}\n`;
  csv += `Estimated Deduction (@ $0.67/mi),$${mileageDeduction.toFixed(2)}\n\n`;
  
  csv += `SUMMARY\n`;
  csv += `Total Expenses,$${totalExpenses.toFixed(2)}\n`;
  csv += `Total Business Miles,${totalMileage.toFixed(1)}\n`;
  csv += `Estimated Mileage Deduction,$${mileageDeduction.toFixed(2)}\n`;
  csv += `Total Estimated Deductions,$${(totalExpenses + mileageDeduction).toFixed(2)}\n\n`;
  
  csv += `Note: This is an estimate and not professional tax advice. Consult a tax professional.\n`;
  
  return csv;
};

export const exportTaxData = async (
  expenses: Expense[],
  mileageEntries: MileageEntry[],
  period: TimePeriod
) => {
  try {
    const csv = generateCSV(expenses, mileageEntries, period);
    
    await Share.share({
      message: csv,
      title: `Tax Export - ${period}`,
    });
  } catch (error) {
    console.error('Error sharing tax export:', error);
    Alert.alert('Error', 'Failed to export tax data');
  }
};
