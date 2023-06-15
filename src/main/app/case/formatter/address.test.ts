import { getFormattedAddress } from './address';

describe('getFormattedAddress', () => {
  it('returns formatted address with line breaks when all address fields are provided', () => {
    const data = {
      applicantAddress1: '123 Main Street',
      applicantAddress2: 'Apt 4B',
      applicantAddress3: 'Building 2',
      applicantAddressTown: 'Cityville',
      applicantAddressCounty: 'Countyshire',
      applicantAddressPostcode: '12345',
      applicantAddressCountry: 'Countryland',
    };

    const formattedAddress = getFormattedAddress(data);
    expect(formattedAddress).toEqual(
      '123 Main Street<br>Apt 4B<br>Building 2<br>Cityville<br>Countyshire<br>12345<br>Countryland'
    );
  });

  it('returns formatted address with line breaks when some address fields are missing', () => {
    const data = {
      applicantAddress1: '123 Main Street',
      applicantAddressTown: 'Cityville',
      applicantAddressPostcode: '12345',
      applicantAddressCountry: 'Countryland',
    };

    const formattedAddress = getFormattedAddress(data);
    expect(formattedAddress).toEqual('123 Main Street<br>Cityville<br>12345<br>Countryland');
  });

  it('returns empty string when no address fields are provided', () => {
    const data = {};

    const formattedAddress = getFormattedAddress(data);
    expect(formattedAddress).toEqual('');
  });
});
