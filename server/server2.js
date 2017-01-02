var express = require('express');
var bodyParser = require('body-parser');
const hbs = require('hbs');
var _ = require('lodash');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var port = process.env.PORT || 3000;


var {mongoose} = require('./db/mongoose.js');
var {User} = require('./models/user.js')
var {Todo} = require('./models/todo.js')
var {ObjectID} = require('mongodb');
var {authenticate} = require('./middleware/authenticate.js')

var app = express();
//app.use(session({secret: 'ssshhhhh'}));
app.use(session({
  secret: 'ssshhhhh',
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//static files
app.use(express.static(__dirname + '/public'));

// setting hbs
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
var sess;
app.get('/', (req,res) => {
  sess=req.session;
  //console.log(sess);
  if (sess.email){
    res.send(sess.email);
  }
  else{
    res.send('ahihi');
  }

});
app.get('/user', (req,res) => {
  res.render('signin.hbs');
});
app.post('/user', (req,res) => {
  //res.redirect('/');
  //console.log(req);
  sess = req.session;
  User.findByCredentials(req.body.email,req.body.password).then((user) => {
    sess.email = req.body.email;
    res.redirect('/');
  }).catch((e) => {
    res.redirect('/user');
  });
});
app.get('/user/logout', (req, res) => {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});
app.listen(port, () => {
  console.log(`Server start on port ${port}`);
})
