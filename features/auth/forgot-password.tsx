import React from 'react';
import { Formik } from 'formik';
import { AuthScaffold } from './components/AuthScaffold';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { zodValidate } from '@/utils/zodValidate';
import { ForgotPasswordSchema, type ForgotPasswordValues } from './auth.schemas';
import { useForgotPasswordMutation } from './auth.mutations';

const initialValues: ForgotPasswordValues = { email: '' };

export function ForgotPassword() {
  const mutation = useForgotPasswordMutation();

  return (
    <Formik
      initialValues={initialValues}
      validate={zodValidate(ForgotPasswordSchema)}
      onSubmit={(values) => mutation.mutate(values)}
    >
      {({ handleSubmit, isValid, dirty }) => (
        <AuthScaffold
          title="Reset your password."
          subtitle="Enter the email tied to your account and we'll send a 6-digit code."
          footer={
            <Button
              label="Send code"
              onPress={() => handleSubmit()}
              fullWidth
              loading={mutation.isPending}
              disabled={!dirty || !isValid}
            />
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
            autoFocus
          />
        </AuthScaffold>
      )}
    </Formik>
  );
}

export default ForgotPassword;
