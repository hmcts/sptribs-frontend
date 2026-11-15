//import { SummaryListContent } from '../../steps/common/models/summaryListContent';
import { Case, CaseWithId } from '../case/case';
import { AnyObject } from '../controller/PostController';

import { setupCheckboxParser } from './parser';
import { Validator } from './validation';

export class Form {
  constructor(private readonly fields: FormFields) {}

  /**
   * Pass the form body to any fields with a parser and return mutated body;
   */
  public getParsedBody(body: AnyObject, checkFields?: FormContent['fields']): Partial<CaseWithFormData> {
    const fields = checkFields || this.fields;

    const parsedBody = Object.entries(fields)
      .map(setupCheckboxParser(!!body.saveAndSignOut))
      .filter(([, field]) => typeof field?.parser === 'function')
      .flatMap(([key, field]) => {
        const parsed = field.parser?.(body);
        return Array.isArray(parsed) ? parsed : [[key, parsed]];
      });

    let subFieldsParsedBody = {};
    for (const [, value] of Object.entries(fields)) {
      (value as FormOptions)?.values
        ?.filter(option => option.subFields !== undefined)
        .map(fieldWithSubFields => fieldWithSubFields.subFields)
        .map(subField => this.getParsedBody(body, subField))
        .forEach(parsedSubField => {
          subFieldsParsedBody = { ...subFieldsParsedBody, ...parsedSubField };
        });
    }

    return { ...body, ...subFieldsParsedBody, ...Object.fromEntries(parsedBody) };
  }

  /**
   * Pass the form body to any fields with a validator and return a list of errors
   */
  public getErrors(body: Partial<Case>): FormError[] {
    return Object.entries(this.fields).flatMap(fieldWithId => this.getErrorsFromField(body, ...fieldWithId));
  }

  private getErrorsFromField(body: Partial<Case>, id: string, field: FormField): FormError[] {
    const validatorError = field.validator && field.validator(body[id]);

    // The error may have been returned as a string, or a partial FormError. Handle each case.
    const formError: FormError | undefined = validatorError
      ? typeof validatorError === 'string'
        ? { propertyName: id, errorType: validatorError }
        : { propertyName: id, ...validatorError }
      : undefined;

    const errors: FormError[] = formError ? [formError] : [];

    // if there are checkboxes or options, check them for errors
    if (isFormOptions(field)) {
      const valuesErrors = field.values.flatMap(value => this.getErrorsFromField(body, value.name || id, value));

      errors.push(...valuesErrors);
    }
    // if there are subfields and the current field is selected then check for errors in the subfields
    else if (field.subFields) {
      if (body[id] === field.value || (body[id] && body[id].includes(field.value))) {
        const subFields = Object.entries(field.subFields);
        const subFieldErrors = subFields.flatMap(([subId, subField]) => this.getErrorsFromField(body, subId, subField));

        errors.push(...subFieldErrors);
      }
    }

    return errors;
  }

  public getFieldNames(): Set<string> {
    const fields = this.fields;
    const fieldNames: Set<string> = new Set();
    for (const fieldKey in fields) {
      const stepField = fields[fieldKey] as FormOptions;
      if (stepField.values && stepField.type !== 'date') {
        for (const [, value] of Object.entries(stepField.values)) {
          if (value.name) {
            fieldNames.add(value.name);
          } else {
            fieldNames.add(fieldKey);
          }
          if (value.subFields) {
            for (const field of Object.keys(value.subFields)) {
              fieldNames.add(field);
            }
          }
        }
      } else {
        fieldNames.add(fieldKey);
      }
    }

    return fieldNames;
  }

  public isComplete(body: Partial<Case>): boolean {
    for (const field of this.getFieldNames().values()) {
      if (body[field] === undefined || body[field] === null) {
        return false;
      }
    }

    return true;
  }
}
export type DropdownOptionsLookup = (lang: Record<string, never>) => [];

export type LanguageLookup = (lang: Record<string, never>) => string;

type Parser = (value: Record<string, unknown> | string[]) => unknown;

type Label = string | LanguageLookup;

type Warning = Label;

export type FormFields = Record<string, FormField>;
export type FormFieldsFn = (userCase: Partial<Case>, language?: string) => FormFields;

export interface FormContent {
  submit?: {
    text: Label;
    classes?: string;
  };
  saveAsDraft?: {
    text: Label;
    classes?: string;
  };
  cancel?: {
    text: Label;
    classes?: string;
  };
  fields: FormFields | FormFieldsFn;
}

export type FormField = FormInput | FormOptions;

export interface FormOptions {
  id?: string;
  type: string;
  label?: Label;
  section?: Label;
  hint?: Label;
  classes?: string;
  labelHidden?: boolean;
  labelSize?: string | null;
  hideError?: boolean;
  values: FormInput[];
  attributes?: Partial<HTMLInputElement | HTMLTextAreaElement>;
  validator?: Validator;
  parser?: Parser;
  disabled?: boolean;

  // rows?: SummaryListContent;
}

export interface FormInput {
  id?: string;
  name?: string;
  type?: string;
  label?: Label;
  labelSize?: string | null;
  section?: Label;
  hint?: Label;
  subtext?: Label;
  classes?: string;
  hidden?: boolean;
  selected?: boolean;
  value?: string | number;
  attributes?: Partial<HTMLInputElement | HTMLTextAreaElement>;
  validator?: Validator;
  parser?: Parser;
  warning?: Warning;
  conditionalText?: Label;
  subFields?: Record<string, FormField>;
  divider?: Label; //Required for divider between checkbox options
  open?: boolean;
  options?: DropdownOptionsLookup;
  disabled?: boolean;
  autocomplete?: string;
}

function isFormOptions(field: FormField): field is FormOptions {
  return (field as FormOptions).values !== undefined;
}

export interface CsrfField {
  _csrf: string;
}

export type FormError = {
  /** Name and HTML ID of the field where the error message should be displayed. */
  propertyName: string;
  /** Internal string for the error type, corresponding to a user-readable string under `errors[propertyName]`. */
  errorType: string;
  /**
   * If this error specifically relates to one or more subitems of this field, list the names here. The first listed
   * name will be used as the fragment link. All sub items listed here will have error styling applied.
   * E.g. `subitemNames: ['day', 'year']` for a date input with errors in the day and year fields.
   */
  subitemNames?: string[];
};

interface CaseWithFormData extends CaseWithId {
  _csrf: string;
  saveAndSignOut?: string;
  saveBeforeSessionTimeout?: string;
  sendToApplicant2ForReview?: string;
  addAnotherName?: string;
  addAnotherNameHidden?: string;
}
