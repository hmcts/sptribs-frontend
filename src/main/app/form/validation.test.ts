import { CaseDate } from '../case/case';

import {
  areDateFieldsFilledIn,
  atLeastOneFieldIsChecked,
  doesArrayHaveValues,
  isAddressSelected,
  isDateInputInvalid,
  isDateInputNotFilled,
  isEmailValid,
  isFieldFilledIn,
  isFieldLetters,
  isFutureDate,
  isInvalidHelpWithFeesRef,
  isInvalidPostcode,
  isLessThanAYear,
  isMarkDownLinkIncluded,
  isMoreThan18Years,
  isObsoleteDate,
  isPhoneNoValid,
  isTextAreaValid,
  isValidAccessCode,
  isValidCaseReference,
} from './validation';

describe('Validation', () => {
  describe('isFieldFilledIn()', () => {
    test('Should check if value exist', async () => {
      const isValid = isFieldFilledIn('Yes');

      expect(isValid).toStrictEqual(undefined);
    });

    test('Should check if value does not exist', async () => {
      let value;
      const isValid = isFieldFilledIn(value);

      expect(isValid).toStrictEqual('required');
    });

    test('Should check if value is only whitespaces', async () => {
      const isValid = isFieldFilledIn('    ');

      expect(isValid).toStrictEqual('required');
    });
  });

  describe('areFieldsFilledIn()', () => {
    test('Should check if values in object exist', async () => {
      const isValid = areDateFieldsFilledIn({ day: '1', month: '1', year: '1' });
      expect(isValid).toStrictEqual(undefined);
    });

    test('Should check if all values in object does not exist', async () => {
      const isValid = areDateFieldsFilledIn({ day: '', month: '', year: '' });
      expect(isValid).toStrictEqual('required');
    });

    test('Should check if day does not exist', async () => {
      const isValid = areDateFieldsFilledIn({ day: '', month: '12', year: '' });
      expect(isValid).toStrictEqual('incompleteDay');
    });

    test('Should check if month does not exist', async () => {
      const isValid = areDateFieldsFilledIn({ day: '12', month: '', year: '' });
      expect(isValid).toStrictEqual('incompleteMonth');
    });

    test('Should check if year does not exist', async () => {
      const isValid = areDateFieldsFilledIn({ day: '21', month: '12', year: '' });
      expect(isValid).toStrictEqual('incompleteYear');
    });

    test('Should check if object does not exist', async () => {
      const isValid = areDateFieldsFilledIn(undefined);
      expect(isValid).toStrictEqual('required');
    });
  });

  describe('isFutureDate()', () => {
    test('Should check if date entered is future date', async () => {
      const dateObj = new Date();
      const date = {
        day: dateObj.getUTCDate().toString(),
        month: dateObj.getUTCMonth().toString(),
        year: (dateObj.getUTCFullYear() - 1).toString(),
      };

      let isValid = isFutureDate(undefined);
      expect(isValid).toStrictEqual(undefined);

      isValid = isFutureDate(date);
      expect(isValid).toStrictEqual(undefined);

      date.year += '1';
      isValid = isFutureDate(date);

      expect(isValid).toStrictEqual('invalidDateInFuture');
    });
  });

  describe('isDateInputNotFilled()', () => {
    test('Should return incompleteDayAndMonthAndYear error if no date fields are entered', async () => {
      const date = {
        day: '',
        month: '',
        year: '',
      };

      let isValid = isDateInputNotFilled(undefined);
      expect(isValid).toStrictEqual('incompleteDayAndMonthAndYear');

      isValid = isDateInputNotFilled(date);
      expect(isValid).toStrictEqual('incompleteDayAndMonthAndYear');
    });

    test('Should return incompleteDayAndMonth error if no day and month fields are entered', async () => {
      const date = {
        day: '',
        month: '',
        year: '2000',
      };

      const isValid = isDateInputNotFilled(date);
      expect(isValid).toStrictEqual('incompleteDayAndMonth');
    });

    test('Should return incompleteDayAndYear error if no day and year fields are entered', async () => {
      const date = {
        day: '',
        month: '12',
        year: '',
      };

      const isValid = isDateInputNotFilled(date);
      expect(isValid).toStrictEqual('incompleteDayAndYear');
    });

    test('Should return incompleteMonthAndYear error if no day and year fields are entered', async () => {
      const date = {
        day: '31',
        month: '',
        year: '',
      };

      const isValid = isDateInputNotFilled(date);
      expect(isValid).toStrictEqual('incompleteMonthAndYear');
    });

    test('Should return incompleteDay error if no day and year fields are entered', async () => {
      const date = {
        day: '',
        month: '12',
        year: '2000',
      };

      const isValid = isDateInputNotFilled(date);
      expect(isValid).toStrictEqual('incompleteDay');
    });

    test('Should return incompleteMonth error if no day and year fields are entered', async () => {
      const date = {
        day: '31',
        month: '',
        year: '2000',
      };

      const isValid = isDateInputNotFilled(date);
      expect(isValid).toStrictEqual('incompleteMonth');
    });

    test('Should return incompleteYear error if no day and year fields are entered', async () => {
      const date = {
        day: '31',
        month: '12',
        year: '',
      };

      const isValid = isDateInputNotFilled(date);
      expect(isValid).toStrictEqual('incompleteYear');
    });
  });

  describe('isObsoleteDate()', () => {
    test('Should check if date entered is too far in the past', async () => {
      const date = {
        day: '01',
        month: '01',
        year: '1899',
      };

      let isValid = isObsoleteDate(undefined);
      expect(isValid).toStrictEqual(undefined);
      isValid = isObsoleteDate(date);
      expect(isValid).toStrictEqual('invalidDateInPast');
    });
  });

  describe('isLessThanAYear()', () => {
    test('Should check if date entered is less than a year', async () => {
      const dateObj = new Date();
      const date = {
        day: dateObj.getUTCDate().toString(),
        month: (dateObj.getUTCMonth() - 6).toString(),
        year: dateObj.getUTCFullYear().toString(),
      };
      let isValid = isLessThanAYear(undefined);
      expect(isValid).toStrictEqual(undefined);

      isValid = isLessThanAYear(date);
      expect(isValid).toStrictEqual('lessThanAYear');

      date.year = (+date.year - 1).toString();
      isValid = isLessThanAYear(date);

      expect(isValid).toStrictEqual(undefined);
    });
  });

  describe('doesArrayHaveValues', () => {
    test.each([
      { value: undefined, expected: 'required' },
      { value: [], expected: 'required' },
      { value: ['MOCK_VALUE'], expected: undefined },
    ])('checks array of string validity when %o', ({ value, expected }) => {
      const isValid = doesArrayHaveValues(value);
      expect(isValid).toStrictEqual(expected);
    });
  });

  describe('isMoreThan18Years()', () => {
    test('Should check if date entered is more than 18 years', async () => {
      const dateObj = new Date();
      const date = {
        day: dateObj.getUTCDate().toString(),
        month: dateObj.getUTCMonth().toString(),
        year: (dateObj.getUTCFullYear() - 19).toString(),
      };
      let isValid = isMoreThan18Years(undefined);
      expect(isValid).toStrictEqual(undefined);

      isValid = isMoreThan18Years(date);
      expect(isValid).toStrictEqual('invalidDateOver18');

      date.year = (+date.year + 2).toString();
      isValid = isMoreThan18Years(date);

      expect(isValid).toStrictEqual(undefined);
    });
  });

  describe('isDateInputInvalid()', () => {
    test.each([
      { date: { day: 1, month: 1, year: 1970 }, expected: undefined },
      { date: { day: 31, month: 12, year: 2000 }, expected: undefined },
      { date: { day: 31, month: 12, year: 123 }, expected: undefined },
      { date: { day: 1, month: 1, year: 1 }, expected: undefined },
      { date: { day: -31, month: 12, year: 2000 }, expected: 'invalid' },
      { date: { day: 31, month: -12, year: 2000 }, expected: 'invalid' },
      { date: { day: 32, month: 12, year: 2000 }, expected: 'invalid' },
      { date: { day: 31, month: 13, year: 2000 }, expected: 'invalid' },
      { date: { day: 'no', month: '!%', year: 'way' }, expected: 'invalid' },
      { date: { day: '29', month: '2', year: '2000' }, expected: undefined },
      { date: { day: '31', month: '2', year: '2000' }, expected: 'invalid' },
      { date: { day: ' ', month: ' ', year: ' ' }, expected: undefined },
      { date: { day: '', month: 13, year: '' }, expected: 'invalid' },
      { expected: undefined },
    ])('checks dates validity when %o', ({ date, expected }) => {
      const isValid = isDateInputInvalid(date as unknown as CaseDate);

      expect(isValid).toStrictEqual(expected);
    });
  });

  describe('isInvalidHelpWithFeesRef()', () => {
    it.each([
      { mockRef: '', expected: 'required' },
      { mockRef: '1', expected: 'invalid' },
      { mockRef: '12345', expected: 'invalid' },
      { mockRef: '1234567', expected: 'invalid' },
      { mockRef: '12345!', expected: 'invalid' },
      { mockRef: 'HWFA1B23C', expected: 'invalid' },
      { mockRef: 'A1B23C', expected: 'invalid' },
      { mockRef: 'A1B-23C', expected: 'invalid' },
      { mockRef: 'HWF-A1B-23C', expected: 'invalidUsedExample' },
      { mockRef: 'HWF-AAA-BBB', expected: undefined },
      { mockRef: 'HWF-A1A-B2B', expected: undefined },
      { mockRef: 'HWF-123-456', expected: undefined },
      { mockRef: 'AAA-BBB', expected: 'invalid' },
      { mockRef: 'AAABBB', expected: 'invalid' },
      { mockRef: '123456', expected: 'invalid' },
    ])('validates the help with fees ref when %o', ({ mockRef, expected }) => {
      expect(isInvalidHelpWithFeesRef(mockRef)).toEqual(expected);
    });
  });

  describe('isInvalidPostcode()', () => {
    it.each([
      { mockRef: '', expected: 'required' },
      { mockRef: '1', expected: 'invalid' },
      { mockRef: '12345', expected: 'invalid' },
      { mockRef: '@£$£@$%', expected: 'invalid' },
      { mockRef: 'not a postcode', expected: 'invalid' },
      { mockRef: 'SW1A 1AA', expected: undefined },
      { mockRef: 'SW1A1AA', expected: undefined },
      { mockRef: 'sw1a1aa', expected: undefined },
      { mockRef: 'sw1a 1aa', expected: undefined },
      { mockRef: 'SW1A!1AA', expected: 'invalid' },
    ])('validates the help with fees ref when %o', ({ mockRef, expected }) => {
      expect(isInvalidPostcode(mockRef)).toEqual(expected);
    });
  });

  describe('isPhoneNoValid()', () => {
    it.each([
      { mockTel: '', expected: undefined },
      { mockTel: '1', expected: 'invalid' },
      { mockTel: '12345', expected: 'invalid' },
      { mockTel: '1234567', expected: 'invalid' },
      { mockTel: '12345!', expected: 'invalid' },
      { mockTel: 'A1B23C', expected: 'invalid' },
      { mockTel: '123456', expected: 'invalid' },
      { mockTel: '0123456789', expected: 'invalid' },
      { mockTel: '01234567890', expected: undefined },
      { mockTel: '+1 (0)12345678901', expected: undefined },
      { mockTel: '+1 (0)12345678901$', expected: 'invalid' },
    ])('validates a phone number when %o', ({ mockTel, expected }) => {
      expect(isPhoneNoValid(mockTel)).toEqual(expected);
    });
  });

  describe('isEmailValid()', () => {
    it.each([
      { mockEmail: '', expected: '' },
      { mockEmail: 'test', expected: 'invalid' },
      { mockEmail: '12345', expected: 'invalid' },
      { mockEmail: 'test@test.com', expected: undefined },
      { mockEmail: 'test_123@test.com', expected: undefined },
      { mockEmail: 'test_123@test@test.com', expected: 'invalid' },
    ])('validates an email when %o', ({ mockEmail, expected }) => {
      expect(isEmailValid(mockEmail)).toEqual(expected);
    });
  });

  describe('isFieldLetters()', () => {
    test.each([
      { input: 'Firstname Lastname', expected: undefined },
      { input: 'Firstname Middle-Double-barrelled Lastname', expected: undefined },
      { input: "O'Firstname O’Lastname", expected: undefined },
      { input: 'Firştnåmé Midğlø Lâßtnámê', expected: undefined },
      { input: '1stname Lastname', expected: 'invalid' },
      { input: 'Firstname! La$tname', expected: 'invalid' },
      { input: 'Firstname1 La5tname', expected: 'invalid' },
      { input: 'имя Фамилия', expected: 'invalid' },
      { input: 'όνομα επίθετο', expected: 'invalid' },
      { input: '名姓', expected: 'invalid' },
      { input: '名前苗字', expected: 'invalid' },
      { input: '이름 성', expected: 'invalid' },
      { input: 'họ và tên', expected: undefined },
      { input: '💔', expected: 'invalid' },
      { input: '<marquee>John Doe</marquee>', expected: 'invalid' },
    ])('validates only latin based letters, spaces, hyphens %s', ({ input, expected }) => {
      const isValid = isFieldLetters(input);

      expect(isValid).toStrictEqual(expected);
    });
  });

  describe('atLeastOneFieldIsChecked()', () => {
    test('Should check if value exist', async () => {
      const isValid = atLeastOneFieldIsChecked(['Yes']);

      expect(isValid).toStrictEqual(undefined);
    });

    test('Should check if value does not exist', async () => {
      const isValid = atLeastOneFieldIsChecked([]);

      expect(isValid).toStrictEqual('required');
    });
  });

  describe('isValidCaseReference()', () => {
    test('Should check if case reference is valid with hyphens', async () => {
      const isValid = isValidCaseReference('1234-1234-1234-1234');
      expect(isValid).toStrictEqual(undefined);
    });

    test('Should check if case reference is valid without hyphens', async () => {
      const isValid = isValidCaseReference('1234123412341234');
      expect(isValid).toStrictEqual(undefined);
    });

    test('Should reject invalid case reference', async () => {
      const isValid = isValidCaseReference('123412341234');
      expect(isValid).toStrictEqual('invalid');
    });

    test('Should reject empty case reference', async () => {
      const isValid = isValidCaseReference('');
      expect(isValid).toStrictEqual('invalid');
    });
  });

  describe('isValidAccessCode()', () => {
    test('Should accept valid access code', async () => {
      const isValid = isValidAccessCode('QWERTY45');
      expect(isValid).toStrictEqual(undefined);
    });

    test('Should reject invalid access code', async () => {
      const isValid = isValidAccessCode('QWERTY');
      expect(isValid).toStrictEqual('invalid');
    });

    test('Should reject empty access code', async () => {
      const isValid = isValidAccessCode('');
      expect(isValid).toStrictEqual('invalid');
    });
  });

  describe('isAddressSelected()', () => {
    test('Should accept when the selection is other than -1', async () => {
      const isValid = isAddressSelected('1');
      expect(isValid).toStrictEqual(undefined);
    });

    test('Should reject when the selection is -1', async () => {
      const isValid = isAddressSelected('-1');
      expect(isValid).toStrictEqual('notSelected');
    });
  });
});

describe('isTextAreaValid()', () => {
  test('Should check if value exist', async () => {
    const isValid = isTextAreaValid('Yes');
    expect(isValid).toStrictEqual(undefined);
  });

  test('Should check if value does not exist', async () => {
    const value =
      'abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz098765432109876543212345abcdefghijklmnopqrstquvxyz0987654321098765432123450abcdefghijklmnopqrstuvwxyz0987654321000000000000000000000000000000';

    expect(isTextAreaValid(value)).toStrictEqual('invalid');
  });
});

describe('isMarkDownLinkIncluded()', () => {
  test('should return error if value contains markdown link and additional text before', async () => {
    const isValid = isMarkDownLinkIncluded('info [Text](https://www.google.co.uk)');
    expect(isValid).toStrictEqual('containsMarkdownLink');
  });

  test('should return error if value contains markdown link and additional text before and after', async () => {
    const isValid = isMarkDownLinkIncluded('info [Text](https://www.google.co.uk) some info');
    expect(isValid).toStrictEqual('containsMarkdownLink');
  });

  test('should return error if value is a markdown link', async () => {
    const isValid = isMarkDownLinkIncluded('[Text](https://www.google.co.uk)');
    expect(isValid).toStrictEqual('containsMarkdownLink');
  });

  test('should return null if value passed contains []() and is valid', async () => {
    const isValid = isMarkDownLinkIncluded('[hello](test)');
    expect(isValid).toStrictEqual(undefined);
  });

  test('should return null if value passed contains ) before [ and is valid', async () => {
    const isValid = isMarkDownLinkIncluded('(some)  [tests]');
    expect(isValid).toStrictEqual(undefined);
  });

  test('should return null if value passed is valid', async () => {
    const isValid = isMarkDownLinkIncluded('Some document info');
    expect(isValid).toStrictEqual(undefined);
  });

  test('should return null if value passed is empty', async () => {
    const isValid = isMarkDownLinkIncluded('');
    expect(isValid).toStrictEqual(undefined);
  });

  test('should return null if value passed is undefined', async () => {
    const isValid = isMarkDownLinkIncluded(undefined);
    expect(isValid).toStrictEqual(undefined);
  });
});
