var fs = require('fs');
var path = require('path');

function getConfig() {
	var config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));
	return config;
}

function updateConfig(newConfig) {
	fs.writeFileSync('./config.json', JSON.stringify(newConfig, null, 4));
}

var configService = {
	getConfig: getConfig,
	updateConfig: updateConfig
};
module.exports = configService;