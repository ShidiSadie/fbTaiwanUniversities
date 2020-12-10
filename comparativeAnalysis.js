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


function listing(outside_connections, names){
	var externalEdgesPerDep = new Array();
	  for(var i = 0; i < 71; i++){
	    var temp = [];
	    externalEdgesPerDep.push(temp);
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



      	d3.json("datasets/conn_outside_dep.json")
	      .then( data => {

	      	data.forEach(function(d){
	      		var depWithSource = findDep(d.source, ownDep);
	      		//console.log("dep with source = ", depWithSource, " source ", d.source);
	      		if(depWithSource != undefined)
	  				externalEdgesPerDep[depWithSource].push([d.source, d.tgt_dep]);
	      	})

	      	console.log("externalEdgesPerDep", externalEdgesPerDep);

	      	var edgesAndName = [];

	      	for(var i = 0; i < externalEdgesPerDep.length; i++){
	      		if(externalEdgesPerDep[i].length != 0){
	      			edgesAndName.push([names[i], externalEdgesPerDep[i].length, i]);
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
					.text(d[0] + ":" + d[1] + "\n")
					.on("mouseover", function(d){
						d3.select(this).style("fill", "red");
					})
					.on("mouseleave", function(d){
						d3.select(this).style("fill", "black");
					});

	      	})

	   //    	d3.select("#orderListDep").append("g")
	   //    	.data(edgesAndName)
	   //    	.enter()
	   //    	.append("text")
		  //     	.attr("fill", "black")
				// .style("font-size", "10px")
				// .text(function(d){
				// 	return d[0] + ":" + d[1];
				// });







	      })
      })










  // outside_connections.each(function(d){
  // 	var depWithSource = findDep(d.source);
 	//  console.log("dep with source = ", depWithSource);
  // 	externalEdgesPerDep[depWithSource].push([d.source, d.tgt_dep]);
  // })

  
  
}





function drawComparativeAnalysis(targetDep, backgroundDep, ownersPerDep, inside_connections, outside_connections, owners){
	console.log("Drawing comparative analysis for ", targetDep, " and ", backgroundDep);

	//Gets stats of dep
	d3.select("#numNodes").selectAll("text").remove();
	d3.select("#statsSummaryB").selectAll("g").selectAll("text").remove();
	d3.select("#statsSummaryA").selectAll("g").selectAll("text").remove();

	//Number of nodes
	console.log("ownersPerDep = ", ownersPerDep)
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
	console.log("inside_conn = ", inside_connections)
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
  	console.log("edgesPerDep[targetDep-1] = ", edgesInPerDep[0].length);
  	console.log("edgesPerDep[backgroundDep-1] = ", edgesInPerDep[1].length);
  	console.log("interactions target = ", interactionsIn[0]);
  	console.log("interactions background = ", interactionsIn[1]);

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


	//number of men





	//Get most important feature
	d3.json("datasets/network_representations.json")
	.then( data => {
		console.log("net -rep ", data[0].feature);

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
	



	//Draw color gradient
	d3.select("#colorLegendCompare").selectAll("svg").remove();
	var colorData = [{"color":"yellow", "value":0}, {"color":"white", "value":5}, {"color":"purple", "value":10}];

	var xColorScale = d3.scaleLinear()
	.range([0,160])
	.domain([0,10]);

	var svg = d3.select("#colorLegendCompare").append("svg");

	var colorBar = svg.append('g').attr("width", 200).attr("height", 10).attr("transform", "translate(10,0)");
	var defs = svg.append("defs");
	var linearGrad = defs.append("linearGradient").attr("id", "myGradient");

	linearGrad.selectAll("stop")
		.data(colorData)
		.enter().append("stop")
		  .attr("offset", d => ((d.value - 0) / (10 - 0) * 100) + "%")
          .attr("stop-color", d => d.color);

    colorBar.append("rect")
        .attr("width", 160)
        .attr("height", 8)
        .attr("stroke", "black")
        .attr("stroke-wdith", 1)
        .style("fill", "url(#myGradient)");

	//Draw projection
		


}