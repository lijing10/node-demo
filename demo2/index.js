var http = require('http');

var login = {
	"status_code": 200,
	"error_message": "成功",
	"data": {
		"token": "11111",
		"uid": "22222",
		"config": {
			"debug": true
		}
	}
}

http.createServer(function(req, res) {
	console.log(req.url);

	if ('/login' == req.url) {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		// res.setEncoding('utf8');
		res.end(JSON.stringify(login));
	} else if ('/api/sources/info' == req.url) {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end('{"item": 1, "item2": 2}');
	}

	
}).listen(3008);