var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./models');

var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

(async () => {
  try {
    await db.sequelize.sync();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const error = new Error("Page not found");
  error.status = 404;
  next(error);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (!err.status){
    err.status = 500;
  }
  if (!err.message){
    err.message="Internal Server Error";
  }

  console.log(`Error ${err.status}: ${err.message}`);

  // render the error page
  res.status(err.status);
  if(err.status === 404){
    res.render('page-not-found', {err, title: "404 - Page Not Found!"});
  }else{
    res.render('error', {err, title: `${err.status} ${err.message}`});
  }
});

module.exports = app;
