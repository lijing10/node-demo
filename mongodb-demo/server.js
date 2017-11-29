var express = require('express'),
	mongodb = require('mongodb'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	cookieParser = require('cookie-parser');

var app = express();

app.set('view engine', 'jade');
app.set('view options', { layout: false });

/**
 * 中间件
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'my secret'
}));

/**
 * 身份验证中间件
 */
app.use(function(req, res, next) {
	
	if (req.session.loggedIn) {
		console.log("_id_: ", req.session.loggedIn);
		// res.local('authenticated', true);
		res.locals.authenticated = true;

		var MongoClient = mongodb.MongoClient;
		var url = 'mongodb://127.0.0.1:27017/my-website';

		MongoClient.connect(url, function(err, db) {

			if (err) return next(err);

			var collection = db.collection('documents');
			
			collection.find({
				_id: mongodb.ObjectId(req.session.loggedIn)
			}).toArray(function(err, result) {
				if (err) throw err;
				console.log("find check result: ", result);
				
				// res.local('me', result[0]);
				res.locals.me = result[0];
				next();
			});

			console.log('\033[96m + \033[39m 身份验证成功');
		});
	} else {
		// res.local('authenticated', false);
		res.locals.authenticated = false;
		next();
	}
});

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/login/:signupEmail?', function(req, res) {
	// res.render('login');
	res.render('login', { signupEmail: req.params.signupEmail });
});

app.get('/signup', function(req, res) {
	res.render('signup');
});

app.get('/logout', function(req, res) {
	req.session.loggedIn = null;
	res.redirect('/');
});

/**
 * 处理登陆路由
 */
app.post('/login', function(req, res) {
	var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://127.0.0.1:27017/my-website';

	MongoClient.connect(url, function(err, db) {

		if (err) return next(err);

		var collection = db.collection('documents');
		console.log(req.body);
		
		collection.find({ 
			email: req.body.user.email,
			password: req.body.user.password
		}).toArray(function(err, result) {
			if (err) throw err;
			console.log("find result: ", result);

			if (!result || result.length === 0) return res.send('<p>未找到用户，请您先注册</p>')
			
			req.session.loggedIn = result[0]._id.toString();
			res.redirect('/');
		});

		console.log('\033[96m + \033[39m 登陆成功');
	});
});

/**
 * 处理注册路由
 */
app.post('/signup', function(req, res, next) {

	var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://127.0.0.1:27017/my-website';

	MongoClient.connect(url, function(err, db) {

		if (err) return next(err);

		var collection = db.collection('documents');
		console.log(req.body.user);
		
		collection.insert(req.body.user, function(err, result) {
			if (err) throw err;
			console.log("insert result: ", result);

			res.redirect('/login/' + result.ops[0].email);
		});

		console.log('\033[96m + \033[39m 注册成功');
	});
});

/**
 * 连接数据库
 */
// var server = new mongodb.Server('127.0.0.1', 27017);

// new mongodb.Db('my-website', server).open(function(err, client) {
// 	if (err) throw err;

// 	console.log('\033[96m + \033[39m 连接成功');

// 	app.users = new mongodb.Collection(client, 'users');

// });

// app.listen(3001, function() {
// 	console.log('\033[96m + \033[39m app listening on *:3001');
// });

app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function() {
	console.log('\033[96m + \033[39m app listening on *:3001');
});




