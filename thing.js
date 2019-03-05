const express = require('express');
const path =require('path');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

let app = express();

app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: 'super secret',
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 6000000}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
//options
clientID:'332058658540-8er12kv1rjc1ut4pkn8pklcr74e350ve.apps.googleusercontent.com',
clientSecret: 'EOUjH3cr-VusNi-D1q8Sg9pA',
callbackURL: 'http://localhost:3000/auth/google/callback'
}, (req, accessToken, refreshToken, profile, done) => {
    //callback
    done(null, profile);
}));

router.route('/google/callback')
.get(passport.authenticate('google',{
    successRedirect: '/list',
    failure: '/'
}));

router.route('google')
.get(passport.authenticate('google',{
    scope: ['profile']
}))

app.use('/auth', router);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/list', (req, res) => {
    fs.readFile('./userlist.json', (err, data)=>{
        if (err) throw err;
        let userlist = JSON.parse(data);
        res.render('list', {list: userlist});
    })
});

app.get('/delete/:id', (req, res) => {
    let id = req.params.id
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        let index = userlist.findIndex(user => user.userId === id);
        userlist.splice(index,1);
        fs.writeFile('./userlist.json', JSON.stringify(userlist, null, 2), (err) => {
            if (err) throw err;
            res.redirect('/list')
        })
    })
})

app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        let index = userlist.findIndex(user => user.userId === id);
        res.render('edit', {user: userlist[index]})
    })
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/form', (req, res) => {
    res.render('form');
})

app.post('/create', (req, res) => {
    let user = {
        userId: Math.floor(Math.random()*1000).toString(),
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        userlist.push(user);
        fs.writeFile('./userlist.json', JSON.stringify(userlist,null,2), (err) => {
            if (err) throw err;
            res.redirect('/list')
        })
    });
});

app.post('/update/:id', (req, res) => {
    let id = req.params.id
    let user = {
        userId: id,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        let index = userlist.findIndex(user => user.userId === id);
        userlist[index] = user;
        fs.writeFile('./userlist.json', JSON.stringify(userlist, null, 2), (err) => {
            if (err) throw err;
            res.redirect('/list')
        })
    });
});


app.listen(3000, () => {
    console.log('listening on port 3000');
});
