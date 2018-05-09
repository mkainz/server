// set up an express server with the required variables
var express = require('express');
var path = require("path");
var app = express();
	var fs = require('fs');
var bodyParser = require('body-parser');
// implement us functionality for a bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// add functionality to allow for cross-domain queries when PhoneGap is running a server
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	next();
});


// UPLOAD THE DATA FROM THE QUESTIONS BROWSER APP FORM:	
// use post functionality to set up data upload function
app.post('/uploadData',function(req,res){
	console.dir(req.body);
	//include error message
 	pool.connect(function(err,client,done) {
       	if(err){
          	console.log("not able to get connection "+ err);
           	res.status(400).send(err);
       	} 
// format the geometry
var geometrystring = "st_geomfromtext('POINT(" + req.body.location + ")')";
// create a querystring with an SQL insert statement 
var querystring = "INSERT into questions (question,location,correct,answer1,answer2,answer3) values ('";
querystring = querystring + req.body.question + "'," + geometrystring + ",'" + req.body.correct + "','";
querystring = querystring + req.body.answer1 + "','" + req.body.answer2 + "','" + req.body.answer3+ "')";
		// include error message
       	console.log(querystring);
       	client.query( querystring,function(err,result) {
          done(); 
          if(err){
               console.log(err);
               res.status(400).send(err);
          }
          res.status(200).send("row inserted");
       });
    });

});
	
// add use functionality to log the file requests
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});
	
// read in the certificate file, assign it to a variable and force it to be a string
var configtext = ""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");

// convert the certificate file into the correct format (name/value pair array)
var configarray = configtext.split(",");
var config = {};
for (var i = 0; i < configarray.length; i++) {
	var split = configarray[i].split(':');
	config[split[0].trim()] = split[1].trim();
}
var pg = require('pg');
var pool = new pg.Pool(config);
console.log(config);
	
// add an http server to serve files to the Edge browser to avoid certificate issues
var http = require('http');
var httpServer = http.createServer(app); 
httpServer.listen(4480);
// use get functionality to set up an initial message
app.get('/',function (req,res) {
	res.send("hello world from the HTTP server");
});


// RETRIEVE THE QUESTIONS FROM THE DATABASE 	
// use get functionality to extract questions from the questions database	
app.get('/getPOI', function (req,res) {
     pool.connect(function(err,client,done) {
		// error message 
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
        // convert extracted data into geoJSON layer
        // code adapted from here:  http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
        	var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        	querystring = querystring + "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
        	querystring = querystring + "row_to_json((SELECT l FROM (SELECT id, question, correct, answer1, answer2, answer3) As l      )) As properties";
        	querystring = querystring + "   FROM questions  As lg limit 100  ) As f ";
        	console.log(querystring);
        	client.query(querystring,function(err,result){

          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.status(200).send(result.rows);
       });
    });
});



//  SUBMIT THE USER REPLY
// use post functionality to submit the user answer to the answer database
app.post('/submitQuestion',function(req,res){
	console.dir(req.body);
	// error message
 	pool.connect(function(err,client,done) {
       	if(err){
          	console.log("not able to get connection "+ err);
           	res.status(400).send(err);
       	} 
	// create variable containing SQL insert statement
	var querystring = "INSERT into answers (question, answer) values ('" + req.body.question + ",'" + req.body.answer + "')";
																									
    console.log(querystring);
	// error message
    client.query( querystring,function(err,result) {
        done(); 
        if(err){
            console.log(err);
            res.status(400).send(err);
        }
        res.status(200).send("row inserted");
    });
    });

});


// get function to retrieve GeoJSON 
app.get('/getGeoJSON/:tablename/:geomcolumn', function (req,res) {
     pool.connect(function(err,client,done) {
      	if(err){
          	console.log("not able to get connection "+ err);
           	res.status(400).send(err);
       	} 
       	var colnames = "";

       	// SQL select statement
       	var querystring = "select string_agg(colname,',') from ( select column_name as colname ";
       	querystring = querystring + " FROM information_schema.columns as colname ";
       	querystring = querystring + " where table_name   = '"+ req.params.tablename +"'";
       	querystring = querystring + " and column_name <>'"+req.params.geomcolumn+"') as cols ";

        console.log(querystring);
		// run query
        client.query(querystring,function(err,result){
        //call `done()` to release the client back to the pool
          	done(); 
	          if(err){
               	console.log(err);
               		res.status(400).send(err);
          	}
           	colnames = result.rows;
       	});
        console.log("colnames are " + colnames);

        //transform data into GeoJSON layer
        var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        querystring = querystring + "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg." + req.params.geomcolumn+")::json As geometry, ";
        querystring = querystring + "row_to_json((SELECT l FROM (SELECT "+colnames + ") As l      )) As properties";
        querystring = querystring + "   FROM "+req.params.tablename+"  As lg limit 100  ) As f ";
        console.log(querystring);

        // run second query
        client.query(querystring,function(err,result){
			//call `done()` to release the client back to the pool
          	done(); 
           	if(err){	
                          	console.log(err);
               		res.status(400).send(err);
          	 }
           	res.status(200).send(result.rows);
       	});
    });
});

// post function to test database connection
	app.get('/postgistest', function (req,res) {
		console.log('postgistest');
		pool.connect(function(err,client,done) {
		if(err){
				   console.log("not able to get connection "+ err);
				   res.status(400).send(err);
		}		
		// SQL select statement	   
		client.query('SELECT question FROM questions' ,function(err,result) {
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

	
	// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
  app.get('/:name1', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
  console.log('request '+req.params.name1);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
  res.sendFile(__dirname + '/'+req.params.name1);
});

  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
  app.get('/:name1/:name2', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
  console.log('request '+req.params.name1+"/"+req.params.name2);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
  res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2);
});

  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
  app.get('/:name1/:name2/:name3', function (req, res) {
	// run some server-side code
	// the console is the command line of your server - you will see the console.log values in the terminal window
	console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3); 
	// send the response
	res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
});
  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
  app.get('/:name1/:name2/:name3/:name4', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
 console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4); 
  // send the response
  res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
});