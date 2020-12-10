  var currentListingDimension = "extEdges";


  function inArrayComp(arr, d){
  	for(var i = 0; i < arr.length; i++){
  		if(arr[i] == d){
  			//console.log("found ", d, " at ", i);
  			return true;
  		}
  	}
  	return false;
  }


  function findDep(source, ownersPerDep){
  	//console.log("here === ownersPerDep = ", ownersPerDep);
    for(var i =0; i < 71;i++){
      if(inArrayComp(ownersPerDep[i], source)){
      	//console.log("here tada");
        return i;
      }
    }
  }

function compareEdgeNum(a,b){
	if(a[1]> b[1]){
		return -1;
	}else if(a[1] < b[1] ){
		return 1;
	}else{
		return 0;
	}
}


function listing(outside_connections, names, circles, value){

	//console.log("value in listing ", value);
	d3.select("#orderListDep").selectAll("g").remove();


	//console.log("listing owners", circles.nodes());
	var externalEdgesPerDep = new Array();
	var internalEdgesPerDep = new Array();
	  for(var i = 0; i < 71; i++){
	    var temp = [];
	    externalEdgesPerDep.push(temp);
	    internalEdgesPerDep.push(temp);
	  }

	  
	 d3.json("datasets/Owners.json")
      .then( data2 => {

      	var ownDep = [];

        for(var i = 0; i < 71; i++){
		    var temp = [];
		    ownDep.push(temp);
		}

		data2.forEach(function(d){
			ownDep[d.dep-1].push(d.id)
		})

		//console.log("ownDep =", ownDep);

		if(value == "extEdges"){
			  d3.json("datasets/conn_outside_dep.json")
		      .then( data => {

		      	data.forEach(function(d){
		      		var depWithSource = findDep(d.source, ownDep);
		      		//console.log("dep with source = ", depWithSource, " source ", d.source);
		      		if(depWithSource != undefined)
		  				externalEdgesPerDep[depWithSource].push([d.source, d.tgt_dep]);
		      	})

		      	//console.log("externalEdgesPerDep", externalEdgesPerDep);

		      	var edgesAndName = [];

		      	for(var i = 0; i < externalEdgesPerDep.length; i++){
		      		if(externalEdgesPerDep[i].length != 0){
		      			edgesAndName.push([names[i], externalEdgesPerDep[i].length, i]);
		      		}
		      	}

		      	

		      	edgesAndName.sort(compareEdgeNum);
		      	//console.log("edgesAndName ", edgesAndName);

		      	edgesAndName.forEach(function(d,i){
		      		d3.select("#orderListDep").append("g").style("float", "left")
		      			.append("text")
		      			.style("fill", "black")
		      			.attr("id", d[2])
						.style("font-size", "10px")
						.text(d[0] + ": " + d[1] + "\n")
						.on("mouseover", function(d2){
							// console.log("d2[2 ", parseInt(d3.select(this).attr("id")) + 1);
							// console.log("circles ", circles);

							//outlineOwners(parseInt(d3.select(this).attr("id")) + 1, circles);
							var deeep = parseInt(d3.select(this).attr("id")) + 1;
							circles.attr("stroke", function(d1){
								if(d1.dep == deeep){
									//console.log(" for i ", d3.select(this).attr("id"));
									return "black";
								}else{
									return "#ccc";
								}
							})
							.attr("stroke-width", function(d1){
								if(d1.dep == deeep){
									//console.log(" for i ", d3.select(this).attr("id"));
									return 5;
								}else{
									return 1;
								}
							});
						})
						.on("mouseleave", function(d1){
							circles.attr("stroke", "#ccc")
							.attr("stroke-width", 1);
						});
		      	})
		    })

		}else if(value == "intEdges"){
			d3.json("datasets/conn_inside_dep.json")
		      .then( data => {

		      	data.forEach(function(d){



		      		var depWithSource = findDep(d.source, ownDep);
		      		//console.log("dep with source = ", depWithSource, " source ", d.source);
		      		if(depWithSource != undefined && d.color != "#eeeeee")
		  				internalEdgesPerDep[depWithSource].push([d.source, d.target]);
		      	})

		      	console.log("internalEdgesPerDep", internalEdgesPerDep);

		      	var edgesAndName = [];

		      	for(var i = 0; i < internalEdgesPerDep.length; i++){
		      		if(internalEdgesPerDep[i].length != 0){
		      			edgesAndName.push([names[i], internalEdgesPerDep[i].length, i]);
		      		}
		      	}

		      	

		      	edgesAndName.sort(compareEdgeNum);
		      	console.log("edgesAndName ", edgesAndName);

		      	edgesAndName.forEach(function(d,i){
		      		d3.select("#orderListDep").append("g").style("float", "left")
		      			.append("text")
		      			.style("fill", "black")
		      			.attr("id", d[2])
						.style("font-size", "10px")
						.text(d[0] + ": " + d[1] + "\n")
						.on("mouseover", function(d2){
							//console.log("d2[2 ", parseInt(d3.select(this).attr("id")) + 1);
							//console.log("circles ", circles);

							//outlineOwners(parseInt(d3.select(this).attr("id")) + 1, circles);
							var deeep = parseInt(d3.select(this).attr("id")) + 1;
							circles.attr("stroke", function(d1){
								if(d1.dep == deeep){
									//console.log(" for i ", d3.select(this).attr("id"));
									return "black";
								}else{
									return "#ccc";
								}
							})
							.attr("stroke-width", function(d1){
								if(d1.dep == deeep){
									//console.log(" for i ", d3.select(this).attr("id"));
									return 5;
								}else{
									return 1;
								}
							});
						})
						.on("mouseleave", function(d1){
							circles.attr("stroke", "#ccc")
							.attr("stroke-width", 1);
						});
		      	})
		    })

		}else if(value == "numNodes"){

			var edgesAndName = [];

	      	for(var i = 0; i < ownDep.length; i++){
	      		if(ownDep[i].length != 0){
	      			edgesAndName.push([names[i], ownDep[i].length, i]);
	      		}
	      	}

	      	edgesAndName.sort(compareEdgeNum);
		    //console.log("edgesAndName ", edgesAndName);

	      	edgesAndName.forEach(function(d,i){
	      		d3.select("#orderListDep").append("g").style("float", "left")
	      			.append("text")
	      			.style("fill", "black")
	      			.attr("id", d[2])
					.style("font-size", "10px")
					.text(d[0] + ": " + d[1] + "\n")
					.on("mouseover", function(d2){
						//console.log("d2[2 ", parseInt(d3.select(this).attr("id")) + 1);
						//console.log("circles ", circles);

						//outlineOwners(parseInt(d3.select(this).attr("id")) + 1, circles);
						var deeep = parseInt(d3.select(this).attr("id")) + 1;
						circles.attr("stroke", function(d1){
							if(d1.dep == deeep){
								//console.log(" for i ", d3.select(this).attr("id"));
								return "black";
							}else{
								return "#ccc";
							}
						})
						.attr("stroke-width", function(d1){
							if(d1.dep == deeep){
								//console.log(" for i ", d3.select(this).attr("id"));
								return 5;
							}else{
								return 1;
							}
						});
					})
					.on("mouseleave", function(d1){
						circles.attr("stroke", "#ccc")
						.attr("stroke-width", 1);
					});
	      	})
		}

  
    })

}//end function





function drawComparativeAnalysis(targetDep, backgroundDep, ownersPerDep, inside_connections, outside_connections, owners){
	console.log("Drawing comparative analysis for ", targetDep, " and ", backgroundDep);

	//Gets stats of dep
	d3.select("#numNodes").selectAll("text").remove();
	d3.select("#statsSummaryB").selectAll("g").selectAll("text").remove();
	d3.select("#statsSummaryA").selectAll("g").selectAll("text").remove();

	//Number of nodes
	//console.log("ownersPerDep = ", ownersPerDep)
	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Nodes: " + ownersPerDep[targetDep-1].length);

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Nodes: " + ownersPerDep[backgroundDep-1].length);

	//Number of edges
	//console.log("inside_conn = ", inside_connections)
	var edgesInPerDep = [[],[]];
	var edgesOutPerDep = [[],[]];
	var interactionsIn = [0,0];
	var interactionsOut = [0,0];

  	inside_connections.each(function(d){
		if(ownersPerDep[targetDep-1].includes(d.source) && d.color != "#eeeeee"){
			edgesInPerDep[0].push([d.source,d.target]);
			interactionsIn[0] = interactionsIn[0] + d.like + d.message + d.companion;
		}else if(ownersPerDep[backgroundDep-1].includes(d.source) && d.color != "#eeeeee"){
			edgesInPerDep[1].push([d.source,d.target]);
			interactionsIn[1] = interactionsIn[1] + d.like + d.message + d.companion;
		}
  	})
  	// console.log("edgesPerDep[targetDep-1] = ", edgesInPerDep[0].length);
  	// console.log("edgesPerDep[backgroundDep-1] = ", edgesInPerDep[1].length);
  	// console.log("interactions target = ", interactionsIn[0]);
  	// console.log("interactions background = ", interactionsIn[1]);

  	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Internal Edges: " + edgesInPerDep[0].length);

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Internal Edges: " + edgesInPerDep[1].length);

	outside_connections.each(function(d){
		if(ownersPerDep[targetDep-1].includes(d.source) && d.color != "#eeeeee"){
			edgesOutPerDep[0].push([d.source,d.tgt_dep]);
			interactionsOut[0] = interactionsOut[0] + d.like + d.message + d.companion;
		}else if(ownersPerDep[backgroundDep-1].includes(d.source) && d.color != "#eeeeee"){
			edgesOutPerDep[1].push([d.source,d.tgt_dep]);
			interactionsOut[1] = interactionsOut[1] + d.like + d.message + d.companion;
		}
  	})

  	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of External Edges: " + edgesOutPerDep[0].length);

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of External Edges: " + edgesOutPerDep[1].length);

	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Total Edges: " + (edgesOutPerDep[0].length + edgesInPerDep[0].length));

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Total Edges: " + (edgesOutPerDep[1].length + edgesInPerDep[1].length));



	//Number of interactions

	//number of women
	var genderWomenCount = [0,0];
	var genderMenCount = [0,0];

	owners.each(function(d){
		if(d.dep == targetDep && d.gender == 2){
			genderWomenCount[0] = genderWomenCount[0] + 1;
		}else if(d.dep == targetDep && d.gender == 1){
			genderMenCount[0] = genderMenCount[0] + 1;
		}else if(d.dep == backgroundDep && d.gender == 2){
			genderWomenCount[1] = genderWomenCount[1] + 1;
		}else if(d.dep == backgroundDep && d.gender == 1){
			genderMenCount[1] = genderMenCount[1] + 1;
		}
	})

	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Men: " + genderMenCount[0]);

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.text("Number of Men: " + genderMenCount[1]);

	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of Women: " + genderWomenCount[0]);

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of Women: " + genderWomenCount[1]);

	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of Internal Interactions: " + interactionsIn[0]);

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of Internal Interactions: " + interactionsIn[1]);

	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of External Interactions: " + interactionsOut[0]);

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of External Interactions: " + interactionsOut[1]);

	d3.select("#statsSummaryA").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of Total Interactions: " + (interactionsOut[0] + interactionsIn[0]));

	d3.select("#statsSummaryB").append("g")
		.append("text")
		.attr("class", "itemdetail dscrpt")
		.attr("fill", "black")
		.style("font-size", "10px")
		.style("height", "12px")
		.style("width", "400px")
		.text("Number of Total Interactions: " + (interactionsOut[1] + interactionsIn[1]));



	//Get most important feature
	d3.json("datasets/network_representations.json")
	.then( data => {
		//console.log("net -rep ", data[0].feature);

		//find index for array targt and background combo


		d3.select("#mostImportantFeature").selectAll("g").selectAll("text").remove();

		d3.select("#mostImportantFeature").append("g").attr("transform", "translate(10,0)")
			.append("text")
			.attr("class", "mostImportantFeature")
			.attr("fill", "black")
			.style("font-size", "14px")
			.attr("x", 100)
			.text(data[0].feature); //change data[0]
	})


	//Draw projection and gradient

	d3.json("datasets/network_representations.json")
	.then( data => {
		//console.log("net -rep ", data[0].feature);

		//find index of dep pair

		//Get min and max of scalex and scale y
		var minX = 200;
		var maxX = -200;
		var minY = 200;
		var maxY = -200;
		var minFeature = 200;
		var maxFeature = -200;
		var numNodesCount = 0;
		var arrData = [];

		data[0].coords.forEach(function(d){
			//console.log("id ", d.id , " type ", d.type);
			numNodesCount++;
			
			if(d.x != null && d.y != null){
				if(d.x< minX){
					minX = d.x
				}

				if(d.x > maxX){
					maxX = d.x
				}

				if(d.y < minY){
					minY = d.y
				}

				if(d.y > maxY){
					maxY = d.y;
				}

				if(d.feature_value < minFeature){
					minFeature = d.feature_value;
				}

				if(d.feature_value > maxFeature){
					maxFeature = d.feature_value;
				}
			}
		})

		// console.log(" y ", minY , ", ", maxY);
		// console.log(" x ", minX , ", ", maxX);

		//Draw color gradient
		d3.select("#colorLegendCompare").selectAll("svg").remove();
		var colorData = [{"color":"yellow", "value": minFeature}, {"color":"purple", "value":maxFeature}];
		//{"color":"white", "value":((minFeature + maxFeature)/2)}

		var xColorScale = d3.scaleLinear()
		.range([0,160])
		.domain([minFeature,maxFeature]);

		var xTicks = [minFeature, maxFeature];

		//console.log("xTicks ", xTicks);

		var xAxis = d3.axisBottom(xColorScale)
        .tickSize(8 * 2)
        .tickValues(xTicks);

		var svg = d3.select("#colorLegendCompare").append("svg");

		var colorScale = d3.scaleLinear()
			.range(["yellow", "purple"])
			.domain([minFeature, maxFeature]);

		var colorBar = svg.append('g').attr("width", 200).attr("height", 10).attr("transform", "translate(10,0)");
		var defs = svg.append("defs");
		var linearGrad = defs.append("linearGradient").attr("id", "myGradient");

		linearGrad.selectAll("stop")
			.data(colorData)
			.enter().append("stop")
			  .attr("offset", d => ((d.value - minFeature) / (maxFeature - minFeature) * 100) + "%")
	          .attr("stop-color", d => d.color);

	    colorBar.append("rect")
	        .attr("width", 160)
	        .attr("height", 8)
	        .attr("stroke", "black")
	        .attr("stroke-wdith", 1)
	        .style("fill", "url(#myGradient)");

	    colorBar.append("g")
	        .call(xAxis)
	      .select(".domain").remove();

	    var featureTextColor = svg.append('g').attr("width", 200).attr("height", 10).attr("transform", "translate(10,50)")

	    featureTextColor.append("text")
			.attr("fill", "black")
			.style("font-size", "14px")
			.attr("x", 15)
			.text("Most Important Feature");


		//Projection Space
		//console.log("numNodesCount ", numNodesCount);
		var xScale = d3.scaleLinear()
		.range([0,280])
		.domain([minX, maxX]);

		var yScale = d3.scaleLinear()
		.range([280,0])
		.domain([minY, maxY]);


		var zoom = d3.zoom()
		    .scaleExtent([1, 60])
		    .extent([[0, 0], [280, 280]])
		    .on("zoom", zoomed);

		d3.select("#projectionSpace").selectAll("svg").remove();

		var svgProj = d3.select("#projectionSpace").call(zoom).append("svg");

	    var points_g = svgProj.append("g").attr("transform", "translate(10,10)");
		
		var points = points_g.selectAll("circle")
			.data(data[0].coords);
		
		points = points.enter()
			.append("circle")
				.attr("cx", function(d){
					return xScale(d.x);
				})
				.attr("cy", function(d){
					return yScale(d.y);
				})
				.attr("r", 4)
				.style("fill", function(d){
					return colorScale(d.feature_value);
				})
				.style("stroke", function(d){
					if(d.type == "target"){
						return "black";
					}else{
						return "#ccc";
					}
				});

		function zoomed() {
		// create new scale ojects based on event
			//console.log("soooooooming");
		    var new_xScale = d3.event.transform.rescaleX(xScale);
		    var new_yScale = d3.event.transform.rescaleY(yScale);
		// update axes
		    // gX.call(xAxis.scale(new_xScale));
		    // gY.call(yAxis.scale(new_yScale));
		    points.data(data[0].coords)
		     .attr('cx', function(d) {return new_xScale(d.x)})
		     .attr('cy', function(d) {return new_yScale(d.y)});
		}

	})

}