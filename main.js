(function () {

  d3.select('#clusterRing').append('g').attr('id', 'resetArea')
    .append('circle')
    .attr('cx', 322)
    .attr('cy', 315)
    .attr('r', 200)
    .attr('fill', 'white')
    //.attr('stroke', 'black')

  d3.select('#clusterRing').append('g')
    .attr('id', 'connections')

  d3.select('#clusterRing').append('g')
    .attr('id', 'owners')

  d3.select('#clusterRing').append('g')
    .attr('id', 'labels')
    //.attr('transform', 'scale(.18.18)')

  var owners = d3.select('#owners');
  const t = owners.transition().duration(750);
  const t2 = d3.select('#connections').transition().duration(750);
  const t3 = d3.select('#edgeInformation').transition().duration(750);

  var toggle = document.getElementById("toggle");

  drawEdge();

  toggle.onclick = function() {
    if (toggle.checked) {
      d3.select("#connections").selectAll('path')
      .remove();
    owners.selectAll("circle")
      .attr("fill", d=> { return d.color})
    }
    else {
      d3.select("#connections").selectAll('path')
      .remove();
       owners.selectAll("circle")
        .attr("cx", d => {return d.pos.x;})
        .attr("cy", d => {return d.pos.y;})
        .attr("r", 10);
      drawEdge();
    }
  };

  function drawEdge() {
    d3.json("datasets/department_data.json")
    .then( data => {

        function draw(path, start_point_x, start_point_y, mid_point_x, mid_point_y, end_point_x, end_point_y) {
          path.moveTo(start_point_x, start_point_y); // move current point to ⟨10,10⟩
          //path.lineTo(100, 10); // draw straight line to ⟨100,10⟩
          path.quadraticCurveTo(mid_point_x, mid_point_y, end_point_x, end_point_y); // draw an arc, the turtle ends up at ⟨194.4,108.5⟩
          return path; // not mandatory, but will make it easier to chain operations
        }

        d3.select('#connections').selectAll('path')
          .data(data)
          .enter()
          .append('path')
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
       .attr("cx", function(d) { return d.pos.x})
       .attr("cy", function(d) { return d.pos.y})
       .attr("r", function(d) { return 10})
       .attr("fill", function(d) { return d.color})
       .attr("stroke", "#ccc")
       .attr("stroke-width", 1)
       .on("click", clicked);

    function clicked(p) {

        var selectedDep = [];
        for (i=0; i<71; i++)
          selectedDep.push(0);

        if (!toggle.checked)
        {
            var likeNum = 0;
            var msgNum = 0;
            var cmpnNum = 0;
            var likeAct = 0;
            var msgAct = 0;
            var cmpnAct = 0;

            var remainingEdge = 0;

            if ( this.getAttribute("fill")!= "#eee" && this.getAttribute("fill")!="rgb(238, 238, 238)")
            {
                d3.select('#connections').selectAll('path')
                .transition(t2)
                .attr("stroke", function(d) {
                  if ((d.source == p.dep || d.target == p.dep) && this.getAttribute("stroke")!="rgb(238, 238, 238)" && this.getAttribute("stroke")!="#eee")
                  {
                    remainingEdge = remainingEdge+1;
                    selectedDep[d.source-1] = 1;
                    selectedDep[d.target-1] = 1;
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
                  else
                  {
                    return "#eee";
                  }
              })
            }
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

            if (remainingEdge == 1)
            {
                d3.select('#likeCount')
                .transition(t3)
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

        else {

          d3.select('#connections').selectAll('path')
              .remove();
          if ( this.getAttribute("cx")!= p.pos.x || this.getAttribute("cy")!= p.pos.y)
          {
            d3.json("datasets/conn_inside_dep.json")
            .then( data => {

                function draw(path, start_point_x, start_point_y, end_point_x, end_point_y) {
                  path.moveTo(start_point_x, start_point_y);
                  path.lineTo(end_point_x, end_point_y); 
                  return path; 
                }

                var connections = d3.select('#connections');
                for (var i=0; i<data.length; i++)
                {
                  if (data[i].source == p.id || data[i].target == p.id)
                  {
                    console.log(data[i].source, data[i].target, p.id);
                    console.log(p.spreading_pos.x, p.spreading_pos.y);
                    console.log(data[i].start_pos.x, data[i].start_pos.y);
                    console.log(data[i].end_pos.x, data[i].end_pos.y);
                    connections.append('path')
                    .attr('d', draw( d3.path(), 4*data[i].start_pos.x+395, 4*data[i].start_pos.y+340, 4*data[i].end_pos.x+395, 4*data[i].end_pos.y+340) )
                    .attr('fill', 'none')
                    .attr('stroke', data[i].color );
                  }
                  
                }

              });

            d3.json("datasets/conn_outside_dep.json")
            .then( data => {

                function draw(path, start_point_x, start_point_y, end_point_x, end_point_y) {
                  path.moveTo(start_point_x, start_point_y);
                  path.lineTo(end_point_x, end_point_y); 
                  return path; 
                }

                var connections = d3.select('#connections');
                for (var i=0; i<data.length; i++)
                {
                  if (data[i].source == p.id)
                  {
                    connections.append('path')
                    .attr('d', draw( d3.path(), 4*data[i].start_pos.x+395, 4*data[i].start_pos.y+340, data[i].end_pos.x, data[i].end_pos.y) )
                    .attr('fill', 'none')
                    .attr('stroke', data[i].color );
                  }
                  
                }

              });
          }
          else
          {

            circles.transition(t)
            .attr("cx", d => {
              if (d.dep == p.dep) 
                return 4*d.spreading_pos.x+400;
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
          }
          
          d3.select('#resetArea')
            .on("click", function() {

              circles.transition(t)
              .attr("cx", d => {return d.pos.x;})
              .attr("cy", d => {return d.pos.y;})
              .attr("r", 10);

              d3.select('#connections').selectAll('path')
              .remove();

            });

        }

        
      }

  });

  d3.json("datasets/department_label.json")
  .then( labels => {

      function draw(path, start_point_x, start_point_y, end_point_x, end_point_y) {
        path.moveTo(start_point_x, start_point_y); // move current point to ⟨10,10⟩
        path.lineTo(end_point_x, end_point_y); // draw straight line to ⟨100,10⟩
        return path; // not mandatory, but will make it easier to chain operations
      }

      for (var i=0; i<labels.length; i++)
      {
        if (labels[i].no>=15 && labels[i].no<=53)
        {
          d3.select('defs').append('path')
          .attr('d', draw( d3.path(), labels[i].start_pos.x, labels[i].start_pos.y, labels[i].end_pos.x, labels[i].end_pos.y) )
          .attr('id', 'dep'+labels[i].no.toString()+'-'+labels[i].step.toString())
        }
        else
        {
          d3.select('defs').append('path')
          .attr('d', draw( d3.path(), labels[i].end_pos.x, labels[i].end_pos.y, labels[i].start_pos.x, labels[i].start_pos.y) )
          .attr('id', 'dep'+labels[i].no.toString()+'-'+labels[i].step.toString())
        }

        d3.select('#labels').append('text')
        .attr("font-family", "sans-serif")
        .attr("font-size", "30px")
        .attr("fill", "black")
        .append('textPath')
        .attr('xlink:href', '#dep'+labels[i].no.toString()+'-'+labels[i].step.toString())
        //.attr("x", labels[i].start_pos.x)
        //.attr("y", labels[i].start_pos.y)
        .text(labels[i].name)
        
        continue;

      }
  })

})()