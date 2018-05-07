function startDataUpload() {
	alert ("start data upload");

	var loc = document.getElementById("location").value;
	var question = document.getElementById("question").value;
	var correct = document.getElementById("correct").value;
	var answer1 = document.getElementById("answer1").value;
	var answer2 = document.getElementById("answer2").value;
	var answer3 = document.getElementById("answer3").value;
	
	var postString = "location="+loc +"&question="+question + "&correct="+correct +"&answer1="+answer1 +"&answer2="+answer2 +"&answer3="+answer3;
	processData(postString);
	
	alert (postString);
}

var client;
function processData(postString) {
	client = new XMLHttpRequest();
	client.open('POST','http://developer.cege.ucl.ac.uk:30299/uploadData',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = dataUploaded;
	client.send(postString);
}
// create the code to wait for the response from the data server, and process the response once it is received
function dataUploaded() {
	// this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4) {
	// change the DIV to show the response
		document.getElementById("dataUploadResult").innerHTML = client.responseText;
	}
}

