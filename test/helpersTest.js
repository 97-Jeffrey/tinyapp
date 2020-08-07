const { assert } = require('chai');

const { getUserByEmail, getUserByEmail2 } = require('../helpers.js');


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
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers)
    const expectedOutput = "user2RandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined when an invalid email is entered', function() {
    const user = getUserByEmail("userhahaha@example.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return password when an valid email is entered', function() {
    const user = getUserByEmail2("user@example.com", testUsers)
    const expectedOutput = 'purple-monkey-dinosaur';
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return password when an valid email is entered', function() {
    const user = getUserByEmail2("user2@example.com", testUsers)
    const expectedOutput = "dishwasher-funk";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined when an invalid email is entered', function() {
    const user = getUserByEmail2("user3@example.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });

});