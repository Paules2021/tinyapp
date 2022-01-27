const bcrypt = require("bcryptjs");


// Create a new user object with given id, email, and password
const createUser = function(id, email, hashedPassword) {
  const user = {
    id,
    email,
    hashedPassword
  };
  return user;
};

// Genereate a shortURL
const generateRandomString = function(){
  return (Math.random() + 1).toString(36).substring(6);
} 


// Check if the email or the passwords are empty strings.
const ifEmptyString = function(email, password) {
  if (email === "" || password === "") {
    return true;
  }
  return false;
}

// check to see if an email is exist
const findUserByEmail = function(email,user) {
  for (const id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return false;
}

// check to see if the password matches the existing password in the db
const checkPassword = function(email, password, users) {
  for (const id in users) {
    if (users[id].email === email && bcrypt.compareSync(password, users[id].hashedPassword)) {
      return true;
    }
  }
  return false;
}

// check if shortURL exists in the db
const checkShortUrl = function(shortURL, urlDatabase) {
  for (const url in urlDatabase) {
    if(url === shortURL) {
      return true;
    }
  }
  return false;
};

// return the URLs where the userID === id of the current user
const urlsForUser = function(id, urlDatabase) {
  const filteredDb = {};
  for (const url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
      filteredDb[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      }
    }
  }
  return filteredDb;
};

module.exports = {
  generateRandomString,
  createUser,
  ifEmptyString,
  findUserByEmail,
  checkPassword,
  checkShortUrl,
  urlsForUser
} 