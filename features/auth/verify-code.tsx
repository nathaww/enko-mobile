import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Formik } from 'formik';
import { useLocalSearchParams } from 'expo-router';
import { AuthScaffold } from './components/AuthScaffold';
import { Button } from '@/components/Button';
import { CodeInput } from '@/components/CodeInput';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { spacing, typography } from '@/theme';
import { zodValidate } from '@/utils/zodValidate';
import { VerifyCodeSchema, type VerifyCodeValues } from './auth.schemas';
import { useVerifyCodeMutation } from './auth.mutations';
import { requestPasswordReset } from './auth-api';

const initialValues: VerifyCodeValues = { code: '' };

export function VerifyCode() {
  const theme = useTheme();
  const toast = useToast();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';
  const mutation = useVerifyCodeMutation();

  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    try {
      await requestPasswordReset({ email });
      toast('success', { title: 'Code resent', description: `Sent to ${email}` });
      setCooldown(45);
    } catch {
      toast('error', { title: 'Could not resend', description: 'Try again in a moment.' });
    } finally {
      setResending(false);
    }
  };

  const masked = email.replace(/(^.).+(@.+)/, '$1•••$2');

  return (
    <Formik
      initialValues={initialValues}
      validate={zodValidate(VerifyCodeSchema)}
      onSubmit={(values) => mutation.mutate({ email, code: values.code })}
    >
      {({ handleSubmit, isValid, values, setFieldValue }) => (
        <AuthScaffold
          title="Verify it's you."
          subtitle={
            email
              ? `We sent a 6-digit code to ${masked}.`
              : 'Enter the 6-digit code we sent.'
          }
          footer={
            <Button
              label="Verify"
              onPress={() => handleSubmit()}
              fullWidth
              loading={mutation.isPending}
              disabled={!isValid || values.code.length < 6}
            />
          }
        >
          <CodeInput
            name="code"
            length={6}
            onComplete={(code) => {
              setFieldValue('code', code).then(() => handleSubmit());
            }}
          />

          <View style={styles.resendRow}>
            <Text style={[typography.bodySm, { color: theme.colors.onSurfaceMuted }]}>
              Didn't get it?{' '}
            </Text>
            <Pressable
              onPress={resend}
              disabled={resending || cooldown > 0 || !email}
              hitSlop={8}
            >
              <Text
                style={[
                  typography.button,
                  {
                    color:
                      cooldown > 0 || !email
                        ? theme.colors.onSurfaceDim
                        : theme.colors.brand,
                  },
                ]}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </Text>
            </Pressable>
          </View>
        </AuthScaffold>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});

export default VerifyCode;
