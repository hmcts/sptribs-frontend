import { getFormattedDate } from './formatDate';

describe('getFormattedDate', () => {
  it('returns formatted date in English when all date fields are provided and valid', () => {
    const date = {
      day: '15',
      month: '06',
      year: '2023',
    };

    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toEqual('15 June 2023');
  });

  it('returns formatted date in Welsh when all date fields are provided and valid', () => {
    const date = {
      day: '15',
      month: '06',
      year: '2023',
    };

    const formattedDate = getFormattedDate(date, 'cy');
    expect(formattedDate).toEqual('15 Mehefin 2023');
  });
  it('returns empty string when any date field is empty', () => {
    const date = {
      day: '15',
      month: '',
      year: '2023',
    };

    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toEqual('');
  });

  it('returns empty string when date is invalid', () => {
    const date = {
      day: '31',
      month: '02',
      year: '2023',
    };

    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toEqual('');
  });

  it('returns empty string when date is undefined', () => {
    const formattedDate = getFormattedDate(undefined);
    expect(formattedDate).toEqual('');
  });
});
