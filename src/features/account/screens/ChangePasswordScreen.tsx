import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { colors } from '@/theme/colors';

import { useChangePassword } from '../hooks';
import { changePasswordSchema, PASSWORD_RULES, type ChangePasswordInput } from '../schemas';

export function ChangePasswordScreen() {
  const newRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const changePassword = useChangePassword();

  const { control, handleSubmit } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = useWatch({ control, name: 'newPassword' });

  const onSubmit = () =>
    handleSubmit(({ currentPassword, newPassword: next }) => {
      setServerError(null);
      changePassword.mutate(
        { currentPassword, newPassword: next },
        {
          onSuccess: () =>
            Alert.alert('Password updated', 'Use your new password next time you sign in.', [
              { text: 'OK', onPress: () => router.back() },
            ]),
          onError: (error) => setServerError(getErrorMessage(error)),
        },
      );
    })();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Change Password" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="currentPassword"
            render={({ field, fieldState }) => (
              <TextField
                label="Current password"
                secure
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => newRef.current?.focus()}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <TextField
                ref={newRef}
                label="New password"
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => confirmRef.current?.focus()}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <TextField
                ref={confirmRef}
                label="Confirm new password"
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Card style={styles.rules}>
            <Text style={styles.rulesTitle}>PASSWORD MUST HAVE</Text>
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(newPassword);
              return (
                <View
                  key={rule.id}
                  style={styles.rule}
                  accessible
                  accessibilityLabel={`${rule.label}: ${met ? 'met' : 'not met'}`}>
                  <Icon
                    name={
                      met
                        ? { ios: 'checkmark.circle.fill', android: 'check_circle' }
                        : { ios: 'circle', android: 'radio_button_unchecked' }
                    }
                    size={16}
                    color={met ? colors.success : colors.textMuted}
                  />
                  <Text style={[styles.ruleText, !met && styles.ruleUnmet]}>{rule.label}</Text>
                </View>
              );
            })}
          </Card>

          {!!serverError && (
            <Text style={styles.serverError} accessibilityRole="alert">
              {serverError}
            </Text>
          )}

          <Button title="Update Password" onPress={onSubmit} loading={changePassword.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 16, gap: 18, paddingBottom: 32 },
  rules: { gap: 10 },
  rulesTitle: { fontSize: 14, fontWeight: '600', letterSpacing: 0.8, color: colors.textSecondary },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleText: { fontSize: 15, color: colors.text },
  ruleUnmet: { color: colors.textMuted },
  serverError: { fontSize: 14, color: colors.danger, textAlign: 'center' },
});
