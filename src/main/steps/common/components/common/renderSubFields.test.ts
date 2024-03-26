import { isFieldFilledIn } from '../../../../app/form/validation';

import { renderSubFields } from './renderSubFields';
import { InputValues } from './types';

describe('steps > common > components > common > renderSubFields', () => {
  it('should render multiple fields if multiple values provided', () => {
    const inputFieldName = 'inputField';
    const fieldName = 'field';
    const inputType = 'input';
    const validator = isFieldFilledIn;

    const subFields = renderSubFields([
      { fieldName: inputFieldName, type: inputType, validator } as InputValues,
      { fieldName, type: inputType, validator } as InputValues,
    ]);

    expect(subFields[inputFieldName].type).toBe(inputType);
    expect(subFields[fieldName].type).toBe(inputType);
  });

  it('should correctly render all input subfields', () => {
    const fieldName = 'field';
    const type = 'input';
    const validator = isFieldFilledIn;

    const subFields = renderSubFields([{ fieldName, type, validator } as InputValues]);

    expect(subFields[fieldName].type).toBe(type);
  });

  it('should not render fields if component type is not provided', () => {
    const fieldName = 'field';
    const validator = isFieldFilledIn;

    const subFields = renderSubFields([{ fieldName, validator } as InputValues]);

    expect(subFields).toStrictEqual({});
  });
});
