Feature: Start now  button
  In order to navigate
  As a appellant
  I want to be able to navigate to Login page

  Scenario: Navigate to landing page
    Given I am authenticated as a valid appellant
    And I load the application

    Then I see "Submit a first-tier tribunal form" in title
    And I click on the "Start now" button

    Then I should be taken to the Log in page
    And I should see "Sign in or create account" in title

