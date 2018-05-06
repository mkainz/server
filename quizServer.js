// express is the server that forms part of the nodejs program
var express = require('express');
var app = express();

//functionality for cross origin request (i.e. making data requests
//from this server via the PhoneGap server
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

// serve static files - e.g. html, css
app.use(express.static(__dirname));

var https = require('https');
var fs = require('fs');
var privateKey = fs.readFileSync('/home/studentuser/certs/client-key.pem').toString();
var certificate = fs.readFileSync('/home/studentuser/certs/client-cert.pem').toString(); 
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(4443);


// CONNECTING TO POSTGRES:
// read in the file and force it into a string by adding "" at the beginning
var configtext =
""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
// now convert the configuration file into the correct format (name/value pair array)
var configarray = configtext.split(",");
var config = {};
for (var i = 0; i < configarray.length; i++) {
	var split = configarray[i].split(':');
	config[split[0].trim()] = split[1].trim();
}
// import connectivity code and connect to database
var pg = require('pg');
var pool = new pg.Pool(config);

// test the connection:
	app.get('/postgistest', function (req,res) {
		console.log('postgistest');
		pool.connect(function(err,client,done) {
		if(err){
				   console.log("not able to get connection "+ err);
				   res.status(400).send(err);
			   } 
				client.query('SELECT name FROM united_kingdom_counties' ,function(err,result) {
				console.log("query");
				   done(); 
				   if(err){
					   console.log(err);
					   res.status(400).send(err);
				   }
				   res.status(200).send(result.rows);
			   });
			});
	});
