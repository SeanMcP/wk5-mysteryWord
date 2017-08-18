const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const morgan = require('morgan');
const mustacheExpress = require('mustache-express');
const path = require('path');
const route = require('./route/index');
const session = require('express-session');

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'mustache');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());

app.use(session({
  secret: "Top secret",
  resave: false,
  saveUninitialized: false
}));

app.use(route);

app.use(morgan('dev'));

app.listen(3000, function(){
  console.log('App is running on localhost:3000');
});
