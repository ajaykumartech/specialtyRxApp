import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { colors } from '@/theme/colors';

import { useForgotPassword } from '../hooks';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas';

function backToSignIn() {
  if (router.canGoBack()) router.back();
  else router.replace('/login');
}

function HeroIcon({ name }: { name: IconName }) {
  return (
    <View style={styles.hero}>
      <Icon name={name} size={40} color={colors.primary} />
    </View>
  );
}

export function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const forgotPassword = useForgotPassword();

  const { control, handleSubmit, getValues } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: params.email ?? '' },
  });

  const onSubmit = () => handleSubmit((values) => forgotPassword.mutate(values))();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Reset Password" showBack onBack={backToSignIn} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {forgotPassword.isSuccess ? (
            <>
              <HeroIcon
                name={{
                  ios: 'envelope.badge.fill',
                  android: 'mark_email_read',
                }}
              />
              <View style={styles.heading}>
                <Text style={styles.title} accessibilityRole="header">
                  Check your email
                </Text>
                <Text style={styles.subtitle}>
                  If an account exists for {getValues('email')}, we&apos;ve sent a secure reset
                  link.
                </Text>
              </View>
              <Button title="Back to sign-in" onPress={backToSignIn} />
              <Button
                variant="link"
                title="Didn't get it? Resend link"
                onPress={onSubmit}
                loading={forgotPassword.isPending}
              />
            </>
          ) : (
            <>
              <HeroIcon name={{ ios: 'lock.shield.fill', android: 'shield_lock' }} />
              <View style={styles.heading}>
                <Text style={styles.title} accessibilityRole="header">
                  Forgot your password?
                </Text>
                <Text style={styles.subtitle}>
                  Enter the email on your account and we&apos;ll send a secure reset link.
                </Text>
              </View>

              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <TextField
                    label="Email"
                    placeholder="namesurname@srx.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                    value={field.value}
                    onChangeText={(text) => field.onChange(text.trim())}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {forgotPassword.isError && (
                <Text style={styles.formError} accessibilityRole="alert">
                  {getErrorMessage(forgotPassword.error)}
                </Text>
              )}

              <Button
                title="Send reset link"
                onPress={onSubmit}
                loading={forgotPassword.isPending}
              />

              <View style={styles.info}>
                <Icon
                  name={{ ios: 'info.circle', android: 'info' }}
                  size={16}
                  color={colors.info}
                />
                <Text style={styles.infoText}>
                  The link expires in 15 minutes and can be used only once.
                </Text>
              </View>

              <Button variant="link" title="‹ Back to sign-in" onPress={backToSignIn} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 20,
  },
  hero: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { alignItems: 'center', gap: 10, marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
  formError: { fontSize: 14, color: colors.danger, textAlign: 'center' },
  info: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.info },
});
