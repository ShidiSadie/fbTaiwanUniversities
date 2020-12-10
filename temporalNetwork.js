//This file is function related to playing the temporal data over time

//Global Vars
var filteredData;
var play_pause_toggle = 1;
var current_index = 0;

//Get min and max month/year combo from inside and outside dat
function getMinAndMaxOutAndIn(arr1, arr2){
	var maxY;
	var maxM;
	var minY;
	var minM;

	//Compare max year/month
	if(arr1[0] > arr2[0]){
		maxY = arr1[0];
		maxM = arr1[1];
	}else if(arr2[0] > arr1[0]){
		maxY = arr2[0];
		maxM = arr2[1];
	}else{
		if(arr1[1] > arr2[1]){
			maxY = arr1[0];
			maxM = arr1[1];
		}else if(arr2[1] > arr1[1]){
			maxY = arr2[0];
			maxM = arr2[1];
		}else{
			maxY = arr2[0];
			maxM = arr2[1];
		}
	}

	//Compare min year/month
	if(arr1[2] < arr2[2]){
		minY = arr1[2];
		minM = arr1[3];
	}else if(arr2[2] < arr1[2]){
		minY = arr2[2];
		minM = arr2[3];
	}else{
		if(arr1[3] < arr2[3]){
			minY = arr1[2];
			minM = arr1[3];
		}else if(arr2[3] < arr1[3]){
			minY = arr2[2];
			minM = arr2[3];
		}else{
			minY = arr2[2];
			minM = arr2[3];
		}
	}

	return [maxY, maxM, minY, minM];
}//end function

//Get min and max month/year combo from data
function getMinAndMax(data){
	var finalDate = data[data.length - 1].action_time.split("-");
  	var maxYear = parseInt(finalDate[0]);
  	var maxMonth = parseInt(finalDate[1]);

  	var startDate = filteredData[0].action_time.split("-");
    var minYear = parseInt(startDate[0]);
    var minMonth = parseInt(startDate[1]);
    // console.log("finalDate = ", finalDate, "maxYear =", maxYear, " maxMonth = ", maxMonth);
    // console.log("startDate = ", startDate, "minYear =", minYear, " minMonth = ", minMonth);
    return [maxYear, maxMonth, minYear, minMonth];
}//end function

//Compares 2 month/year combo to say is a higher or lower than b
function compareDate(a, b){
	var aSplit = a.action_time.split("-");
	var aMonth = parseInt(aSplit[1]);
	var aYear = parseInt(aSplit[0]);

	var bSplit = b.action_time.split("-");
	var bMonth = parseInt(bSplit[1]);
	var bYear = parseInt(bSplit[0]);

	//console.log("aSplit = ", aSplit, "aMonth =", aMonth, " aYear = ", aYear);
	if(aYear > bYear){
		return 1;
	}else if(bYear > aYear){
		return -1;
	}else if( bYear == aYear){
		if(aMonth > bMonth){
			return 1;
		}else if(bMonth > aMonth){
			return -1;
		}else{
			return 0;
		}
	}
}//end function

//Says is source target is already in pairs array, returns pairs[2] which is the index of source target in data
function comparePairs(pairs, source, target){
	for(var j = 0; j < pairs.length; j++){
		if(pairs[j][0] == target && pairs[j][1] == source){
			return pairs[j][2];
		}
	}
	return -1;
}//end function

//Checks if any source,target and target,source combination in the same month/year
function checkDataCombos(data){
	var current_timestep;
	var pairs = [];
	for(var i = 0; i < data.length; i++){
		var new_timestep = data[i].action_time;
		//console.log("new_timestep = ", new_timestep, " i = ", i, " data[i].source ", data[i].source, "data[i].target ", data[i].target);
		if( i == 0){
			//console.log("first element  = ",  data[i].action_time);
			current_timestep = data[i].action_time;
			//console.log("pushing  = ",  data[i].source, " , ", data[i].target, " , ", i );
			pairs.push([data[i].source, data[i].target, i]);
		}else{
			if(new_timestep != current_timestep){
				//console.log("changing timestep don't compare");
				current_timestep = new_timestep;
				pairs = [];
				//console.log("pushing  = ",  data[i].source, " , ", data[i].target, " , ", i );
				pairs.push([data[i].source, data[i].target, i]);
			}else{
				//console.log("timestep same so compare pairs = ", pairs);
				var value = comparePairs(pairs, data[i].source, data[i].target );
				if(value != -1){
					//console.log("found matching pair at value ", value);
					//console.log("found matching pair at value ", value, " = ", data[value].source, ",", data[value].target, " for ", data[value].action_time );
					//console.log("found matching pair at  i ", i, " = ", data[i].source, ",", data[i].target, " for ", data[i].action_time );
					//console.log(" old value ")
					data[value].count = data[i].count + data[value].count;
					//console.log(" new data value ", data[value].count);
					data.splice(i, 1);
					//console.log(" new data  ", data, " i = ", i);
					i--;
				}else{
					//console.log("no matching pair so add to pairs list");
					//console.log("pushing  = ",  data[i].source, " , ", data[i].target, " , ", i );
					pairs.push([data[i].source, data[i].target, i]);
				}
			}
		}
	}//end for loop
	return data;
}//end function

//Gets the internal links data for selected dep
function getInternalData(currentDep, ownersPerDep, insideConns, owners, temporal_inside_data){
	//console.log("getting internal data for dep ", currentDep);
	filteredData = temporal_inside_data.filter(function(d){
		var ans = ownersPerDep[currentDep-1].includes(d.source);
		return ans;
	});

	filteredData.sort(compareDate);
	console.log("ownersPerDep", ownersPerDep);
	console.log("filteredData = ", filteredData , "dep ", currentDep-1);
	filteredData = checkDataCombos(filteredData);
	//console.log("elimnate combos filteredData = ", filteredData);
	return filteredData;
}//end function

//Gets the external links data for selected dep
function getExternalData(currentDep, ownersPerDep, outsideConns, owners, temporal_outside_data){
	//console.log("getting external data for dep ", currentDep);
	filteredData = temporal_outside_data.filter(function(d){
		var ans = ownersPerDep[currentDep-1].includes(d.owner);
		return ans;
	});

	filteredData.sort(compareDate);
	//console.log("filteredData = ", filteredData);
	return filteredData;
}//end function

//Loads the selected dep and gets the data
function loadingNetwork(currentDep, ownersPerDep, insideConns, outsideConns, owners, temporal_inside_data, temporal_outside_data){
	//console.log("Loading network for temporal vis dep  = ", currentDep);
	//First get all internal node from temporal_data_inside
	var inside_filtered = getInternalData(currentDep, ownersPerDep, insideConns, owners, temporal_inside_data);
	//console.log("inside_filtered = ", inside_filtered);
	var outside_filtered = getExternalData(currentDep, ownersPerDep, outsideConns, owners, temporal_outside_data);

	return [inside_filtered, outside_filtered];
}//end function

//Creates the time steps for the slider 
function createTimeSteps(max_year, max_month, min_year, min_month){
	var answer = [];
	var current_year = min_year;
	var current_month = min_month;

	while(!(current_year == max_year && current_month == max_month)){
		var temp = [current_year, current_month];
		answer.push(temp);
		if(current_month == 12){
			//change new year and month
			current_year++;
			current_month = 1;
		}else{
			current_month++;
		}
	}

	var temp = [current_year, current_month];
	answer.push(temp);
	return answer;
}//end function

function inArray(source, target, arr){
	for(var i = 0; i < arr.length; i++){
		if(target == arr[i].source && source == arr[i].target){
			return true;
		}
	}
	return false;
}//end function

function inArray2(source, arr){
	for(var i = 0; i < arr.length; i++){
		if(source == arr[i].owner){
			return true;
		}
	}
	return false;
}//end function

function inArray3(source, dep, arr){
	for(var i = 0; i < arr.length; i++){
		if(source == arr[i].owner){
			if(dep == arr[i].dep){
				return true;
			}
		}
	}
	return false;
}//end function

function ownersInArray(id, arr){
	for(var i = 0; i < arr.length; i++){
		if(id == arr[i].source || id == arr[i].target){
			return true;
		}
	}
	return false;
}//end function

//Updates the current department network for current timestep given
function updateNetwork(inside_conns, outside_conns, current_timestep, inside_filtered_data, outside_filtered_data, owners){
	var total_count = 0;
	var inside_data_current_timestep = inside_filtered_data.filter(function(d){
		var time = d.action_time.split("-");
		var time_month = parseInt(time[1]);
		var time_year = parseInt(time[0]);

		if(time_year == current_timestep[0] &&  time_month == current_timestep[1]){
			total_count = total_count + d.count; 
			return true;
		}else{
			return false;
		}
	});

	var outside_data_current_timestep = outside_filtered_data.filter(function(d){
		var time = d.action_time.split("-");
		var time_month = parseInt(time[1]);
		var time_year = parseInt(time[0]);

		if(time_year == current_timestep[0] &&  time_month == current_timestep[1]){
			total_count = total_count + d.count; 
			return true;
		}else{
			return false;
		}
	});

	//console.log("inside_data_current_timestep = ", inside_data_current_timestep);
	inside_conns.style("opacity", function(d){
		if(inArray(d.source, d.target, inside_data_current_timestep)){
			return 0.9;
		}else if(inArray(d.target, d.source, inside_data_current_timestep)){
			return 0.9;
		}else{
			return 0;
		}
	})
	.attr("stroke", function(d){
		if(inArray(d.source, d.target, inside_data_current_timestep)){
			return "black";
		}else if(inArray(d.target, d.source, inside_data_current_timestep)){
			return "black";
		}else{
			return d.color;
		}
	});

	outside_conns.style("opacity", function(d){
		if(inArray3(d.source, d.tgt_dep, outside_data_current_timestep)){
			return 0.9;
		}else{
			return 0;
		}
	})
	.attr("stroke", function(d){
		if(inArray3(d.source, d.tgt_dep, outside_data_current_timestep)){
			return "black";
		}else{
			return d.color;
		}
	});

	owners.attr("stroke", function(d){
		if(ownersInArray(d.id,inside_data_current_timestep )){
			return "black";
		}else if(inArray2(d.id, outside_data_current_timestep)){
			return "black";
		}else{
			return "#ccc";
		}
	})
	.attr("stroke-width", function(d){
		if(ownersInArray(d.id,inside_data_current_timestep )){
			return 5;
		}else if(inArray2(d.id, outside_data_current_timestep)){
			return 5;
		}else{
			return 1;
		}
		
	})

	return [inside_data_current_timestep.length + outside_data_current_timestep.length, total_count];
}//end function

//Updates the handle when dragging and updates the dep network as well
function updateHandle2(h, handle, x, timeSteps, inside_filtered_data, outside_filtered_data, inside_conns,outside_conns, owners){
	// console.log("in updateHandle x =", x.domain, " h = ", h);
	// console.log("x(h)", x(h));
	// console.log("round h", Math.round(h));
	handle.attr("cx", x(h));
	//Change text label

	var ans = updateNetwork(inside_conns, outside_conns, timeSteps[Math.round(h)], inside_filtered_data, outside_filtered_data, owners);
	current_index = Math.round(h);
	//d3.select("#outputMY").text(timeSteps[Math.round(h)][1] + "-" + timeSteps[Math.round(h)][0] + ", e" + ans[0] + " c" + ans[1]);
	d3.select("#outputMYEC").text(timeSteps[Math.round(h)][1] + "-" + timeSteps[Math.round(h)][0] + ", e" + ans[0] + " c" + ans[1]);
 	d3.select("#b1Play").text("Play");
	play_pause_toggle = 1;
}//end function

//Updates the handle when being played
function updateHandle(h, handle, x, month, year, edges, count){
	// console.log("in updateHandle x =", x.domain, " h = ", h);
	// console.log("x(h)", x(h));
	// console.log("x.invert(h)", x.invert(h));
	handle.attr("cx", x(h));
	// console.log("count", count);
	//Change text label
	//d3.select("#outputMY").text(month + "-" + year + ", e" + edges + " c" + count);
	d3.select("#outputMYEC").text(month + "-" + year + ", e" + edges + " c" + count);
}//end function

//Check if pause button has been hit
function checkPlayPause(){
	if(play_pause_toggle == 1){
		//this means pause button has been hit
		//so interrupt
		return false;
	}else{
		return true;
	}
}//end function

//Plays the temporal data of the dep network
function playTemporalNetwork(inside_filtered_data, outside_filtered_data, timesteps, inside_conns, outside_conns, currentDiveInDep, ownersPerDep, owners, handle, x){
	var length_timesteps = timesteps.length;
	//console.log("starting ------------------------------------ index = ", current_index);

	//Sets first timestep to nothing
	if(current_index == 0){
		inside_conns.style("opacity", function(d){
			return 0;
		});
		//d3.select("#outputMY").text(0 + "-" + 0 + ", e" +0 + " c" + 0);
		d3.select("#outputMYEC").text(0 + "-" + 0 + ", e" +0 + " c" + 0);
	}
	
	//Update domain to length
	x.domain([0, length_timesteps-1])

	function myLoop(){
		setTimeout(function() {
			// if(checkPlayPause()){
			// 	console.log("Keeping playing");
			// }else{
			// 	console.log("pause at index", current_index);
			// 	//save current index somehow
			// 	return;
			// }
			if(checkPlayPause() == false){
				//Interrupt loop
				return;
			}

			//console.log("current_index = ", current_index, "timesteps = ", timesteps[current_index]);
			var ans = updateNetwork(inside_conns, outside_conns, timesteps[current_index], inside_filtered_data, outside_filtered_data, owners);
			updateHandle((current_index), handle, x, timesteps[current_index][1], timesteps[current_index][0], ans[0], ans[1] );
			current_index++;
			if(current_index != length_timesteps){
				myLoop();
			}else{
				current_index = 0;
				 d3.select("#b1Play").text("Play");
				 play_pause_toggle = 1;
			}
			
		}, 1000);
	}
	myLoop();
}//end function