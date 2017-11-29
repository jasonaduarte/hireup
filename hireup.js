var express = require('express');
var app = express();

app.get('/', function (req, res) {

    // Define JSON File
    var fs = require("fs");

    //Set our Output variables.
    //Default daytime rate is $38.
    var rate = 38;
    var duration = 0;
    var total = 0;
    var isValid = true;

    var starttime = new Array();
    var startdaytime = new Array();
    var endtime = new Array();
    var enddaytime = new Array();
    var dow;
    var output_str = '';
    var output = new Array();

    function setDOW(starttime) {

        //Check the day of the week.
        dow = starttime.getDay();
        
    }

    function setRate(starttime,endtime,startdaytime,enddaytime) {

        //Saturday rate
        if (dow === 6) {
            //day is a saturday
            rate = 45.91;
        }
        //Sunday rate
        else if (dow === 0) {
            //day is a sunday
            rate = 60.85;
        }
        //Not a Saturday of Sunday so determine if a night rate should be used.
        else if (starttime < startdaytime) {
            //Book at night rate
            rate = 42.93;
        }

        //Second check for a night rate. 
        if (endtime > enddaytime) {
            //Book at night rate
            rate = 42.93;
        }

    }

    function calcTotal(starttime,endtime) {
        //Calculate the duration
        duration = (endtime - starttime)/(60*60*1000);

        //Set to inValid if the duration is less than an hour or more than 24 hours.
        if(duration < 1 || duration > 24) {
            isValid = false;
            duration = 0;
            total = 0;
        }
        else {
            total = duration * rate;
        }        
    }

    //This function processes a booking one by one from the input.
    function processBooking(id,st,et) {

        starttime[id] = new Date(st);
        endtime[id] = new Date(et);

        startdaytime[id] = new Date(st);
        enddaytime[id] = new Date(et);

        startdaytime[id].setHours(6,0,0,0);
        enddaytime[id].setHours(20,0,0,0);

        setDOW(starttime[id]);
        setRate(starttime[id],endtime[id],startdaytime[id],enddaytime[id]);
        calcTotal(starttime[id],endtime[id]);

        //output_str = 'Duration:'+ duration + ' Total: ' +total+ ' starttime: '+starttime[id]+' endtime: '+endtime[id]+ ' startdaytime: '+startdaytime[id]+' enddaytime: '+enddaytime[id]+' Rate:'+rate+' isValid:'+isValid+'<br>';

        output_str = '{id: ' +id+ ', from: '+starttime[id]+', to: '+endtime[id]+ ', isValid:'+isValid+', total:'+ total+'}';
        output.push(output_str);
    }

    //Init (Main flow logic starts here)
    // Get content from JSON file
    var contents = fs.readFileSync("input.json");
    //Test file (Enable this line instead of above to run the tests, my results are in test_rests.txt)
    //var contents = fs.readFileSync("test.json");
    // Define to JSON type
    var jsonContent = JSON.parse(contents);
    // Get Value from JSON
    //console.log(jsonContent);

    //Loop through each booking in the json file and processBooking function for each.
    for(var bookingKey in jsonContent) {
        //console.log("id:"+bookingKey+", from:"+jsonContent[bookingKey].from+", to:"+jsonContent[bookingKey].to);
        processBooking(bookingKey,jsonContent[bookingKey].from,jsonContent[bookingKey].to);
    }

    res.contentType('application/json');    
    res.send(JSON.stringify(output));

});

app.listen(process.env.PORT || 8888);

console.log('Server running 127.0.0.1:8888');

