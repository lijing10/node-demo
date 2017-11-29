var express = require('express'),
	mongodb = require('mongodb');

app = express.createServer();

/**
 * 中间件
 */
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'my secret' }));

/**
 * 身份验证中间件
 */
app.use(function(req, res, next) {
	console.log("_id_: ", req.session.loggedIn);
	if (req.session.loggedIn) {
		// res.local('authenticated', true);
		res.locals.authenticated = true;

		var MongoClient = mongodb.MongoClient;
		var url = 'mongodb://127.0.0.1:27017/my-website';

		MongoClient.connect(url, function(err, db) {

			if (err) return next(err);

			var collection = db.collection('documents');
			
			collection.find({ 
				// _id: { $oid: req.session.loggedIn }
				_id: req.session.loggedIn
			}).toArray(function(err, result) {
				if (err) throw err;
				console.log("find again result: ", result);
				
				// res.local('me', result[0]);
				res.locals.me = result;
				next();
			});

			console.log('\033[96m + \033[39m 身份验证成功成功');
		});
	} else {
		// res.local('authenticated', false);
		res.locals.authenticated = false;
		next();
	}
});

app.set('view engine', 'jade');
app.set('view options', { layout: false });

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
		console.log(req.body.user);
		
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

		console.log('\033[96m + \033[39m 登陆连接成功');
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

		console.log('\033[96m + \033[39m 连接成功');
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

app.listen(3001, function() {
	console.log('\033[96m + \033[39m app listening on *:3001');
});




