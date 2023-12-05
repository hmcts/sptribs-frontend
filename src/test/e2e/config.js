module.exports = {
  citizenUserOne: {
    email: process.env.CITIZEN_USERNAME,
    password: process.env.CITIZEN_PASSWORD,
  },

  baseUrl: process.env.SPTRIBS_FRONTEND_URL || 'https://sptribs-frontend.aat.platform.hmcts.net',

  definition: {
    jurisdiction: 'PUBLICLAW',
    jurisdictionFullDesc: 'Public Law',
    caseType: 'CARE_SUPERVISION_EPO',
    caseTypeFullDesc: 'Care, supervision and EPOs',
  },
  // files
  testFile: './e2e/fixtures/testFiles/mockFile.txt',
  testPdfFile: './e2e/fixtures/testFiles/mockFile.pdf',
  testWordFile: './e2e/fixtures/testFiles/mockFile.docx',
  testOdtFile: './e2e/fixtures/testFiles/mockFile.odt',
};
