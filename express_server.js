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
    "testID": [{
        id: "testID",
        shortURL: "b2xVn2", 
        longURL: "http://www.lighthouselabs.ca"}],
    "userRandomID": [{
        id: "userRandomID", 
        shortURL: "9sm5xK",
        longURL: "http://www.google.com" }]
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
    // console.log(req.params.id);
    let templateVars = { 
        urls: urlDatabase,
        username: req.session.user_id,
        user: users };
    
    
    for (const keys in urlDatabase) {
        for (let i = 0; i < urlDatabase[keys].length; i++){
            // console.log(urlDatabase[keys][i].shortURL);
            //check that ":id", the shortURL, exists in the database
            //also make sure that this shortURL belongs to the user
            if (urlDatabase[keys][i].shortURL === req.params.id &&
            keys === templateVars.username) {
                templateVars.shortURL = req.params.id; 
                templateVars.longURL = urlDatabase[keys][i].longURL;
                //passing index value for POST request when updating
                templateVars.index = i;
                res.render("urls_show", templateVars); 
            } else if (urlDatabase[keys][i].shortURL === req.params.id) {
                res.send('This URL does not belong to you');
            }
        } 
    }
    res.send('Not a valid short URL');


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
    let newLongURL = "";
    // need to check if user input includes protocol in URL
    if (/^(http|https):\/\//.test(req.body.longURL)) {
        newLongURL = req.body.longURL;
    } else {
        newLongURL = "http://" + req.body.longURL;
    }
    // store new URLs into object -- each user is a key
    // each key is an array, where each element is another object
    // pertaining to that specific URL 
    let newUrlObj = {id: userEntry, shortURL: randomS, 
        longURL: newLongURL };

    if (urlDatabase[userEntry]) {
        urlDatabase[userEntry].push(newUrlObj);
    } else {
        urlDatabase[userEntry] = [newUrlObj]; 
    }
    console.log(urlDatabase);
    res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
    let realURL = ""; 
    for (const keys in urlDatabase) {
        for (let i = 0; i < urlDatabase[keys].length; i++) {
            if (req.params.shortURL === urlDatabase[keys][i].shortURL) {
                if (/^(http|https):\/\//.test(urlDatabase[keys][i].longURL)) {
                    realURL = urlDatabase[keys][i].longURL;
                } else {
                    realURL = "http://" + urlDatabase[keys][i].longURL;
                }
                res.redirect(realURL);
            }
        }
    }
    console.log(urlDatabase);
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
    // console.log(req); 
    // console.log(req.body);
    if (username) {
        for (const keys in urlDatabase) {
            for (let i = 0; i < urlDatabase[keys].length; i++) {
                if (urlDatabase[keys][i].shortURL === req.params.shortURL) {
                    urlDatabase[keys][i].longURL = req.body.newURL;
                    res.redirect('/urls');
                    console.log(urlDatabase);
                }
            }
        }
    } 
});

app.post("/urls/:id/delete", (req, res) => {
    let username = req.session.user_id;
    for (i = 0; i < urlDatabase[username].length; i++) {
        if (urlDatabase[username][i].shortURL === req.params.id) {
            urlDatabase[username].splice(i, 1);
        }
    }
    res.redirect('/urls');
});

app.post("/login", (req, res) => {
    for (const keys in users) {
        if (req.body.email === users[keys].email &&
            bcrypt.compareSync(req.body.password, users[keys].password)) {
            req.session.user_id = users[keys].id;
            res.redirect('/urls');
        } 
    }
    res.send('Incorrect email and/or password'); 
});

app.post("/logout", (req, res) => {
    req.session = null; 
    res.redirect("/urls"); 
});

app.post("/register", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400);
        res.send('Email and password cannot be blank');  
    }

    let newEmail = true; 
    for (const keys in users) {
        if (req.body.email === users[keys].email) {
            res.status(400); 
            res.send('Email is already registered');
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
            req.session.user_id = randomUserId;
            res.redirect('/urls');
            }
    });     

app.listen(PORT, () => {
    console.log(`Example app listening on port $(PORT)!`); 
}); 