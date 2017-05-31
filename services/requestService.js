var fs = require('fs');
var http = require('http');
var https = require('https');
var exec = require('child_process').exec;
var config = require('./configService.js').getConfig();

var apiRootPath = '/' + (config.biostarAPI.version || 'v2');

function isHttps () {
	return config.biostarAPI.protocol == 'https';
}

function getHttpService () {
	if (isHttps()) {
		return https.request;
	}
	return http.request;
}

var requestService = {
	request: function (options, callback) {
		//console.log('options: ', JSON.stringify(options));
		var header = {
			"Content-Type": "application/json"
		};
		if (options.sessionId) {
			header['bs-session-id'] = options.sessionId
		} else if (options.sessionKey) {
			header['bs-session-key'] = options.sessionKey;
		} else if (options.sessionCookie) {
			header['cookie'] = options.sessionCookie;
		}

		var requestOptions = {
			method: options.method || 'GET',
			host: options.host || config.host || 'localhost',
			port: options.port || config.biostarAPI.port || '8795',
			path: apiRootPath + (options.path || '/'),
			headers: header
		};

		//console.log('requestOptions: ', JSON.stringify(requestOptions));

		var req = getHttpService()(requestOptions, function (res) {
			//console.log('Response headers: ', res.headers);
			res.setEncoding('utf8');
			var responseData = '';

			res.on('data', function (data) {
				responseData += data;
			});

			res.on('end', function () {
				var err;
				var response = JSON.parse(responseData);

				if (response && response.status_code && response.status_code != 'SUCCESSFUL') {
					err = {
						message: response.message,
						bsErrorCode: response.status_code
					};
				} else if (response && response.message && response.message == 'Topology was destroyed') {
					console.log('Biostar 2 API Server error. Restarting service.')
					//restart Biostar API Server service and exec request again
					exec('net stop "BioStar 2 API Server(x64)"');
					setTimeout(function () {
						exec('net start "BioStar 2 API Server(x64)"');
						setTimeout(function () {
							requestService.request(options, callback);
						}, 5000);
					}, 3000);
					return;
				}

				callback && callback(err, response, res);
			});
		});

		req.on('error', function (err) {
			//console.log('error response: ', JSON.stringify(err));
			var error = {
				errorCode: err.code
			};
			console.log('Request to ' + options.path + ' failed: ', error);
			callback && callback(error);
		});

		if (options.data) {
			var payload = JSON.stringify(options.data);
			//console.log('payload: ', payload);
			req.write(payload);
		}

		req.end();
	}
};
module.exports = requestService;