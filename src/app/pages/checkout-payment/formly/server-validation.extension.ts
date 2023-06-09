import { FormControl } from '@angular/forms';
import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Extension to enable server-side validation.
 * It accesses the form state with two properties: errors and changedSinceErrors.
 * If these are set for a property, it will have an error.
 * To use this extension, set the formState in the relevant component.
 */
export const serverValidationExtension: FormlyExtension = {
  prePopulate: field => {
    if (field.hide) {
      return;
    }
    field.props = {
      ...field.props,
      showValidation: (fld: FormlyFieldConfig) =>
        field.formControl?.valid &&
        field.formControl?.dirty &&
        !field.options.formState.changedSinceErrors?.[fld.key as string],
    };

    field.validators = {
      ...field.validators,
      serverError: (_: FormControl, fld: FormlyFieldConfig) =>
        !(
          fld.options.formState.errors?.[fld.key as string] &&
          fld.options.formState.changedSinceErrors?.[fld.key as string] === false
        ),
    };

    field.validation = {
      ...field.validation,
      messages: {
        ...field.validation?.messages,
        serverError: '',
      },
    };

    field.expressions = {
      ...field.expressions,
      'validation.messages.serverError': field.options.formState.errors?.[field.key as string],
    };
  },
};
