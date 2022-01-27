const { assert } = require('chai');



const users = {
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

const {findUserByEmail, urlsForUser, ifEmptyString, checkShortUrl} = require('../helpers.js');

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "123456"
  }
};

describe('findUserByEmail', function() {
  it('should return a user ID with valid email', function() {
    const user = findUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });

  it('should return false if email isnt valid', function() {
    const user = findUserByEmail("user123@example.com", users)
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
}); 

describe('urlsForUser', function() {
  it('return URLs if the userID === id', function() {
    const url = urlsForUser("userRandomID", urlDatabase)
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      }
    };
    assert.deepEqual(url, expectedOutput);
  });
});


describe('ifEmptyString', function() {
  it('should return true if email or password is empty string', function() {
    const empty = ifEmptyString("", "abc");
    const expectedOutput = true;
    assert.strictEqual(empty, expectedOutput);
  });

  it('should return false if email or password isnt empty', function() {
    const empty = ifEmptyString("cdc", "abc");
    const expectedOutput = false;
    assert.strictEqual(empty, expectedOutput);
  });
});

describe('checkShortUrl', function() {
  it('should return true if shortURL exists in db', function() {
    const shortURL = checkShortUrl("b6UTxQ", urlDatabase);
    const expectedOutput = true;
    assert.strictEqual(shortURL, expectedOutput);
  });

  it('should return false if shortURL doesnt exist in the db', function() {
    const shortURL = checkShortUrl("b6UTxw", urlDatabase);
    const expectedOutput = false;
    assert.strictEqual(shortURL, expectedOutput);
  });
});