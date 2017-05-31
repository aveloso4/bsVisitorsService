var fs = require('fs');
var requestService = require('./requestService.js');
var configService = require('./configService.js');
var config = configService.getConfig();

var bsSessionCookie;

function login(callback) {
	logout(function () {
		requestService.request({
			method: 'POST',
			path: '/login',
			data: {
				name: config.biostarAPI.serverName,
				user_id: config.biostarAPI.userId,
				password: config.biostarAPI.password
			}
		}, function (err, response, fullResponse) {
			if (err) {
				console.log('Login error: ', JSON.stringify(err));
			} else {
				//console.log('Login success');
				//console.log('Login response: ', response);
				bsSessionCookie = fullResponse.headers['set-cookie'] && fullResponse.headers['set-cookie'][0];
				callback && callback();
			}
		});
	});
}

function logout(callback) {
	requestService.request({
		method: 'GET',
		path: '/logout',
		sessionCookie: bsSessionCookie
	}, function (err, response) {
		if (err) {
			console.log('Logout error: ', JSON.stringify(err));
			callback && callback(err);
		} else {
			//console.log('Logout success');
			bsSessionCookie = null;
			callback && callback();
		}
	});
}

function getCookie() {
	return bsSessionCookie;
}

var authService = {
	login: login,
	logout: logout,
	getCookie: getCookie
};

module.exports = authService;