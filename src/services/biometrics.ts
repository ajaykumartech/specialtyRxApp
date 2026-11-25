import * as LocalAuthentication from 'expo-local-authentication';

/** The design brands biometric sign-in as "FaceID" on every device. */
export const BIOMETRIC_LABEL = 'FaceID';

export type BiometricSupport = {
  hasHardware: boolean;
  isEnrolled: boolean;
  /** Label for buttons and prompts. The OS still uses whatever the device has (face or fingerprint). */
  label: string;
};

export async function getBiometricSupport(): Promise<BiometricSupport> {
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return { hasHardware, isEnrolled, label: BIOMETRIC_LABEL };
}

export async function authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}
