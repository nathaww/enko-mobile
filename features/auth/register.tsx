import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Formik } from 'formik';
import { router } from 'expo-router';
import { AuthScaffold } from './components/AuthScaffold';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';
import { zodValidate } from '@/utils/zodValidate';
import { RegisterSchema, type RegisterValues } from './auth.schemas';
import { useRegisterMutation } from './auth.mutations';

const initialValues: RegisterValues = { name: '', email: '', password: '' };
const validateRegister = zodValidate(RegisterSchema);

export function Register() {
  const theme = useTheme();
  const mutation = useRegisterMutation();

  return (
    <Formik
      initialValues={initialValues}
      validate={validateRegister}
      validateOnChange={false}
      validateOnBlur
      onSubmit={(values) => mutation.mutate(values)}
    >
      {({ handleSubmit, isValid, dirty }) => (
        <AuthScaffold
          title="Create account."
          subtitle="Free, private, and yours. Export your data anytime."
          footer={
            <>
              <Button
                label="Create account"
                onPress={() => handleSubmit()}
                fullWidth
                loading={mutation.isPending}
                disabled={!dirty || !isValid}
              />
              <View style={styles.bottomLink}>
                <Text style={[typography.bodySm, { color: theme.colors.onSurfaceMuted }]}>
                  Have an account?{' '}
                </Text>
                <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
                  <Text style={[typography.button, { color: theme.colors.brand }]}>Sign in</Text>
                </Pressable>
              </View>
            </>
          }
        >
          <FormField
            name="name"
            label="Full name"
            placeholder="Nathan Solomon"
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
          />
          <FormField
            name="email"
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <FormField
            name="password"
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Text style={[typography.bodySm, { color: theme.colors.onSurfaceDim }]}>
            By signing up you agree to our Terms and Privacy Policy.
          </Text>
        </AuthScaffold>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

export default Register;
