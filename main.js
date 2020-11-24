(function () {

  //The blanck area to reset edges and node color
  d3.select('#clusterRing').append('g').attr('id', 'resetArea')
    .append('circle')
    .attr('cx', 322)
    .attr('cy', 315)
    .attr('r', 200)
    .attr('fill', 'white')
    //.attr('stroke', 'black')

  //The container that includes edges inside a department (in the dive-in mode)
  d3.select('#clusterRing').append('g')
    .attr('id', 'inside_dep_connections')
  //The container that includes edges between a department and an individual (in the dive-in mode)
  d3.select('#clusterRing').append('g')
    .attr('id', 'outside_dep_connections')

  //The container that includes edges between departments (not dive-in mode)
  d3.select('#clusterRing').append('g')
    .attr('id', 'connections')

  //The container that includes individual nodes
  d3.select('#clusterRing').append('g')
    .attr('id', 'owners')
  //The container that includes department names
  d3.select('#clusterRing').append('g')
    .attr('id', 'labels')
    //.attr('transform', 'scale(.18.18)')

  var owners = d3.select('#owners');
  //The transitions for corresponding containers
  const t = owners.transition().duration(750);
  const t2 = d3.select('#connections').transition().duration(750);
  const t3 = d3.select('#edgeInformation').transition().duration(750);
  const t4 = d3.select('#inside_dep_connections').transition().duration(750);
  const t5 = d3.select('#outside_dep_connections').transition().duration(750);

  //The toggle to turn the dive-in mode on and off
  var toggle = document.getElementById("toggle");

  //Draw edges between departments after webpage loaded
  drawEdge();

  toggle.onclick = function() {
    //if the dive-in mode is on
    if (toggle.checked) {
      //clear all the edges between departments
      d3.select("#connections").selectAll('path')
      .remove();
      //return the orginal color of nodes
      owners.selectAll("circle")
        .attr("fill", d => {return d.color});
      //The function to draw edges in path
      function draw(path, start_point_x, start_point_y, end_point_x, end_point_y) {
        path.moveTo(start_point_x, start_point_y);
        path.lineTo(end_point_x, end_point_y); 
        return path; 
      }

      //edges for dive-in mode are all drawn once the mode is on, but the opacity is all set to 0. 
      //The opacity will change according to the interaction actions
      //load individual-individual edge information from conn_inside_dep.json
      d3.json("datasets/conn_inside_dep.json")
      .then( data => {
        console.log(data);
          d3.select('#inside_dep_connections').selectAll("path")
            .data(data)
            .enter()
            .append("path")
            //Coordinar cambios (enlarge and pan)
            .attr('d', function(d) { return draw( d3.path(), 4*d.start_pos.x+395, 4*d.start_pos.y+340, 4*d.end_pos.x+395, 4*d.end_pos.y+340); } )
            .attr('fill', 'none')
            .attr('opacity', 0)
            .attr('stroke', function(d) { return d.color; });
        });

      //load individual-department edge information from conn_outside_dep.json
      d3.json("datasets/conn_outside_dep.json")
      .then( data => {
          console.log(data);
          d3.select('#outside_dep_connections').selectAll("path")
            .data(data)
            .enter()
            .append("path")
            //Coordinar cambios (the coordinate of department is already good)
            .attr('d', function(d) { return draw( d3.path(), 4*d.start_pos.x+395, 4*d.start_pos.y+340, d.end_pos.x, d.end_pos.y); } )
            .attr('fill', 'none')
            .attr('opacity', 0)
            .attr('stroke', function(d) { return d.color; });

        });
    }
    //if the dive-in mode is off
    else {
      //clear all the dive-in mode edges
      d3.select("#inside_dep_connections").selectAll('path')
      .remove();
      d3.select("#outside_dep_connections").selectAll('path')
      .remove();
      //recover circles position and color
       owners.selectAll("circle")
        .attr("cx", d => {return d.pos.x;})
        .attr("cy", d => {return d.pos.y;})
        .attr("r", 10)
        .attr("fill", d => {return d.color});
      //draw edges between departments
      drawEdge();
    }
  };

  //The function to draw barchart (*Act is the actual number of interaction, *Num is calculated by a log scale of *Act)
  function drawHistogram(likeNum, likeAct, msgNum, msgAct, cmpnNum, cmpnAct)
  {
    //LikeCount is the text element indicating the number of like interactions
    d3.select('#likeCount')
    .transition(t3)
    //Get the coordinates of likeCount text coordinate from the number of like interactions
    .attr("y", likeNum*30+45)
    .text(likeAct);

    d3.select('#messageCount')
    .transition(t3)
    .attr("y", msgNum*30+45)
    .text(msgAct);

    d3.select('#companionCount')
    .transition(t3)
    .attr("y", cmpnNum*30+45)
    .text(cmpnAct);

    d3.select('#likeBar')
    .transition(t3)
    .attr("height", likeNum*30);
    
    d3.select('#messageBar')
    .transition(t3)
    .attr("height", msgNum*30);
    
    d3.select('#companionBar')
    .transition(t3)
    .attr("height", cmpnNum*30);
  }

  function drawEdge() {
    d3.json("datasets/department_data.json")
    .then( data => {
        //The function to curve edges
        function draw(path, start_point_x, start_point_y, mid_point_x, mid_point_y, end_point_x, end_point_y) {
          path.moveTo(start_point_x, start_point_y);
          path.quadraticCurveTo(mid_point_x, mid_point_y, end_point_x, end_point_y);
          return path;
        }

        d3.select('#connections').selectAll('path')
          .data(data)
          .enter()
          .append('path')
          //department coordinate is already converted in css
          .attr('d', function(d) { return draw( d3.path(), d.start_point.x, d.start_point.y, d.mid_point.x, d.mid_point.y, d.end_point.x, d.end_point.y); } )
          .attr('fill', 'none')
          .attr('stroke', function(d) { return d.color; });
      });
  }
	
  d3.json("datasets/Owners.json")
  .then( nodes => {

    var circles = owners.selectAll("circle")
       .data(nodes)
       .enter()
       .append("circle")
       //individual coordinates to form the department cluster ring
       .attr("cx", function(d) { return d.pos.x})
       .attr("cy", function(d) { return d.pos.y})
       .attr("r", function(d) { return 10})
       .attr("fill", function(d) { return d.color})
       .attr("stroke", "#ccc")
       .attr("stroke-width", 1)
       .on("click", clicked);

    //Key function to implement interaction response in terms of different situations
    function clicked(p) {
        //if not in the dive-in mode
        if (!toggle.checked)
        {
            //mark which department should be highlighted
            var selectedDep = [];
            for (i=0; i<71; i++)
              selectedDep.push(0);

            var likeNum = 0;
            var msgNum = 0;
            var cmpnNum = 0;
            var likeAct = 0;
            var msgAct = 0;
            var cmpnAct = 0;

            var remainingEdge = 0;

            //if the clicked circle is not gray (already highlighted)
            //There are two situations the cirlce is colored:
            //1. The original state when no cluter is selected
            //2. When you already selected a department and then this time you select another one connected to it
            if ( this.getAttribute("fill")!= "#eee" && this.getAttribute("fill")!="rgb(238, 238, 238)")
            {
                d3.select('#connections').selectAll('path')
                .transition(t2)
                .attr("stroke", function(d) {
                  //The edge will be counted if they are not gray
                  if ((d.source == p.dep || d.target == p.dep) && this.getAttribute("stroke")!="rgb(238, 238, 238)" && this.getAttribute("stroke")!="#eee")
                  {
                    console.log(p.dep);
                    remainingEdge = remainingEdge+1;
                    //Record the departments that should be highlighted. 
                    //The department No. is from 1-71, so here we need to minus it with 1 to store in a bucket.
                    selectedDep[d.source-1] = 1;
                    selectedDep[d.target-1] = 1;
                    //Count *Act and their log scale *Num. They are only useful when remainingEdge is 1
                    likeAct = d.like_count;
                    msgAct = d.message_count;
                    cmpnAct = d.companion_count;
                    if (d.like_count>0)
                    {
                      likeNum = Math.log(d.like_count)
                    }
                    else
                    {
                      likeNum = 0
                    }

                    if (d.message_count>0)
                    {
                      msgNum = Math.log(d.message_count)
                    }
                    else
                    {
                      msgNum = 0
                    }

                    if (d.companion_count>0)
                    {
                      cmpnNum = Math.log(d.companion_count)
                    }
                    else
                    {
                      cmpnNum = 0
                    }

                    return d.color;
                  }
                  //if the edge is not related to the selected department or was originally gray, it should be gray.
                  else
                  {
                    return "#eee";
                  }
              })
            }
            //if the clicked circle is gray, we should change the visualization to highlight it and its connected departments
            else
            {
                d3.select('#connections').selectAll('path')
                .transition(t2)
                .attr("stroke", d => { 
                  if (d.source == p.dep || d.target == p.dep)
                  {
                    selectedDep[d.source-1] = 1;
                    selectedDep[d.target-1] = 1;
                    return d.color;
                  }
                  else
                  {
                    return "#eee";
                  }
              })
            }

            //debug
            //console.log(selectedDep);

            //for both of the two cases, we just need to fill the node color with selectedDep
            circles.transition(t).
            attr("fill", d => { 
              if (selectedDep[d.dep-1])
              {
                return d.color;
              }
              else
              {
                return "#eee";
              }
              
            })

            //if only one edge is left, we'll render the barchart
            if (remainingEdge == 1)
            {
                drawHistogram(likeNum, likeAct, msgNum, msgAct, cmpnNum, cmpnAct)
            }

            //clicking on reset area will reset all the node color and edge color to orgianl state
            d3.select('#resetArea')
            .on("click", function() {
              circles
              .transition(t)
              .attr('fill', d=>{ return d.color});

              d3.select('#connections').selectAll('path')
                .transition(t2)
                .attr("stroke", d=> { return d.color});
            });
        }

        //when we are in the dive-in mode
        else {
          //we mainly use this function to get the opacity of edges
          function getStyle(element, attr) {
            if(element.currentStyle) {
                    return element.currentStyle[attr];
            } else {
                    return getComputedStyle(element, false)[attr];
            }
          }

          var insideConns = d3.select('#inside_dep_connections').selectAll('path');
          var outsideConns = d3.select('#outside_dep_connections').selectAll('path');
          var remainingEdge = 0;
          //record the final source and target
          var onlySource;
          var onlyTarget;
          var likeNum = 0;
          var msgNum = 0;
          var cmpnNum = 0;
          var likeAct = 0;
          var msgAct = 0;
          var cmpnAct = 0;

          //if the circle is already on the spreaded space
          if ( this.getAttribute("cx")!= p.pos.x || this.getAttribute("cy")!= p.pos.y)
          {
            insideConns.style('opacity', function(d) {
              //if the edge is connected to a previously selected node
              if (getStyle(this, 'opacity')>0)
              {
                if (d.source == p.id || d.target == p.id)
                {
                  remainingEdge = remainingEdge+1;
                  onlySource = d.source;
                  onlyTarget = d.target;
                }
                return 0.5
              }
              else
              {
                return 0;
              }
            })

            if (remainingEdge == 1)
            {
              insideConns.style('opacity', function(d) {
                if (d.source == onlySource && d.target == onlyTarget) 
                {
                  likeAct = d.like;
                  msgAct = d.message;
                  cmpnAct = d.companion;
                  return 1;
                }
                else return getStyle(this, 'opacity');
              });

              circles.attr("fill", d=> {
                if (d.id == onlySource || d.id == onlyTarget) return d.color;
                else return "#eee";
              });

              if (likeAct>0)
              {
                likeNum = Math.log(likeAct)
              }
              else
              {
                likeNum = 0
              }

              if (msgAct>0)
              {
                msgNum = Math.log(msgAct)
              }
              else
              {
                msgNum = 0
              }

              if (cmpnAct>0)
              {
                cmpnNum = Math.log(cmpnAct)
              }
              else
              {
                cmpnNum = 0
              }

              drawHistogram(likeNum, likeAct, msgNum, msgAct, cmpnNum, cmpnAct);

              //clear all the outside connections
              outsideConns.style('opacity', 0);
            }

            //if the remainingEdge is not only one, we'll highlight all the individuals and departments connected with this selected individual
            else
            {
              //same way to record the individuals and departments that should be highlighted
              var ownerRecord = new Array();
              var depRecord = new Array();

              insideConns.style('opacity', d=>{
                if (d.source == p.id || d.target == p.id) 
                {
                  ownerRecord[d.source] = 1;
                  ownerRecord[d.target] = 1;
                  return 1;
                }
                else return 0;
              });

              outsideConns.style('opacity', d=>{
                if (d.source == p.id) {
                  depRecord[d.tgt_dep] = 1;
                  return 1;
                }
                else return 0;
              });

              circles.attr("fill", d=> {
                if (ownerRecord[d.id] || depRecord[d.dep]) return d.color;
                else return "#eee";
              });
            }

          }

          //if we selected a department and it is highlighted
          else
          {
            //count all the connections that are highlighted and connected to the selected department
            outsideConns.style('opacity', function(d) {
              if (d.tgt_dep == p.dep && getStyle(this, 'opacity')>0)
              {
                remainingEdge = remainingEdge+1;
                onlySource = d.source;
                onlyTarget = d.tgt_dep;
              }
            });
            if (remainingEdge == 1)
            {
              outsideConns.style('opacity', function(d) {
                if (d.source == onlySource && d.tgt_dep == onlyTarget) 
                {
                  likeAct = d.like;
                  msgAct = d.message;
                  cmpnAct = d.companion;
                  return 1;
                }
                else return 0;
              });

              circles.attr("fill", d=> {
                if (d.id == onlySource || d.dep == onlyTarget) return d.color;
                else return "#eee";
              });

              if (likeAct>0)
              {
                likeNum = Math.log(likeAct)
              }
              else
              {
                likeNum = 0
              }

              if (msgAct>0)
              {
                msgNum = Math.log(msgAct)
              }
              else
              {
                msgNum = 0
              }

              if (cmpnAct>0)
              {
                cmpnNum = Math.log(cmpnAct)
              }
              else
              {
                cmpnNum = 0
              }

              drawHistogram(likeNum, likeAct, msgNum, msgAct, cmpnNum, cmpnAct);

              insideConns.style('opacity', 0);
            }
            //if not only one edge is left, then we need to spread that cluster
            else 
            {
              var idRecord = new Array();
              circles.transition(t)
              .attr("cx", d => {
                if (d.dep == p.dep) 
                {
                  idRecord[d.id] = 1;
                  return 4*d.spreading_pos.x+400;
                }
                else
                  return d.pos.x;
              })
              .attr("cy", d => { 
                if (d.dep == p.dep) 
                  return 4*d.spreading_pos.y+350;
                else
                  return d.pos.y;
              })
              .attr("r", d=> { 
                if (d.dep == p.dep) 
                  return d.size;
                else
                  return 10;
              })
              .attr("fill", d => {
                  return d.color;
              });

              insideConns.style("opacity", d=> {
                if (idRecord[d.source] || idRecord[d.target])
                  return 1;
                else
                  return 0; });

              outsideConns.style("opacity", 0);
            }
            
          }
          
          d3.select('#resetArea')
            .on("click", function() {

              //reset all circles position to the ring and reset the color
              circles.transition(t)
              .attr("cx", d => {return d.pos.x;})
              .attr("cy", d => {return d.pos.y;})
              .attr("r", 10)
              .attr("fill", d => {
                  return d.color;
              });

              //"delete" all dive-in mode edges
              insideConns.style("opacity", 0);

              outsideConns.style("opacity", 0);

            });

        }

        
      }

  });

  d3.json("datasets/department_label.json")
  .then( labels => {

      //function to draw department name trajectory
      function draw(path, start_point_x, start_point_y, end_point_x, end_point_y) {
        path.moveTo(start_point_x, start_point_y);
        path.lineTo(end_point_x, end_point_y);
        return path;
      }

      for (var i=0; i<labels.length; i++)
      {
        if (labels[i].no>=15 && labels[i].no<=53)
        {
          d3.select('defs').append('path')
          //Names of department no.15-53 should be drawn from the outside to the inside
          .attr('d', draw( d3.path(), labels[i].start_pos.x, labels[i].start_pos.y, labels[i].end_pos.x, labels[i].end_pos.y) )
          //.no is the department No. and step is the section piece of this department name, with these two part, we can set unique id
          .attr('id', 'dep'+labels[i].no.toString()+'-'+labels[i].step.toString())
        }
        else
        {
          d3.select('defs').append('path')
          //other department names should be drawn from the inside to the outside, to maintain reading from left to right
          .attr('d', draw( d3.path(), labels[i].end_pos.x, labels[i].end_pos.y, labels[i].start_pos.x, labels[i].start_pos.y) )
          .attr('id', 'dep'+labels[i].no.toString()+'-'+labels[i].step.toString())
        }

        d3.select('#labels').append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", "30px")
        .attr("fill", "black")
        .append('textPath')
        .attr('xlink:href', '#dep'+labels[i].no.toString()+'-'+labels[i].step.toString())
        //labels[i].name is the content of the full name of a section of the name
        .text(labels[i].name)
        
        continue;

      }
  })

})()