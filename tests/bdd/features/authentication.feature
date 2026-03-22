Feature: User Authentication
  As a visitor of Conduit
  I want to register and sign in
  So that I can write articles and interact with the community

  Rule: New users can create an account
    Scenario: Successful registration
      Given I am on the sign up page
      When I register with valid credentials
      Then I should be redirected to the home page
      And I should see my username in the navigation

  Rule: Registered users can sign in
    Scenario: Successful login
      Given a user exists with email "login-test@quality-labs.com" and password "SecurePass123!"
      And I am on the sign in page
      When I sign in with email "login-test@quality-labs.com" and password "SecurePass123!"
      Then I should be redirected to the home page
      And I should see my username in the navigation

    Scenario: Login with invalid credentials
      Given I am on the sign in page
      When I sign in with email "nonexistent@test.com" and password "wrongpassword"
      Then I should see an error message
