import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { Phone, Mail, Bot, LogOut, ChevronRight, History, Users, Settings, Zap, Edit, Shield, Moon } from 'lucide-react-native';
import { Button } from '@/components/Button';
import UnoChatModal from '@/components/UnoChatModal';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors, isDark, setTheme } = useTheme();
  const [available, setAvailable] = useState(true);
  const [showUno, setShowUno] = useState(false);
  const styles = createStyles(colors);

  const handleLogout = async () => {
    Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Logout", 
                style: "destructive", 
                onPress: async () => {
                    await logout();
                    router.replace('/welcome');
                }
            }
        ]
    );
  };

  const handleEditInfo = () => {
      router.push('/profile/edit');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* User Card */}
        <TouchableOpacity style={styles.userCard} onPress={() => router.push('/profile/edit')}>
            {user?.photoUri ? (
              <Image source={{ uri: user.photoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || 'D'}
                  </Text>
              </View>
            )}
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Driver Name'}</Text>
                <Text style={styles.userRole}>Driver Account</Text>
            </View>
            <View style={styles.editIconContainer}>
                <Edit size={20} color={colors.primary} />
            </View>
        </TouchableOpacity>

        {/* Availability */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Available for jobs</Text>
                <Switch 
                    value={available} 
                    onValueChange={setAvailable}
                    trackColor={{ false: colors.border, true: colors.success }}
                />
            </View>
        </View>

        {/* Dark Mode */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Moon size={20} color={colors.text} style={{ marginRight: SPACING.sm }} />
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
                </View>
                <Switch 
                    value={isDark} 
                    onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
            
            <View style={styles.infoRow}>
                <Mail size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{user?.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Phone size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{user?.phone || 'No phone'}</Text>
            </View>

            <Button 
                title="Edit contact info" 
                variant="outline" 
                size="small" 
                onPress={handleEditInfo}
                style={styles.editButton}
            />
        </View>

        {/* Settings Section */}
        <Text style={styles.categoryTitle}>Settings</Text>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => router.push('/settings/parameters')}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.primaryLight }]}>
                <Settings size={24} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Driver Preferences (Personal)</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => router.push('/settings/safety')}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.primaryLight }]}>
                <Shield size={24} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Safety & DOT Settings</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => router.push('/ai-plan-setup')}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.primary }]}>
                <Zap size={24} color={colors.background} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Today&apos;s AI Plan</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* History Section */}
        <Text style={styles.categoryTitle}>History</Text>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => router.push('/history/rides')}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.primaryLight }]}>
                <History size={24} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Ride History</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => router.push('/history/customers')}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.primaryLight }]}>
                <Users size={24} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Customer Profiles</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Uno */}
        <Text style={styles.categoryTitle}>Help</Text>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={() => setShowUno(true)}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.primaryLight }]}>
                <Bot size={24} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Chat with Uno AI</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem, { backgroundColor: colors.card }]} onPress={handleLogout}>
            <View style={[styles.menuIconBg, styles.logoutIconBg, { backgroundColor: colors.dangerLight }]}>
                <LogOut size={24} color={colors.danger} />
            </View>
            <Text style={[styles.menuText, styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      <UnoChatModal 
          visible={showUno} 
          onClose={() => setShowUno(false)} 
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: SPACING.lg,
  },
  userCard: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  avatar: {
      backgroundColor: colors.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
  },
  avatarText: {
      fontSize: FONT_SIZE.xl,
      fontWeight: '700',
      color: colors.background,
  },
  avatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: SPACING.md,
  },
  editIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
  },
  userInfo: {
      flex: 1,
  },
  userName: {
      fontSize: FONT_SIZE.lg,
      fontWeight: '700',
      color: colors.text,
  },
  userRole: {
      fontSize: FONT_SIZE.sm,
      color: colors.textSecondary,
  },
  section: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.lg,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  rowLabel: {
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
  },
  sectionTitle: {
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING.md,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
  },
  infoText: {
      marginLeft: SPACING.md,
      fontSize: FONT_SIZE.md,
  },
  editButton: {
      marginTop: SPACING.xs,
  },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  menuIconBg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
  },
  menuText: {
      flex: 1,
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
  },
  logoutItem: {
      marginTop: SPACING.lg,
  },
  logoutIconBg: {},
  logoutText: {},
  categoryTitle: {
      fontSize: FONT_SIZE.sm,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
      marginTop: SPACING.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
});
