const express = require('express');
const path =require('path');
const fs = require('fs');

let app = express();

app.use(express.urlencoded({extended: false}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
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
            res.redirect('/')
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
            res.redirect('/')
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
            res.redirect('/')
        })
    });
});


app.listen(3000, () => {
    console.log('listening on port 3000');
});
