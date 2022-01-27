const express = require("express");
const app = express();
const PORT = 8081; // default port 8081

const bcrypt = require("bcryptjs");

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["Some way to encrypt the values"]
}));;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


const users = { 
  /*"userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "p.elishaee@gmail.com",
    password: bcrypt.hashSync("12345", 10)
  }*/
}

const createUser = function(id, email, hashedPassword) {
  const user = {
    id,
    email,
    hashedPassword
  };
  return user;
};


function generateRandomString() {
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

// check to see if the password given matches the password (same email) in the db
const checkPassword = function(email, password, users) {
  for (const id in users) {
    if (users[id].email === email && bcrypt.compareSync(password, users[id].hashedPassword)) {
      return true;
    }
  }
  return false;
}

// check to see if shortURL exists in the db
const checkShortUrl = function(shortURL, urlDatabase) {
  for (const url in urlDatabase) {
    if(url === shortURL) {
      return true;
    }
  }
  return false;
};

// return the URLs where the userID is equal to the id of the current user
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





app.get("/", (req, res) => {
  res.send("Welcome to tinyapp!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><h1>Hello <b>World</b></h1><p>Welcome to home page!</p></html>\n");
});

//(GET-REGISTER)User Registeration from
app.get("/register", (req, res) => {
// if the user is logged in, redirect to /urls
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
  user: users[req.session.user_id]
  };
  res.render("register_index", templateVars);
});

//show the login page
app.get("/login", (req, res) => {
// if the user is logged in, redirect to /urls
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});


// (POST-REGISTER)
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // if email or password is empty, send an error 
  if (ifEmptyString(email, password)) {
    return res.status(400).send("Email or Password cannot be empty");
  };
  // if someone registers with existing email, send an error message
  if (findUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }
  // use the helper function create a user object
  const user = createUser(id, email, hashedPassword);
  // add the new user object to the users database
  users[id] = user;
  // set user_id cookie contraining the user's newly generated ID
  req.session.user_id = id;
  res.redirect("/urls");

});



app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// route to display a table of the URL Database (long and short URLS)
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  // filter through the URL database
  const filteredDatabase = urlsForUser(id, urlDatabase)
  const templateVars = {user: users[req.session.user_id], urls: filteredDatabase };
  res.render("urls_index", templateVars);
});

// route to receive the form submission
app.post("/urls", (req, res) => {
    // if none user try to add a new url, return error message
    if (!req.session.user_id) {
      return res.status(400).send("You must be logged in to add!");
    }
  const newShortUrl = generateRandomString(); // generate a new short URL
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  } // add the key value pair to the URL Database
  res.redirect(`/urls/${newShortUrl}`); // redirect to the new URL page
});


// route to present the form to the user
app.get("/urls/new", (req, res) => {
    // if a user is not logged in and try to access /urls/new redirect to /urls/login
    if (!req.session.user_id) {
      return res.redirect("/login");
    }
  const templateVars = {user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
    // if the shortURL does not exist, return error message
    if (!checkShortUrl(shortURL, urlDatabase)) {
      return res.status(400).send("This short URL does not exist!");
    }
  // filter through the URL database
  const filteredDatabase = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: filteredDatabase,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
   };
  res.render("urls_show", templateVars);
});

// route to handle shortURL requests, clicking on the shortURL will lead to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // if the shortURL does not exist, return a error message
  if(checkShortUrl(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
  res.status(400).send("This short URL does not exist!");
});



app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const filteredDatabase = urlsForUser(id, urlDatabase);
  const shortURL = req.params.shortURL;
  if (!filteredDatabase[shortURL]) {
    return res.status(400).send("You cannot delete this.");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})


// route to update a URL and redirect to the /urls page
app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  // filter through the URL database
  const filteredDatabase = urlsForUser(id, urlDatabase);
  const shortURL = req.params.shortURL;
  // check if shortURL is in the filtered database, if not, show an error
  if (!filteredDatabase[shortURL]) {
    return res.status(400).send("You cannot edit this.");
  }
  urlDatabase[shortURL].longURL = req.body.longURL; // update the longURL of the shortURL in the database
  res.redirect("/urls");
}) 

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // if email is not in the db, return 403 
  if(!findUserByEmail(email, users)) {
    return res.status(403).send("Email does not exist");
  }
  // if password isnt correct, return 403
  if(!checkPassword(email, password, users)) {
    return res.status(403).send("Wrong password!");
  }
  // find the ID using the findUserByEmail function
  const id = findUserByEmail(email, users);
  req.session.user_id = id;
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});