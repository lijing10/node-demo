var request = require('superagent');
var arr = [
	{text: "肖浩哈佛的司法局", form_user: "肖浩"},
	{text: "这不是我写的吗，怎么会出错了", form_user: "肖浩"},
	{text: "没有的事", form_user: "肖浩"},
	{text: "这是怎么忽视吗 怎么肯", form_user: "肖浩"}
];

module.exports = function (query, fn) {
	console.log("query: ", query);
	request.get('http://127.0.0.1:3008/pub/user/wxbind')
		.query({ q: query })
		.end(function(err, res) {
			console.log("res: ", res.body);
			return fn(null, arr);
			// if (res.body && Array.isArray(res.body.results)) {
			// 	return fn(null, res.body.results);
			// }
			fn(new Error('Bad twitter response'));
		});
}