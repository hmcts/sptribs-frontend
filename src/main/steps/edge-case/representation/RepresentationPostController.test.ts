import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { YesOrNo } from '../../../app/case/definition';
import { Form } from '../../../app/form/Form';
import { isFieldFilledIn } from '../../../app/form/validation';
import * as steps from '../../../steps';
import { CICA_REFERENCE_NUMBER, REPRESENTATION_QUALIFIED } from '../../urls';

import RepresentationPostController from './representationPostController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

describe('RepresentationPostController', () => {
  afterEach(() => {
    getNextStepUrlMock.mockClear();
  });

  test('Should redirect back to the current page with the form data on errors', async () => {
    const errors = [{ errorType: 'required', propertyName: 'representation' }];
    const mockForm = {
      fields: {
        representation: {
          type: 'radios',
          values: [
            { label: l => l.no, value: YesOrNo.YES },
            { label: l => l.yes, value: YesOrNo.NO },
          ],
          validator: isFieldFilledIn,
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new RepresentationPostController(mockForm.fields);

    const req = mockRequest({});
    const res = mockResponse();
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(req.path);
    expect(req.session.errors).toEqual(errors);
  });

  test('Should redirect to the representation qualifed page when yes radio button selected', async () => {
    const mockForm = {
      fields: {
        representation: {
          type: 'radios',
          values: [
            { label: l => l.no, value: YesOrNo.YES },
            { label: l => l.yes, value: YesOrNo.NO },
          ],
          validator: isFieldFilledIn,
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new RepresentationPostController(mockForm.fields);

    const body = { representation: 'Yes' };

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(REPRESENTATION_QUALIFIED);
  });

  test('Should not redirect to the representation qualifed page when errors occur and yes radio button selected', async () => {
    const errors = [{ errorType: 'required', propertyName: 'representation' }];
    const mockForm = {
      fields: {
        representation: {
          type: 'radios',
          values: [
            { label: l => l.no, value: YesOrNo.YES },
            { label: l => l.yes, value: YesOrNo.NO },
          ],
          validator: isFieldFilledIn,
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new RepresentationPostController(mockForm.fields);

    const body = { representation: 'Yes' };

    jest
      .spyOn(Form.prototype, 'getErrors')
      .mockReturnValue([{ errorType: 'required', propertyName: 'representation' }]);

    const req = mockRequest({ body });

    const res = mockResponse();
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(req.path);
    expect(req.session.errors).toEqual(errors);

    (Form.prototype.getErrors as jest.Mock).mockRestore();
  });

  test('Should redirect to cica-reference-number page when no radio button selected', async () => {
    const mockForm = {
      fields: {
        representation: {
          type: 'radios',
          values: [
            { label: l => l.no, value: YesOrNo.YES },
            { label: l => l.yes, value: YesOrNo.NO },
          ],
          validator: isFieldFilledIn,
        },
      },
      submit: {
        text: l => l.continue,
      },
    };
    const controller = new RepresentationPostController(mockForm.fields);

    const body = { representation: 'No' };

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(CICA_REFERENCE_NUMBER);
  });

  test('Should redirect to cica-reference-number page when no radio button selected on form with a custom field function', async () => {
    const fieldsFn = jest.fn().mockReturnValue({
      representation: {
        type: 'radios',
        values: [
          { label: l => l.no, value: YesOrNo.YES },
          { label: l => l.yes, value: YesOrNo.NO },
        ],
        validator: isFieldFilledIn,
      },
    });
    const controller = new RepresentationPostController(fieldsFn);

    const body = { representation: 'No' };

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);

    expect(getNextStepUrlMock).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(CICA_REFERENCE_NUMBER);
    expect(fieldsFn).toHaveBeenCalledWith(req.session.userCase);
  });
});
