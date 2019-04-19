const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/userManagement',
    { useNewUrlParser: true }); // "userManagement" is the db name

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db connected');
});

const userSchema = new mongoose.Schema({
    userId: String,
    firstName: String,
    lastName: String,
    age: Number,
    email: String,
    createdDate: { type: Date, default: Date.now }
});

const user = mongoose.model('userCollection', userSchema);

let order = 1;

//Create form
app.get('/form', (req, res) => {
    res.status(200).render('form');
})

//Full List
app.get('/', (req, res) => {
    user.find({}, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        let userlist = (data);
        res.status(200).render('list', { list: userlist });
    });
});

//Sort
app.get('/sort/:attribute', (req, res) => {
    let att = req.params.attribute
    let upDown;
    order === 1 ? order = -1 : order = 1;  
    user.find().sort({ [att]: order }).exec((err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        res.render('list', { list: data });
    });
});

app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    user.findOne({ userId: id }, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        res.status(200).render('edit', { user: data })
    })
})

//Delete --find one and then remove the document
app.get('/delete/:id', (req, res) => {
    let matchedId = req.params.id;
    user.findOneAndDelete(
        { userId: matchedId },
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            res.redirect('/')
        });
})

//Create
app.post('/create', (req, res) => {
    user.findOne({userId : req.body.userID.toUpperCase()}, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        if(data){
            res.status(200).redirect('/form')
        } else {
        const newUser = new user();
        newUser.userId = req.body.userID.toUpperCase(),
        newUser.firstName = req.body.firstName.toUpperCase(),
        newUser.lastName = req.body.lastName.toUpperCase(),
        newUser.email = req.body.email.toUpperCase(),
        newUser.age = req.body.age.toUpperCase()
        
        newUser.save((err, data) => {
            if (err) {
                return console.error(err);
            }
            res.status(200).redirect('/')
            });
        }       
    })
});

//Search
app.post('/search', (req, res) => {
    let name = req.body.search.toUpperCase()
    if (!name) {
        user.find({}, (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            res.render('list', { list: data, term: '' });
        })
    } else {
        user.find({ $or: [{ firstName: name }, { lastName: name }] }, (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            term = `filtered on ${name}`;
            res.render('list', { list: data, term: term });
        })
    }
});

//Update --find one and then update the document
app.post('/update/:id', (req, res) => {
    let id = req.params.id
    const updatedUser = {
        userId: req.body.userId.toUpperCase(),
        firstName: req.body.firstName.toUpperCase(),
        lastName: req.body.lastName.toUpperCase(),
        email: req.body.email.toUpperCase(),
        age: req.body.age.toUpperCase()
    }
    user.findOneAndUpdate({ userId: id }, updatedUser,
        { new: true }, //return the updated version instead of the pre-updated document       
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            res.status(200).redirect('/')
        });
});

let server = app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`App Server listen on port: ${port}`);
});

module.exports = server;
