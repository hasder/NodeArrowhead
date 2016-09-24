/**
 * http://usejsdoc.org/
 */



var taffy = require('taffydb').taffy;
//var localStorage = require('localStorage');

var servicedb = [];



function servicerecord ( name, type, host, port, domain, properties )  {
	this.name = name;
	this.type = type;
	this.host = host;
	this.port = port;
	this.domain = domain;
	this.properties = properties;
}


var inJSON = [
              new servicerecord(
            		  "default",
            		  "_coap-json._udp",
            		  "[fdfd::ff]", "5683",
            		  "unknown",
            		  {
            			  "property":[
            			              {
            			            	  "name":"version",
            			            	  "value":"1.0"
    			            		  },
    			            		  {
    			            			  "name":"path",
    			            			  "value":"/palletAvailable"
    			            		  }
    			            		 ]
            		  })
              ];

var db = new taffy(inJSON);
