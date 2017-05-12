const express = require('express'); 
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');  
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'user_id', 
    keys: ['key1', 'key2']
}));

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

var urlsForUser = function urlsForUser(cookieinfo){
    let usedUrls = {}
    for (const keys in urlDatabase) {
        if (keys === cookieinfo) {
            usedUrls[keys] = urlDatabase[keys]; 
        }
    }
    return usedUrls; 
}

let users = { 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }, 
//   "test": {
//       id: "testID", 
//       email: "asdf@asdf", 
//       password: "asdf"
//   }
}

let urlDatabase = {
    "testID": {
        id: "testID",
        shortURL: "b2xVn2", 
        longURL: "http://www.lighthouselabs.ca"},
    "userRandomID": {
        id: "userRandomID", 
        shortURL: "9sm5xK",
        longURL: "http://www.google.com" }
};

app.get('/', (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.session.user_id,
        user: users};
    if (templateVars.username) {
        res.redirect('/urls');
    } else {
        res.redirect('/login');
    }
});

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.session.user_id,
        user: users,
        userUrls: urlsForUser(req.session.user_id) };   
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.session.user_id,
        user: users};
    if (templateVars.username) {
        res.render('urls_new', templateVars);
    } else {
        res.redirect('/login');
    }
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { 
        urls: urlDatabase,
        username: req.session.user_id,
        user: users };
    let short;
    console.log(req.params.id); 
    // console.log(req);
    for (keys in urlDatabase) {
        if (urlDatabase[keys].shortURL === req.params.id &&
        keys === templateVars.username) {
            res.render("urls_show", templateVars); 
        } else if (urlDatabase[keys].shortURL === req.params.id) {
            res.send('This URL does not belong to you');
        } 
    }

    res.send('Not a valid short URL');
    // res.render("urls_show", templateVars);

});

app.get("/register", (req, res) => {
    let templateVars = { 
        urls: urlDatabase,
        username: req.session.user_id,
        user: users };
    if (templateVars.username) {
        res.redirect('/');
    } else {
        res.render('register', templateVars);
    }
});

app.post("/urls", (req, res) => {
    let randomS = makeid();
    let userEntry = req.session.user_id;
    let newLongURL = "http://" + req.body.longURL;
    urlDatabase[userEntry] = {id: userEntry, shortURL: randomS, 
        longURL: newLongURL };
    console.log(urlDatabase);
    res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
    // console.log(req.params.shortURL);
    // console.log(urlDatabase[req.cookies.user_id].shortURL);
    let realURL = ""; 
    for (const keys in urlDatabase) {
        // console.log(keys);
        if (req.params.shortURL === urlDatabase[keys].shortURL) {
                realURL = urlDatabase[keys].longURL;
                res.redirect(realURL); 
        }
    }

    res.send('Not a valid shortURL');
});

app.get("/login", (req, res) => {
    let templateVars = { 
        urls: urlDatabase,
        username: req.session.user_id,
        user: users };
    if (templateVars.username) {
        res.redirect('/');
    } else {
        res.render('login', templateVars);
    }
});

app.post("/urls/:shortURL/update", (req, res) => {
    let username = req.session.user_id;
    if (username) {
        urlDatabase[username].longURL = req.body.newURL;
        res.redirect('/urls');
    } 
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; 
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
    console.log('this is req', req.body);
    for (const keys in users) {
        if (req.body.email === users[keys].email &&
            bcrypt.compareSync(req.body.password, users[keys].password)) {
            console.log(bcrypt.compareSync(req.body.password, users[keys].password));
            req.session.user_id = users[keys].id;
            res.redirect('/urls');
        } else {
            console.log('no'); 
        }
    }
    res.send('no'); 
});

app.post("/logout", (req, res) => {
    req.session = null; 
    res.redirect("/urls"); 
});

app.post("/register", (req, res) => {
    if (!req.body.email || !req.body.password) {
        console.log('empty string');
        res.status(400);
        res.send('empty');  
    }

    let newEmail = true; 
    for (const keys in users) {
        if (req.body.email === users[keys].email) {
            console.log('same email'); 
            res.status(400); 
            res.send('same email');
            newEmail = false;  
        }  
    }
    if (newEmail === true) {
            const randomUserId = makeid();
            const password = req.body.password;
            const hashed_password = bcrypt.hashSync(password, 10);
            users[randomUserId] = {};   
            users[randomUserId].id = randomUserId;
            users[randomUserId].email = req.body.email;
            users[randomUserId].password = hashed_password; 
            console.log(users);
            req.session.user_id = randomUserId;
            res.redirect('/urls');
            }
    });     

app.listen(PORT, () => {
    console.log(`Example app listening on port $(PORT)!`); 
}); 