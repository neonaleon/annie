var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var hbs = require('hbs');
var hbsutils = require('hbs-utils')(hbs);
var passport = require('passport');

var config = require('./config'); // load app configs
var configurePassport = require('./config/passport');
configurePassport(passport);

var UserModel = require('./models').UserModel;

var app = express();

app.disable('x-powered-by');
app.set('trust proxy', '10.25.11.45');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// hbs.registerHelper('if-column-index', require('./views/helpers/if-column-index'));
hbs.registerHelper('format-markdown', require('./views/helpers/format-markdown'));
hbs.registerHelper('render-metric-partial', require('./views/helpers/render-metric-partial'));
hbs.registerHelper('link-to', require('./views/helpers/link-to'));
// hbs.registerPartials(__dirname + '/views/partials');
hbsutils.registerWatchedPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/sdk', express.static(path.join(__dirname, 'sdk'))); // SDK

app.use(session({
	secret: 'annie needs a secret',
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// set up some locals for res.render
app.use(function(req, res, next){
	var session = res.locals.session = {
		authenticated: false,
		user: { email: '' }
	};
	if (req.isAuthenticated()){
		session.authenticated = true;
		session.user.email = req.user.email;
	}

	res.locals.url = req.url;

	// set to the correct baseUrl when running behind nginx
	// e.g. res.locals.baseUrl = '/annie/';

//	res.locals.baseUrl = '/leonho/annie/';
	res.locals.baseUrl = '/';

	next();
});

// unprotected routes
app.use('/', require('./routes/base'));
app.use('/developer', require('./routes/developer'));
app.use('/guide', require('./routes/guide'));

app.use('/api', require('./routes/api'));

// protected routes
app.use('/applications', passport.protectedRoute, require('./routes/applications'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
