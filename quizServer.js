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

// test the connection:		(http://developer.cege.ucl.ac.uk:31099/postgistest)
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

	
	
// DATA UPLOAD: QUESTIONS
//function for upoad start alert
function startDataUpload() {
alert ("start data upload");
}

// add body-parser to enable the processing of the uploaded data
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
 extended: true
}));
app.use(bodyParser.json());

//add post request so the form data is returned to the userAgent
app.post('/uploadData',function(req,res){
// use POST as we are uploading data
// --> parameters form part of the BODY of the request rather than the RESTful API
console.dir(req.body);
// echo the request back to the user
res.send(req.body);
});

// add AJAX call & response method
// function to process the input data 
var client;
function processData(postString) {
 client = new XMLHttpRequest();
 client.open('POST','http://developer.cege.ucl.ac.uk:30299/uploadData',true);
 client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
 client.onreadystatechange = dataUploaded;
 client.send(postString);
}
// function to wait for server response (ready = state 4) and for response processing
// will print the response text into the "data Upload Result" div
function dataUploaded() {
 if (client.readyState == 4) {
 // change the DIV to show the response
 document.getElementById("dataUploadResult").innerHTML = client.responseText;
 }
}

// upload form data and create alert with form input
function startDataUpload() {
	alert ("start data upload");
	
	var loc = document.getElementById("location").value;
	var question = document.getElementById("question").value;
	var correct = document.getElementById("correct").value;
	var answer1 = document.getElementById("answer1").value;
	var answer2 = document.getElementById("answer2").value;
	var answer3 = document.getElementById("answer3").value;
	
	var postString = "location="+loc+"&question"+question+"&correct"+correct+"&answer1"+answer1+"&answer2"+answer2+"&answer3"+answer3;
	processData(postString);
	
	alert(loc + " "+ question + " "+ correct + " "+ answer1 + " "+ answer2 + " "+ answer3);
}

