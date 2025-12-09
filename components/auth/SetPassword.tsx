import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

interface SetPasswordProps {
  email: string;
  onPasswordSet: (password: string) => Promise<void>;
  loading?: boolean;
}

export default function SetPassword({
  email,
  onPasswordSet,
  loading = false,
}: SetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
    { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
    { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.test(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async () => {
    if (!isPasswordValid) {
      Alert.alert('Invalid Password', 'Please meet all password requirements');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }
    await onPasswordSet(password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={48} color={Colors.fhsuGold} />
        <Text style={styles.title}>Set Your Password</Text>
        <Text style={styles.subtitle}>
          Create a password for{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Requirements */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
        {passwordRequirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <View key={index} style={styles.requirementRow}>
              <Ionicons
                name={isMet ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={isMet ? '#10B981' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.requirementText,
                  isMet && styles.requirementTextMet,
                ]}
              >
                {req.label}
              </Text>
            </View>
          );
        })}
        {confirmPassword.length > 0 && (
          <View style={styles.requirementRow}>
            <Ionicons
              name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={passwordsMatch ? '#10B981' : '#EF4444'}
            />
            <Text
              style={[
                styles.requirementText,
                passwordsMatch && styles.requirementTextMet,
              ]}
            >
              Passwords match
            </Text>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isPasswordValid || !passwordsMatch || loading) &&
            styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!isPasswordValid || !passwordsMatch || loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Setting Password...' : 'Set Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.x2l,
  },
  title: {
    fontSize: FontSizes.x2l,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    color: Colors.fhsuGold,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    paddingRight: 50,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  requirementsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.x2l,
  },
  requirementsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  requirementText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  requirementTextMet: {
    color: '#10B981',
  },
  submitButton: {
    backgroundColor: Colors.fhsuGold,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.fhsuBlack,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
});
