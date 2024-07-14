const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers)
    const expecteduserID = 'userRandomID';
    assert.strictEqual(user.id, expecteduserID);
  });

  it('should return undefined for an invalid email', function() {
    const user = getUserByEmail('fakeuser@example.com', testUsers)
    assert.isUndefined(user);
  });

});


// ----------------------------------------------------------------------------------

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
  "abc123": { longURL: "http://www.example.com", userID: "user1" }
};


// Test Suite
describe('urlsForUser', function() {
  
  it('should return urls that belong to the specified user', function() {
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "abc123": { longURL: "http://www.example.com", userID: "user1" }
    };
    const result = urlsForUser("user1", urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the urlDatabase does not contain any urls that belong to the specified user', function() {
    const result = urlsForUser("user4", urlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const emptyDatabase = {};
    const result = urlsForUser("user1", emptyDatabase);
    assert.deepEqual(result, {});
  });

  it('should not return any urls that do not belong to the specified user', function() {
    const result = urlsForUser("user2", urlDatabase);
    const unexpectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "abc123": { longURL: "http://www.example.com", userID: "user1" }
    };
    assert.notDeepEqual(result, unexpectedOutput);
    assert.deepEqual(result, {
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" }
    });
  });

});