/* Welcome to the index.js of our backend */

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
var countriesJSON = require('./js/countries.json')

var app = express();

// OpenWeatherMap APP ID
var appid = '8f7256f305b8b22a4643ef43aee2ad6b';

app.listen(3000, function () {
    console.log('GeoVR Backend listening on Port 3000');
})


/* Routes */

app.get('/getData/:lat/:lon/:type', function (req, res) {
    // Parse our values as integer
    var lat = parseFloat(req.params.lat);
    var lon = parseFloat(req.params.lon);
    var type = req.params.type;

    // Return bad request if coordinates are no numbers
    if (isNaN(lat) || isNaN(lon)) {
        console.log('Incorrect params');
        res.sendStatus(400);
    }
    var code = 'http://scatter-otl.rhcloud.com/location?lat=' + lat + '&long=' + lon;
    request(code, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //country code
            var countryCode = JSON.parse(body).countrycode;
            console.log(countryCode);
            //full country name
            var countryName = find_in_object(countriesJSON, { code: countryCode });
            console.log(countryName[0].name);
            //data queries depending on type specified in URI
            switch (type) {
                case "temperature":
                    // Contact OpenWeatherMap API
                    var weatherString = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + appid;
                    request(weatherString, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var data = JSON.parse(body);
                            var temp = data.main.temp;
                            res.json((parseFloat(temp) - 273.15).toFixed(2) + " °C");
                        } else {
                            console.log(error);
                            res.sendStatus(500);
                        }
                    });
                    break;
                case "population":
                    /** TODO */
                    break;
            };
        }
    });


    // help function for filtering json
    function find_in_object(my_object, my_criteria) {

        return my_object.filter(function (obj) {
            return Object.keys(my_criteria).every(function (c) {
                return obj[c] == my_criteria[c];
            });
        });

    };
});
