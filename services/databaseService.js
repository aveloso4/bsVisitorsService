var mssql = require('mssql');
var config = require('./configService.js').getConfig();

var bsPool = new mssql.ConnectionPool(config.dbConfig);

mssql.on('error', function (err) {
	console.log('MSSQL error: ', err);
});

function query (query, callback) {
	bsPool.connect(function (err) {
		if (err) {
			console.log('Connection to database error: ', err);
			return callback(err);
		}

		var request = new mssql.Request(bsPool);
		request.query(query, function (err, results) {
			if (err) {
				console.log('Query error: ', err);
				return callback(err);
			}

			return callback(null, results);
		});
	});
}

var databaseService = {
	query: query
};
module.exports = databaseService;