import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { TextField } from '@/components/TextField';
import type { BiometricSupport } from '@/services/biometrics';
import { colors } from '@/theme/colors';

import { AuthFooter } from '../components/AuthFooter';
import { OrDivider } from '../components/OrDivider';
import {
  BiometricCancelledError,
  BiometricNotSetUpError,
  completeSignIn,
  hasBiometricSignIn,
  useBiometricLogin,
  useBiometricSupport,
  useLogin,
} from '../hooks';
import { loginSchema, type LoginInput } from '../schemas';

function askToEnableBiometrics(label: string) {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      `Turn on ${label}?`,
      `Use ${label} to sign in faster next time. Your biometric data never leaves this device.`,
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        { text: `Use ${label}`, onPress: () => resolve(true) },
      ],
      { cancelable: false },
    );
  });
}

async function shouldEnableBiometrics(support: BiometricSupport | undefined) {
  if (!support?.hasHardware || !support.isEnrolled) return false;
  // Already on: keep it on and store the fresh token.
  if (await hasBiometricSignIn()) return true;
  return askToEnableBiometrics(support.label);
}

export function LoginScreen() {
  const passwordRef = useRef<TextInputInstance>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const login = useLogin();
  const biometricLogin = useBiometricLogin();
  const { data: biometrics } = useBiometricSupport();

  const { control, handleSubmit, getValues, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = () =>
    handleSubmit(async (values) => {
      setFormError(null);
      try {
        const session = await login.mutateAsync(values);
        setIsFinishing(true);
        const enableBiometrics = await shouldEnableBiometrics(biometrics);
        await completeSignIn(session, enableBiometrics);
      } catch (error) {
        setIsFinishing(false);
        setFormError(getErrorMessage(error, 'Unable to sign in. Please try again.'));
      }
    })();

  const onBiometricPress = () => {
    if (!biometrics) return;
    setFormError(null);
    if (!biometrics.isEnrolled) {
      setFormError(`Set up ${biometrics.label} in your device settings to use it here.`);
      return;
    }
    biometricLogin.mutate(biometrics.label, {
      onError: (error) => {
        if (error instanceof BiometricCancelledError) return;
        if (error instanceof BiometricNotSetUpError) {
          setFormError(`Sign in with your email and password once to turn on ${biometrics.label}.`);
          return;
        }
        setFormError(getErrorMessage(error, 'Unable to sign in. Please try again.'));
      },
    });
  };

  const isBusy = login.isPending || isFinishing || biometricLogin.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.logo}>
            <Logo />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title} accessibilityRole="header">
              Welcome back
            </Text>
            <Text style={styles.subtitle}>
              Sign in to your account to access all of the features that Specialty365 offers.
            </Text>
          </View>

          <View style={styles.form}>
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
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  value={field.value}
                  onChangeText={(text) => field.onChange(text.trim())}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!isBusy}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <TextField
                  ref={passwordRef}
                  label="Password"
                  placeholder="••••••••"
                  secure
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!isBusy}
                />
              )}
            />

            <Button
              variant="link"
              title="Forgot password?"
              style={styles.forgot}
              onPress={() =>
                router.push({
                  pathname: '/forgot-password',
                  params: { email: getValues('email') },
                })
              }
            />

            {!!formError && (
              <Text style={styles.formError} accessibilityRole="alert">
                {formError}
              </Text>
            )}

            <Button
              title="Login"
              onPress={onSubmit}
              loading={login.isPending || isFinishing}
              disabled={isBusy || formState.isSubmitting}
            />

            {biometrics?.hasHardware && (
              <>
                <OrDivider />
                <Button
                  variant="secondary"
                  title={`Sign In with ${biometrics.label}`}
                  onPress={onBiometricPress}
                  loading={biometricLogin.isPending}
                  disabled={isBusy}
                  icon={
                    <Icon
                      name={{ ios: 'faceid', android: 'face' }}
                      size={20}
                      color={colors.primary}
                    />
                  }
                />
              </>
            )}
          </View>

          <View style={styles.flex} />
          <AuthFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 16,
  },
  logo: { alignItems: 'center', marginBottom: 72 },
  heading: { alignItems: 'center', gap: 10, marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
  form: { gap: 18 },
  forgot: { alignSelf: 'flex-end', marginTop: -8 },
  formError: { fontSize: 14, color: colors.danger, textAlign: 'center' },
});
