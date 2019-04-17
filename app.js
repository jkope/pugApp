const express = require('express'); 
const app = express(); 
const port = process.env.PORT || 8080; 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost/userManagement', 
{ useNewUrlParser: true }); // "userManagement" is the db name

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {   console.log('db connected');
});

const userSchema = new mongoose.Schema({ 
    firstName: String, 
    lastName: String, 
    age: {type: Number, min: 18, max: 70 },
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
        console.log(`data -- ${JSON.stringify(data)}`);
        let userlist = JSON.parse(data);
        res.status(200).render('list', { list: userlist });
    }); 
});

//Sort
// you can test his with `curl http://localhost:8080/sort/firstName`
app.get('/sort/:attribute', (req, res) => {
    user.find({}, (err, data) => {
        let att = req.params.attribute
        if (err) return console.log(`Oops! ${err}`);
        console.log(`data -- ${JSON.stringify(data)}`);
        console.log(data);
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
    }); 
});

//Delete --find one and then remove the document
// `curl  http://localhost:8080/delete/{--mongoID--}`
app.get('/delete/:id', (req, res) => {
    console.log(`POST /removeUser:`);
    let matchedId = req.params.id;
    user.findOneAndDelete(
        { _id: matchedId },
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            res.redirect('/')
        });
})



//Create
//  test this with`curl --data "name=Peter&role=Student" http://localhost:8080/newUser`
app.post('/newUser', (req, res) => {
    console.log(`POST /newUser: ${JSON.stringify(req.body)}`); 
    const newUser = new user(); 
    newUser.firstName = req.body.firstName,
    newUser.lastName = req.body.lastName,
    newUser.email = req.body.email,
    newUser.age = req.body.age


    newUser.save((err, data) => { 
        if (err) { 
            return console.error(err); 
        } 
        console.log(`new user save: ${data}`); 
        res.send(`done ${data}`); 
    }); 
});

//Read
//  you can test his with `curl http://localhost:8080/user/Peter`
app.get('/user/:name', (req, res) => { 
    let userName = req.params.name; 
    console.log(`GET /user/:name: ${JSON.stringify(req.params)}`); 
    user.findOne({ name: userName }, (err, data) => { 
        if (err) return console.log(`Oops! ${err}`); 
        console.log(`data -- ${JSON.stringify(data)}`); 
        let returnMsg = `user name : ${userName} role : ${data.role}`; 
        console.log(returnMsg); 
        res.send(returnMsg); 
    }); 
});


//Update --find one and then update the document
//  test this with: `curl --data "name=Jack&role=TA" http://localhost:8080/updateUserRole`
app.post('/updateUserRole', (req, res) => {   
    console.log(`POST /updateUserRole: ${JSON.stringify(req.body)}`);   
    let matchedName = req.body.name;   
    let newrole = req.body.role;   
    user.findOneAndUpdate( {name: matchedName}, {role: newrole},       
        { new: true }, //return the updated version instead of the pre-updated document       
        (err, data) => {           
            if (err) return console.log(`Oops! ${err}`);           
            console.log(`data -- ${data.role}`)           
            let returnMsg = `user name : ${matchedName} New role : ${data.role}`;           
            console.log(returnMsg);           
            res.send(returnMsg);       
        });
});


app.listen(port, (err) => { 
    if (err) console.log(err); 
    console.log(`App Server listen on port: ${port}`);
 });