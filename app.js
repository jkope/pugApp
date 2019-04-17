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
    name: String, role: String, 
    age: {type: Number, min: 18, max: 70 },
    createdDate: { type: Date, default: Date.now } });

const user = mongoose.model('userCollection', userSchema);

app.get('/',(req, res)=>{
    console.log('here');
    res.send('hello');
})

//Create
//  test this with`curl --data "name=Peter&role=Student" http://localhost:8080/newUser`
app.post('/newUser', (req, res) => {
    console.log(`POST /newUser: ${JSON.stringify(req.body)}`); 
    const newUser = new user(); 
    newUser.name = req.body.name; 
    newUser.role = req.body.role; 
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

    //Delete --find one and then remove the document
app.post('/removeUser', (req, res) => {   
    console.log(`POST /removeUser: ${JSON.stringify(req.body)}`);   
    let matchedName = req.body.name;   
    user.findOneAndDelete(
        { name: matchedName },       
        (err, data) => {           
            if (err) return console.log(`Oops! ${err}`);           
            console.log(`data -- ${JSON.stringify(data)}`)           
            let returnMsg = `user name : ${matchedName}, removed data : ${data}`;           
            console.log(returnMsg);           
            res.send(returnMsg);       
        });
});



app.listen(port, (err) => { 
    if (err) console.log(err); 
    console.log(`App Server listen on port: ${port}`);
 });