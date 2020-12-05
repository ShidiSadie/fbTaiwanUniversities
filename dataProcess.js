//THis is where the code begins
//This allows the temporal data to be accessible throughout the entire draw function in main

 d3.json("datasets/temporal_data_inside.json")
	 .then( data => {
	 	 d3.json("datasets/temporal_data_outside.json")
		 .then( data2 => {
		 	//Draw function in main.js
		 	draw(data, data2);
		});
	});