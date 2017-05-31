var _ = require('lodash');
var recepcionistService = require('./services/recepcionistService.js');
var accessGroupService = require('./services/accessGroupService.js');
var deviceService = require('./services/deviceService.js');


function init () {
	recepcionistService.getAll(function (err, recepcionists) {
		if (err) {}

		_.forEach(recepcionists, function (repecionist) {
			var accessGroup = recepcionistService.getAccessGroup(recepcionist);
			recepcionistService.save(recepcionist, function (err) {
				if (err) {}				

				accessGroupService.getDevices(accessGroup, function (err, devices) {
					if (err) {}

					_.forEach(devices, function (device) {
						var deviceType = deviceService.getType(device);

						deviceService.save(device, function (err) {
							if (err) {}

							recepcionistService.saveDevice(device, function (err) {
								if (err) {}
							});
						});
					});
				});
			});
		});
	});
}

init();