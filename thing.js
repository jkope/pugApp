const express = require('express');
const path =require('path');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');

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


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => { //moved
    fs.readFile('./userlist.json', (err, data)=>{
        if (err) throw err;
        let userlist = JSON.parse(data);
        res.status(200).render('list', {list: userlist});
    })
});

app.get('/sort/:attribute', (req, res) => { //moved
    fs.readFile('./userlist.json', (err, data) => {
        let att = req.params.attribute
        console.log(att);
        if (err) throw err;
        let userlist = JSON.parse(data);
        let sortedlist = userlist.sort((a, b) => {
            const usera = a[att].toUpperCase();
            const userb = b[att].toUpperCase();

            let comparison = 0;
            if (usera > userb) {
                comparison = 1;
            } else if (usera < userb) {
                comparison = -1;
            }
            return comparison;
        })
        res.render('list', { list: sortedlist });
    })
});


app.get('/delete/:id', (req, res) => { //moved
    let id = req.params.id
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        let index = userlist.findIndex(user => user.uid === id);
        userlist.splice(index,1);
        fs.writeFile('./userlist.json', JSON.stringify(userlist, null, 2), (err) => {
            if (err) throw err;
            res.redirect('/')
        })
    })
})

app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        let index = userlist.findIndex(user => user.uid === id);
        res.status(200).render('edit', {user: userlist[index]})
    })
})

app.get('/form', (req, res) => { //moved
    res.status(200).render('form');
})

app.post('/create', (req, res) => { //moved
    let user = {
        uid: Math.floor(Math.random()*1000).toString(),
        userId: req.body.userID,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        age: req.body.age
    };
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        userlist.push(user);
        fs.writeFile('./userlist.json', JSON.stringify(userlist,null,2), (err) => {
            if (err) throw err;
            res.status(200).redirect('/')
        })
    });
});

app.post('/search', (req, res) => {
        let searchTerm = req.body.search.toLowerCase();
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        let filteredList = [];
        userlist.forEach(user => {
            let name = user.firstName +' '+ user.lastName;
            if(name.toLowerCase().includes(searchTerm)) {
                filteredList.push(user);
            }
        })
        if(filteredList.length != 0){
            let term;
                if(searchTerm.length){
                    term = `filtered on ${searchTerm}`;
                }
            res.render('list', { list: filteredList, term: term });
        } else {
            res.render('list', { list: userlist, term: "Results not found" });
        }
    })
});

app.post('/update/:id', (req, res) => {
    let uid = req.params.id
    let user = {
        uid: uid,
        userId: req.body.userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        age: req.body.age
    };
    fs.readFile('./userlist.json', (err, data) => {
        if (err) throw err;
        let userlist = JSON.parse(data);
        let index = userlist.findIndex(user => user.uid === uid);
        userlist[index] = user;
        fs.writeFile('./userlist.json', JSON.stringify(userlist, null, 2), (err) => {
            if (err) throw err;
            res.status(200).redirect('/')
        })
    });
});


let server = app.listen(3000, () => {
    console.log('listening on port 3000');
});


module.exports = server;