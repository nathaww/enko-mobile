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
import { LoginSchema, type LoginValues } from './auth.schemas';
import { useLoginMutation } from './auth.mutations';

const initialValues: LoginValues = { email: '', password: '' };

export function Login() {
  const theme = useTheme();
  const mutation = useLoginMutation();

  return (
    <Formik
      initialValues={initialValues}
      validate={zodValidate(LoginSchema)}
      onSubmit={(values) => mutation.mutate(values)}
    >
      {({ handleSubmit, isValid, dirty }) => (
        <AuthScaffold
          title="Sign in."
          subtitle="Welcome back. Track from where you left off."
          showBrand
          footer={
            <>
              <Button
                label="Sign in"
                onPress={() => handleSubmit()}
                fullWidth
                loading={mutation.isPending}
                disabled={!dirty || !isValid}
              />
              <View style={styles.bottomLink}>
                <Text style={[typography.bodySm, { color: theme.colors.onSurfaceMuted }]}>
                  No account?{' '}
                </Text>
                <Pressable onPress={() => router.replace('/(auth)/register')} hitSlop={8}>
                  <Text style={[typography.button, { color: theme.colors.brand }]}>
                    Create one
                  </Text>
                </Pressable>
              </View>
            </>
          }
        >
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
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
          />
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            hitSlop={8}
            style={({ pressed }) => [styles.forgot, pressed && { opacity: 0.6 }]}
          >
            <Text style={[typography.button, { color: theme.colors.brand }]}>
              Forgot password?
            </Text>
          </Pressable>
        </AuthScaffold>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'flex-end' },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

export default Login;
