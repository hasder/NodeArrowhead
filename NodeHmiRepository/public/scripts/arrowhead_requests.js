/**
 * http://usejsdoc.org/
 */

function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();


    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.open('GET', url, true);
    // Make the request
    req.send();
  });
}

function getServiceList() {
	get('http://127.0.0.1:1100/servicediscovery/service').then(function(response) {
		console.log("Success!", response);
		
		var json = JSON.parse(response);
			
		var listbox = document.getElementById("servicelist");
		
		var currentdate = new Date(); 
		var datetime = "Last Sync: " + currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes() + ":" 
		                + currentdate.getSeconds();
		
		listbox.innerHTML = datetime + '<br/>';
		
		var tbl = document.createElement('table');
		listbox.appendChild(tbl);
		tbl.id='servicestable'
		
		var thead = tbl.appendChild(document.createElement('thead'));
		thead.innerHTML = ("<tr><td>name</td><td>type</td><td>host</td><td>port</td></tr>");
		
		var tbdy = document.createElement('tbody');
		tbl.appendChild(tbdy);
		
		for(var row=0; row < json.length; row++){
		    var innerHTML = '';
		    var tr = tbdy.insertRow(row);
		    innerHTML += "<td>"+json[row].name+"</td>";
		    innerHTML += "<td>"+json[row].type+"</td>";
		    innerHTML += "<td>"+json[row].host+"</td>";
		    innerHTML += "<td>"+json[row].port+"</td>";
		    tr.innerHTML = innerHTML;
		}
		
		
	}, function(error) {
	  console.error("Failed!", error);
	});
	
}



function getOrchestrationRules(systemname) {
	console.log(systemname.value);
	get("http://127.0.0.1:1102/orchestrationstore/configuration/"+systemname.value).then(function(response){
		
		var json = JSON.parse(response);
		
		var listbox = document.getElementById("rulelist");
		
		var currentdate = new Date(); 
		var datetime = "Last Sync: " + currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes() + ":" 
		                + currentdate.getSeconds();
		
		listbox.innerHTML = datetime + '<br/>';
		
		var tbl = document.createElement('table');
		listbox.appendChild(tbl);
		tbl.id='rulestable'
		
		var thead = tbl.appendChild(document.createElement('thead'));
		thead.innerHTML = ("<tr><td>target</td><td>rules</td></tr>");
		
		var tbdy = document.createElement('tbody');
		tbl.appendChild(tbdy);
		
		
		
		for(var row=0; row < json.length; row++){
			for(var rulerow=0; rulerow< json[row].rules.length; rulerow++) {
			    var innerHTML = '';
			    var tr = tbdy.insertRow(row);
			    innerHTML += "<td>"+json[row].target+"</td>";
			    innerHTML += "<td>"+json[row].rules[rulerow]+"</td>";
			    tr.innerHTML = innerHTML;
			}
		}
		
	}); 
}

function getOrchestration(systemname) {
	console.log(systemname.value);
	get("http://127.0.0.1:1102/orchestrationengine/"+systemname.value).then(function(response){
		
		var json = JSON.parse(response);
		
		var listbox = document.getElementById("orchestration");
		
		var currentdate = new Date(); 
		var datetime = "Last Sync: " + currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes() + ":" 
		                + currentdate.getSeconds();
		
		listbox.innerHTML = datetime + '<br/>';
		listbox.innerHTML += json.target;
		
		var tbl = document.createElement('table');
		listbox.appendChild(tbl);
		tbl.id='orchestrationtable'
		
		var thead = tbl.appendChild(document.createElement('thead'));
		thead.innerHTML = ("<tr><td>name</td><td>address</td></tr>");
		
		var tbdy = document.createElement('tbody');
		tbl.appendChild(tbdy);
		
		for(var row=0; row < json.services.length; row++){
		    var innerHTML = '';
		    var tr = tbdy.insertRow(row);
		    innerHTML += "<td>"+json.services[row].name+"</td>";
		    innerHTML += "<td>"+json.services[row].address+"</td>";
		    tr.innerHTML = innerHTML;
		}
		
	}); 
}







