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
db.once('open', function () {   console.log('db connected');
});

const userSchema = new mongoose.Schema({ 
    userId: String,
    firstName: String, 
    lastName: String, 
    age: {type: Number, min: 1, max: 130 },
    email: String,
    createdDate: { type: Date, default: Date.now } });

const user = mongoose.model('userCollection', userSchema);


app.get('/form', (req, res) => {
    res.status(200).render('form');
}) 


//Full List
// you can test his with `curl http://localhost:8080/ `
app.get('/', (req, res) => {
    user.find({}, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        let userlist = (data);
        res.status(200).render('list', { list: userlist });
    }); 
});

//Sort
// you can test his with `curl http://localhost:8080/sort/firstName`
app.get('/sort/:attribute', (req, res) => {
    let att = req.params.attribute
    let order = 
    console.log(att)
    user.find({$query:{},$sort:{[att]: -1}}, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        console.log(data)
        res.render('list', { list: data });
    }); 
});

app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    user.findOne({userId: id}, (err,data) =>{
        if (err) return console.log(`Oops! ${err}`);
        res.status(200).render('edit', {user: data})
    })
})

//Delete --find one and then remove the document
// `curl  http://localhost:8080/delete/{--userId--}`
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
//  test this with `curl --data "userId=surfer&firstName=Jake&lastName=Kopes&email=email@gmail.com&age=23" http://localhost:8080/newUser`
app.post('/create', (req, res) => {
    console.log(`POST /newUser: ${JSON.stringify(req.body)}`); 
    const newUser = new user(); 
    newUser.userId = req.body.userID,
    newUser.firstName = req.body.firstName,
    newUser.lastName = req.body.lastName,
    newUser.email = req.body.email,
    newUser.age = req.body.age

    newUser.save((err, data) => { 
        if (err) { 
            return console.error(err); 
        } 
        console.log(`new user save: ${data}`); 
        res.status(200).redirect('/')
    }); 
});

//Search
app.post('/search', (req, res) => { 
        let name = req.body.search 
    user.find({$or:[{firstName: name},{lastName: name}] }, (err, data) => { 
        if (err) return console.log(`Oops! ${err}`); 
        console.log(`data -- ${JSON.stringify(data)}`); 
        term = `filtered on ${name}`;
        let returnMsg = `searchterm : ${name} role : ${data}`; 
        console.log(returnMsg); 
        res.render('list', { list: data, term: term });
    }); 
});


//Update --find one and then update the document
//  test this with: `curl --data "name=Jack&role=TA" http://localhost:8080/updateUserRole`
app.post('/update/:id', (req, res) => {
    let id = req.params.id
    const updatedUser = {
    userId: req.body.userId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    age: req.body.age
    }
    user.findOneAndUpdate( {userId: id}, updatedUser,       
        { new: true }, //return the updated version instead of the pre-updated document       
        (err, data) => {           
            if (err) return console.log(`Oops! ${err}`);           
            console.log(`data -- ${updatedUser}`)           
            let returnMsg = `user name : ${id} New data : ${updatedUser}`;           
            console.log(returnMsg);           
            res.status(200).redirect('/')     
        });
});











let server = app.listen(port, (err) => { 
    if (err) console.log(err); 
    console.log(`App Server listen on port: ${port}`);
 });

module.exports = server;