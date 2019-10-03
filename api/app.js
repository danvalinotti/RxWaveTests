var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var reportsRouter = require('./routes/reports');

var options = {
  bufferMaxEntries: 0,
  reconnectTries: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect('mongodb://ec2-54-81-21-172.compute-1.amazonaws.com:27017/rxwave_testing', options)

global.db = (global.db ? global.db: mongoose.connection);
global.db.on('error', console.error.bind(console, 'Error connecting with MongoDB: '))
global.db.once('open', function() {
  console.log('Connected to MongoDB')
});
global.db.on('disconnected', function () {
  mongoose.connect('mongodb://localhost:27017/rxwave_testing', options);
  global.db = mongoose.connection;
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/reports', reportsRouter);

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
