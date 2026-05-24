import type { ZodType } from 'zod';
import type { FormikErrors } from 'formik';

/**
 * Adapter: validate a Formik form against a Zod schema.
 *
 *   const validate = zodValidate(LoginSchema);
 *   <Formik initialValues={initial} validate={validate} onSubmit={handle} />
 *
 * Returns Formik's expected error shape — `{ fieldName: 'error message' }`.
 * Nested paths join with `.`.
 */
export function zodValidate<T extends object>(schema: ZodType<T>) {
  return (values: T): FormikErrors<T> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) errors[path] = issue.message;
    }
    return errors as FormikErrors<T>;
  };
}
