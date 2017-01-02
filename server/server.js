var express = require('express');
var bodyParser = require('body-parser');
const hbs = require('hbs');
var _ = require('lodash');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var multer = require('multer');
var fs = require('fs');
var port = process.env.PORT || 3000;



var {mongoose} = require('./db/mongoose.js');
var {User} = require('./models/user.js')
var {Blog} = require('./models/blog.js')
var {ObjectID} = require('mongodb');
var uploading = multer({
  dest: 'public/img/',
  limits: {fileSize: 10000000, files:1},

}).single('image');

var app = express();
//app.use(session({secret: 'ssshhhhh'}));
app.use(session({
  secret: 'ssshhhhh',
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//static files
app.use(express.static(__dirname + './../public'));

// setting hbs
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname +'/../views/partials')

var sess;


app.get('/signin', (req,res) => {

  var signinerr = req.session.signinerr;
  req.session.signinerr = null;
  res.render('signin.hbs', {signinerr});
});
app.post('/signin', (req,res) => {

  //res.redirect('/');
  //console.log(req);
  sess = req.session;
  User.findByCredentials(req.body.email,req.body.password).then((user) => {
    sess.email = req.body.email;
    sess.signinerr = null;
    res.redirect('/');
  }).catch((e) => {
    console.log('ahuhuhu');
    sess.signinerr = {
      email: req.body.email,
      text: 'Account or Password is wrong.'
    };

    //console.log('kakak');
    res.redirect('/signin');
  });
});
app.get('/logout', (req, res) => {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/signin');
    }
  });
});
app.get('/signup', (req, res) => {
  res.render('signup.hbs');
});
app.post('/signup', (req, res) => {
  sess = req.session;
  var user = new User({
    email: req.body.email,
    password: req.body.password
  })
  user.save().then((user) => {
    sess.email = req.body.email;
    res.redirect('/');
  }).catch((e) => {
    res.redirect('/signup');
  });
});
app.get('/', (req,res) => {
  //console.log(__dirname);
  //console.log(sess);
  sess=req.session;
  if (!sess.email){
    res.redirect('/signin');
  }
  Blog.find().sort({_id: -1}).then((blogs) => {
    res.render('index.hbs',{blogs});
  }).catch((e) => {
    res.redirect('/')
  });


});

app.get('/blogs/create', (req, res) => {
  sess=req.session;
  if (!sess.email){
    res.redirect('/signin');
  }

  res.render('newblog.hbs');
})

app.post('/blogs/delete', (req, res) => {
  var id = req.body.id;
  //console.log(id);
  if (!ObjectID.isValid(id)){
    console.log('ID not valid');
  }
  Blog.findByIdAndRemove(id).then((blog) => {
    // var img_path = __dirname + '/./../public/img/'+blog.image
    if (blog.image != "") {
      var img_path = 'public/img/'+blog.image
      fs.unlink(img_path, (err) => {
        if (err){
          throw err;
        }

      });
    }
    res.redirect('/');
  }).catch((e) => {
    res.send('ahuhu');
  });
});
app.post('/blogs/update', (req, res) => {
  var blog = _.pick(req.body,['id','title','text']);
  //console.log(id);
  if (!ObjectID.isValid(blog.id)){
    console.log('ID not valid');
  }
  Blog.findByIdAndUpdate(blog.id,{
    _id: blog.id,
    title: blog.title,
    text: blog.text
  }).then((blog) => {
    res.redirect('/');
  }).catch((e) => {
    res.send('ahuhu');
  });
});
app.get('/blogs/update', (req, res) => {
  var id = req.query.id;
  Blog.findOne({_id: id}).then((blog) => {
    res.render('blogupdate.hbs',{blog});
  }).catch((e) => {
    res.redirect('/');
  })

});
app.get('/image/post', (req, res) => {
  sess=req.session;
  if (!sess.email){
    res.redirect('/signin');
  }
  res.render('image.hbs');
});
app.post('/image/post', (req, res) => {
  sess=req.session;
  if (!sess.email){
    res.redirect('/signin');
  }
  uploading(req, res, function(err){
    if (err){
      console.log('File size reach limit ');
      res.redirect('/image/post');
      return;
    }
    console.log(req.file);
    res.redirect('/');
  });

});
app.post('/blogs/create', (req, res) => {
  sess=req.session;
  if (!sess.email){
    res.redirect('/signin');
  }
  uploading(req, res, function(err){
    if (err){
      console.log('File size reach limit ');
      res.redirect('/image/post');
      return;
    }
    // console.log(req.file);
    // res.redirect('/');
    var text = req.body.text;
    var title = req.body.title;
    var image = req.file ? req.file.filename : "";
    User.findOne({email:req.session.email}).then((user) => {
      var blog = new Blog({
        text,
        title,
        image,
        _creator: new ObjectID(user._id)
      })
      blog.save()
    }).then((blog) => {
      console.log(blog);
      res.redirect('/');
    }).catch((e) => {
      res.redirect('/blogs/create');
    })
  });


})
app.get('/test/:id', (req, res) => {
  console.log(req.params.id);
  res.send('ahihi');
})
app.listen(port, () => {
  console.log(`Server start on port ${port}`);
})
