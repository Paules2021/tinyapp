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

const {generateRandomString, createUser, ifEmptyString, findUserByEmail, checkPassword, checkShortUrl, urlsForUser } = require("./helpers.js");

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
 "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("1234", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "p.elishaee@gmail.com",
    password: bcrypt.hashSync("12345", 10)
  }
}


app.get("/", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><h1>Hello <b>World</b></h1><p>Welcome to home page!</p></html>\n");
});

//User Registeration from(if the user is logged in, redirect to /urls)
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const currentUser = users[id];
  if (currentUser) {
    return res.redirect("/urls");
  }
  const templateVars = {
  user: users[req.session.user_id]
  };
  res.render("register_index", templateVars);
});

//show the login page(if the user is logged in, redirect to /urls)
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const currentUser = users[id];
  if (currentUser) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});


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
  req.session.user_id = id;
  res.redirect("/urls");

});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


// route to display a table of the URL Db
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const filteredDatabase = urlsForUser(id, urlDatabase)
  const templateVars = {user: users[req.session.user_id], urls: filteredDatabase };
  res.render("urls_index", templateVars);
});


// route to receive the form submission
app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  const currentUser = users[id];  
  // if none user try to add a new url, return error message
    if (!currentUser) {
      return res.status(401).send("You must be logged in to add!");
    }
  const newShortUrl = generateRandomString(); // generate a new short URL
  urlDatabase[newShortUrl] = {longURL: req.body.longURL, userID: req.session.user_id
  } // add the keys to urlDatabase
  res.redirect(`/urls/${newShortUrl}`);
});


// present the form
app.get("/urls/new", (req, res) => {
    // if a user is not logged in and try to access /urls/new redirect to /urls/login
    const id = req.session.user_id;
    const currentUser = users[id];
    if (!currentUser) {
      return res.redirect("/login");
    }
  const templateVars = {user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
    // if the shortURL does not exist, return error 
    if (!checkShortUrl(shortURL, urlDatabase)) {
      return res.status(404).send("This short URL does not exist!");
    }
  const filteredDatabase = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: filteredDatabase,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
   };
  res.render("urls_show", templateVars);
});


// route to handle shortURL requests 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // if the shortURL does not exist, return error
  if(checkShortUrl(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
  res.status(404).send("This short URL does not exist!");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const currentUser = users[id];
  if (!currentUser) {
    return res.status(401).send("You don't have aceess to delete!");
  }
  const filteredDatabase = urlsForUser(id, urlDatabase);
  const shortURL = req.params.shortURL;
  if (!filteredDatabase[shortURL]) {
    return res.status(401).send("You cannot delete this.");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})


// route to update a URL 
app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const currentUser = users[id];
  if (!currentUser) {
    return res.status(401).send("You are not logged in to change URL");
  }
  const filteredDatabase = urlsForUser(id, urlDatabase);
  const shortURL = req.params.shortURL;
  if (!filteredDatabase[shortURL]) {
    return res.status(401).send("You cannot edit this.");
  }
  urlDatabase[shortURL].longURL = req.body.longURL; 
  res.redirect("/urls");
}) 


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // if email is not in the db, return 403 
  if(!findUserByEmail(email, users)) {
    return res.status(400).send("Email does not exist");
  }
  // if password isnt correct, return 403
  if(!checkPassword(email, password, users)) {
    return res.status(400).send("Wrong password!");
  }
  // find the ID using the findUserByEmail function
  const id = findUserByEmail(email, users);
  req.session.user_id = id;
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});