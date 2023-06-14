import { SummaryListContent } from '../models/summaryListContent';

import { mapSummaryListContent } from './mapSummaryListContent';

describe('mapSummaryListContent', () => {
  it('should map values to SummaryListContent', () => {
    const values = [
      { id: 1, firstNames: 'John', lastNames: 'Doe' },
      { id: 2, firstNames: 'Jane', lastNames: 'Smith' },
    ];
    const actionItems = ['Edit', 'Delete'];
    const path = '/example';

    const expected: SummaryListContent = {
      rows: [
        {
          key: {
            text: 'John Doe',
          },
          actions: {
            items: [
              {
                href: '/example?remove=1',
                text: 'Edit',
                visuallyHiddenText: 'John Doe',
              },
              {
                href: '/example?remove=1',
                text: 'Delete',
                visuallyHiddenText: 'John Doe',
              },
            ],
          },
        },
        {
          key: {
            text: 'Jane Smith',
          },
          actions: {
            items: [
              {
                href: '/example?remove=2',
                text: 'Edit',
                visuallyHiddenText: 'Jane Smith',
              },
              {
                href: '/example?remove=2',
                text: 'Delete',
                visuallyHiddenText: 'Jane Smith',
              },
            ],
          },
        }
      ],
    };

    const result = mapSummaryListContent(values, actionItems, path);
    expect(result).toEqual(expected);
  });
});
