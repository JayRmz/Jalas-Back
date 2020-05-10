var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser        = require('body-parser');

var usersRouter = require('./routes/users');
var usersConfRouter = require('./routes/conf');

var establishmentRouter = require('./routes/establishment');
var establishmentConfRouter = require('./routes/conf');

var eventRouter = require('./routes/events');
var eventConfRouter = require('./routes/conf');

var searchRouter = require('./routes/search');

var establishmentReviewRouter = require('./routes/review');

var loginRouter = require('./routes/login');


var pruebasRouter = require('./routes/pruebas');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/establishments', establishmentRouter);
app.use('/events', eventRouter);
app.use('/search', searchRouter);

app.use('/conf', usersConfRouter);
app.use('/conf', establishmentConfRouter);
app.use('/conf', eventConfRouter);

app.use('/establishmentreview', establishmentReviewRouter);

app.use('/login', loginRouter);

app.use('/pruebas', pruebasRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
