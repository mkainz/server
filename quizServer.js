// express is the server that forms part of the nodejs program
	var express = require('express');
	var path = require("path");
	var app = express();
	var https = require('https');
	var fs = require('fs');

	// adding functionality to allow cross-domain queries when PhoneGap is running a server
	app.use(function(req, res, next) {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
		res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		next();
	});

	
	// adding functionality to log the requests
	app.use(function (req, res, next) {
		var filename = path.basename(req.url);
		var extension = path.extname(filename);
		console.log("The file " + filename + " was requested.");
		next();
	});


	var privateKey = fs.readFileSync('/home/studentuser/certs/client-key.pem').toString();
	var certificate = fs.readFileSync('/home/studentuser/certs/client-cert.pem').toString(); 
	var credentials = {key: privateKey, cert: certificate};
	var httpsServer = https.createServer(credentials, app);
	httpsServer.listen(4443);



	// serve static files - e.g. html, css
	app.use(express.static(__dirname ));
