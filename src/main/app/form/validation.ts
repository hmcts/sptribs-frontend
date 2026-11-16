import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { validate as isValidEmail } from 'email-validator';
import { isEmpty } from 'lodash';

import { CaseDate } from '../case/case';

import { FormError } from './Form';

dayjs.extend(customParseFormat);

/**
 * Function to validate a field value. Can return simply a {@link FormError.errorType} string, but can optionally return
 * a {@link FormError} if greater control is needed.
 */
export type Validator = (value: unknown) => void | string | FormError | Omit<FormError, 'propertyName'>;

export type DateValidator = (caseDate: CaseDate | undefined) => void | Omit<FormError, 'propertyName'>;

export const enum ValidationError {
  REQUIRED = 'required',
  NOT_SELECTED = 'notSelected',
  INVALID = 'invalid',
  CONTAINS_MARKDOWN_LINK = 'containsMarkdownLink',
  INCOMPLETE_DAY_AND_MONTH = 'incompleteDayAndMonth',
  INCOMPLETE_DAY_AND_YEAR = 'incompleteDayAndYear',
  INCOMPLETE_MONTH_AND_YEAR = 'incompleteMonthAndYear',
  INCOMPLETE_DAY = 'incompleteDay',
  INCOMPLETE_MONTH = 'incompleteMonth',
  INCOMPLETE_YEAR = 'incompleteYear',
  INVALID_DAY = 'invalidDay',
  INVALID_MONTH = 'invalidMonth',
  INVALID_YEAR = 'invalidYear',
  INVALID_DATE_IN_FUTURE = 'invalidDateInFuture',
  INVALID_DATE_OBSOLETE = 'invalidDateObsolete',
  LESS_THAN_A_YEAR = 'lessThanAYear',
  INVALID_DATE_OVER_18 = 'invalidDateOver18',
  INVALID_USED_EXAMPLE = 'invalidUsedExample',
  CONTAINS_INVALID_CHARACTERS = 'containsInvalidCharacters',
}

/** `parseInt` and `+` are both overly permissive in different ways. Check both. */
const parseSmallInteger = (value: string): number | undefined => {
  const unitaryPlus = +value;
  const parsedInt = Number.parseInt(value, 10);
  if (unitaryPlus !== parsedInt) {
    // Either they are numbers but not equal (e.g. 1.1 vs 1) or one or both is NaN (since NaN !== NaN).
    // Either way it should not be parsed as a valid integer.
    return undefined;
  }
  return parsedInt;
};

const isLeapYear = (year: number): boolean => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

export const isFieldFilledIn: Validator = value => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return ValidationError.REQUIRED;
  }
};

export const isFileNameValid = (filename: string | undefined): filename is string => {
  if (typeof filename !== 'string' || isFieldFilledIn(filename) || filename === '.' || filename === '..') {
    return false;
  }

  if (filename.includes('/') || /[<>"\\|?*]/.test(filename)) {
    return false;
  }

  return Array.from(filename).every(character => {
    const characterCode = character.codePointAt(0);

    return characterCode !== undefined && characterCode >= 32 && characterCode !== 127;
  });
};

export const isCICAReferenceNumberAcceptable: Validator = value => {
  if (value && value[0] !== 'G' && value[0] !== 'X') {
    return ValidationError.INVALID;
  }
};

export const isCCDReferenceNumberAcceptable: Validator = value => {
  if (typeof value !== 'string' || !/^\d{16}$/.test(value)) {
    return ValidationError.INVALID;
  }
};

export const atLeastOneFieldIsChecked: Validator = fields => {
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return ValidationError.REQUIRED;
  }
};

export const doesArrayHaveValues: Validator = value => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return ValidationError.REQUIRED;
  }
};

export const isDateInputNotFilled: DateValidator = date => {
  if (!date || (isEmpty(date.day) && isEmpty(date.month) && isEmpty(date.year))) {
    return { errorType: ValidationError.REQUIRED, subitemNames: ['day', 'month', 'year'] };
  } else if (isEmpty(date.day) && isEmpty(date.month)) {
    return { errorType: ValidationError.INCOMPLETE_DAY_AND_MONTH, subitemNames: ['day', 'month'] };
  } else if (isEmpty(date.day) && isEmpty(date.year)) {
    return { errorType: ValidationError.INCOMPLETE_DAY_AND_YEAR, subitemNames: ['day', 'year'] };
  } else if (isEmpty(date.month) && isEmpty(date.year)) {
    return { errorType: ValidationError.INCOMPLETE_MONTH_AND_YEAR, subitemNames: ['month', 'year'] };
  } else if (isEmpty(date.day)) {
    return { errorType: ValidationError.INCOMPLETE_DAY, subitemNames: ['day'] };
  } else if (isEmpty(date.month)) {
    return { errorType: ValidationError.INCOMPLETE_MONTH, subitemNames: ['month'] };
  } else if (isEmpty(date.year)) {
    return { errorType: ValidationError.INCOMPLETE_YEAR, subitemNames: ['year'] };
  } else {
    return;
  }
};

export const isDateInputInvalid: DateValidator = date => {
  if (!date) {
    // Caught by a different validator.
    return;
  }

  /** Each part is valid until proven invalid. We use object instead of set to ensure ordering. */
  const invalidParts = { day: false, month: false, year: false };

  const day = parseSmallInteger(date.day);
  const month = parseSmallInteger(date.month);
  const year = parseSmallInteger(date.year);

  invalidParts.day = day === undefined || day < 1 || day > 31;
  invalidParts.month = month === undefined || month < 1 || month > 12;
  invalidParts.year = year === undefined || year < 1000;

  if (!invalidParts.day && !invalidParts.month) {
    // Could still be an invalid day for that month
    const monthLength = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // use ! because if they were undefined we'd have found them invalid above.
    if (day! > monthLength[month! - 1]) {
      invalidParts.day = true;
      invalidParts.month = true;
    }
  }

  if (!invalidParts.day && !invalidParts.month && !invalidParts.year) {
    // Could still be an invalid day for that month in that year (i.e. 29th Feb on a non-leap year)
    if (day === 29 && month === 2 && !isLeapYear(year!)) {
      invalidParts.day = true;
      invalidParts.month = true;
      invalidParts.year = true;
    }
  }

  /** e.g. ['day', 'year'] */
  const invalidPartsArray = Object.keys(invalidParts).filter(
    part => invalidParts[part]
  ) as (keyof typeof invalidParts)[];

  if (invalidPartsArray.length === 0) {
    return;
  }

  if (invalidPartsArray.length === 1) {
    const part = invalidPartsArray[0];
    return {
      errorType: {
        day: ValidationError.INVALID_DAY,
        month: ValidationError.INVALID_MONTH,
        year: ValidationError.INVALID_YEAR,
      }[part],
      subitemNames: invalidPartsArray,
    };
  }

  return { errorType: ValidationError.INVALID, subitemNames: invalidPartsArray };
};

export const isFutureDate: DateValidator = date => {
  if (!date) {
    return;
  }

  const enteredDate = new Date(+date.year, +date.month - 1, +date.day);
  if (new Date() < enteredDate) {
    return { errorType: ValidationError.INVALID_DATE_IN_FUTURE, subitemNames: ['day', 'month', 'year'] };
  }
};

export const isObsoleteDate: DateValidator = date => {
  if (!date) {
    return;
  }

  const enteredDate = new Date(+date.year, +date.month - 1, +date.day);
  if (new Date('1900-01-01') > enteredDate) {
    return { errorType: ValidationError.INVALID_DATE_OBSOLETE, subitemNames: ['day', 'month', 'year'] };
  }
};

export const isLessThanAYear: DateValidator = date => {
  if (!date) {
    return;
  }

  const enteredDate = new Date(+date.year, +date.month - 1, +date.day);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (!(enteredDate < oneYearAgo)) {
    return { errorType: ValidationError.LESS_THAN_A_YEAR, subitemNames: ['day', 'month', 'year'] };
  }
};

export const isMoreThan18Years: DateValidator = date => {
  if (!date) {
    return;
  }

  const enteredDate = new Date(+date.year, +date.month - 1, +date.day);
  const eighteenYearAgo = new Date();
  eighteenYearAgo.setFullYear(eighteenYearAgo.getFullYear() - 18);
  if (enteredDate < eighteenYearAgo) {
    return { errorType: ValidationError.INVALID_DATE_OVER_18, subitemNames: ['day', 'month', 'year'] };
  }
};

export const isInvalidHelpWithFeesRef: Validator = value => {
  const fieldNotFilledIn = isFieldFilledIn(value);
  if (fieldNotFilledIn) {
    return fieldNotFilledIn;
  }

  if (typeof value === 'string') {
    if (!value.match(/^HWF-[A-Z0-9]{3}-[A-Z0-9]{3}$/i)) {
      return ValidationError.INVALID;
    }

    if (value.toUpperCase() === 'HWF-A1B-23C') {
      return ValidationError.INVALID_USED_EXAMPLE;
    }
  }
};

export const isInvalidPostcode: Validator = value => {
  const fieldNotFilledIn = isFieldFilledIn(value);
  if (fieldNotFilledIn) {
    return fieldNotFilledIn;
  }

  const trimmedPostcode = (value as string).trim();

  if (!trimmedPostcode.match(/^(?=.*\d)[a-zA-Z0-9]+(?:[\s-]+[a-zA-Z0-9]+)*$/)) {
    return ValidationError.INVALID;
  }
};

export const isPhoneNoValid: Validator = value => {
  if (typeof value === 'string') {
    return !/^$|^[0-9 +()-]{11,}$/.exec(value) ? ValidationError.INVALID : undefined;
  }
};

export const isEmailValid: Validator = value => {
  if (isEmpty(value)) {
    return;
  }

  if (!isValidEmail(value as string)) {
    return ValidationError.INVALID;
  }
};

export const isFieldLetters: Validator = value => {
  if (!(value as string).match(/^[\p{Script=Latin}'’\-\s]*$/gu)) {
    return ValidationError.INVALID;
  }
};

export const isValidCaseReference: Validator = value => {
  if (!(value as string).match(/^\d{16}$/) && !(value as string).match(/^\d{4}-\d{4}-\d{4}-\d{4}$/)) {
    return ValidationError.INVALID;
  }
};

export const isValidAccessCode: Validator = value => {
  if ((value as string).trim().length !== 8) {
    return ValidationError.INVALID;
  }
};

export const isAddressSelected: Validator = value => {
  if ((value as string)?.trim() === '-1') {
    return ValidationError.NOT_SELECTED;
  }
};

export const isTextAreaValid: Validator = value => {
  if (value && (value as string).trim?.().length > 500) {
    return ValidationError.INVALID;
  }
};

export const isMarkDownLinkIncluded: Validator = value => {
  if (value) {
    const valueToValidate = String(value);
    const firstIndex = valueToValidate.indexOf('[');
    const secondIndex = valueToValidate.indexOf(')');

    if (firstIndex !== -1 && secondIndex !== -1 && firstIndex < secondIndex) {
      const subStringToValidate = valueToValidate.substring(firstIndex, secondIndex + 1);
      if (subStringToValidate && new RegExp(/^\[(.*?)]\((https?:\/\/.*?)\)$/).exec(subStringToValidate)) {
        return ValidationError.CONTAINS_MARKDOWN_LINK;
      }
    }
  }
};

export const containsInvalidCharacters: Validator = value => {
  if (value && (value as string).match(/[<>]/gu)) {
    return ValidationError.CONTAINS_INVALID_CHARACTERS;
  }
};
