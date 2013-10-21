d3.politicos = function(containerId,width,partidoDetalle) {

  //Init vars
  var chart,
      partido_height = 55,
      partido_guia_height = 50,
      height,
      svgNS = "http://www.w3.org/2000/svg",

      x,
      xAxis,
      xAxis2,
      xAxis2Orig,
      gxAxis,
      gxAxis2,
      gAxisLines,
      
      y,
      yAxis,
      yData,
      gyAxis,
      gyHover,
      
      left_width = 150,
      padding_top = 45,
      padding_top_axis = 30,
      padding_bottom = 12,
      padding_right = 0,
      rawData,
      referenceData,
      circlesData,
      exclamationsData,
      partidoDetalleData = d3.nest()
        .key(function(d) { return d.id_partido; })
        .map(partidoDetalle, d3.map),

      guias,
      puntos,
      puntosContainer,
      partidos,
      partidos_items,
      partidosHover,
      puntosObj,
      lines,
      lineasContainer,
      exclamations,
      exclamationContainer,
      referencesGrid,
      referenceBottomLineH,
      referenceBottomLineV,
      referenceLabelTop,
      referenceLabelBottom;
  
  function init(){
    _createChart();
    _setScales();
    _createGuias();
    _createAxis();
    _createHover();
    _createPuntos();
    //_createExclamations();
  }

  function _setScales(){

    if(!x){
      //Scales
      x = d3.scale.ordinal()
         .domain(d3.range(2000, 2015))
         .rangePoints([0, width-left_width-padding_right]);

    }


    y = d3.scale.ordinal()
       .domain(yData)
       .rangePoints([padding_top, (partido_height * yData.length)]);

  }

  function _createChart(){

    if(!chart){
      //create svg
      chart = d3.select('#'+containerId)
        .append('svg')
        .attr('width', width)
        .attr('class', 'graph');
    }

    chart.transition().attr('height', padding_top + (partido_height * yData.length) + padding_top_axis + padding_bottom + partido_guia_height);

  }

  function _createAxis(){

    if(!gxAxis){

      var anios = [2001,2003, 2005, 2007, 2009, 2011, 2013];

      xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickValues(anios)
        .tickSize(6)
        .tickPadding(5);

      gxAxis = chart.append('g')
          .attr('class', 'x axis')
          .call(xAxis);

      xAxis2Orig = d3.svg.axis()
        .scale(x)
        .orient('top')
        .tickValues(anios);
      
      xAxis2 = xAxis2Orig
        .tickSize(6)
        .tickPadding(5);

      gxAxis2 = chart.append('g')
          .attr('class', 'x axis2')
          .call(xAxis2)
          .attr('transform', 'translate('+left_width+','+padding_top_axis+')');

      yAxisOrig = d3.svg.axis()
        .orient('left');

      yAxis = d3.svg.axis()
        .orient('left')
        .tickSize(5)
        .tickPadding(3);

      gyAxis = chart.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate('+left_width+','+padding_top+')');

      gxAxisLines = chart.append("g")         
          .attr("class", "grid")
          .attr('transform', 'translate('+left_width+', '+padding_top_axis+')');

      gyAxisLines = chart.append("g")         
          .attr("class", "grid")
          .attr('transform', 'translate('+left_width+', '+padding_top+')');

      referencesGrid = chart.append("g")         
          .attr("class", "grid");

      referenceLabelTop = chart.append("g")         
          .attr("class", "reference-container");

      referenceLabelBottom = chart.append("g")         
          .attr("class", "reference-container");

      referencesGrid.append("line")
          .attr("x1", 0)
          .attr("y1", padding_top_axis)
          .attr("x2", left_width)
          .attr("y2", padding_top_axis);

      referencesGrid.append("line")
          .attr("x1", left_width)
          .attr("y1", 0)
          .attr("x2", left_width)
          .attr("y2", padding_top_axis);

      referencesGrid.append("svg:image")
          .attr("xlink:href", BUILD+"img/lArrow.png")
          .attr("x", 90)
          .attr("y", 10)
          .attr("width", 8)
          .attr("height", 14);

      referencesGrid.append("svg:image")
          .attr("xlink:href", BUILD+"img/dArrow.png")
          .attr("x", 80)
          .attr("y", 42)
          .attr("width", 14)
          .attr("height", 12);
    
      referenceBottomLineH = referencesGrid.append("line")
          .attr("x1", 0)
          .attr("x2", left_width);

      referenceBottomLineV = referencesGrid.append("line")
          .attr("x1", left_width)
          .attr("x2", left_width);

      referenceLabelTop.append("text")
          .attr("x", 7)
          .attr("y", 0 + 22)
          .text( "ELECCIONES" )
          .attr("class", "label-reference");

      referenceLabelTop.append("text")
          .attr("x", 7)
          .attr("y", padding_top_axis + 24)
          .text( "PARTIDOS" )
          .attr("class", "label-reference");

      referenceLabelBottom.append("text")
          .attr("x", 7)
          .attr("y", 0 + 22)
          .text( "ELECCIONES" )
          .attr("class", "label-reference");

      referenceLabelBottom.append("svg:image")
          .attr("xlink:href", BUILD+"img/lArrow.png")
          .attr("x", 90)
          .attr("y", 10)
          .attr("width", 8)
          .attr("height", 14);

    }

    referenceLabelBottom.transition()
      .attr('transform', 'translate(0, '+(padding_top + (partido_height * yData.length) + (padding_top_axis*2))+')');

    referenceBottomLineH
      .attr('y1', (padding_top + (partido_height * yData.length) + (padding_top_axis*2)))
      .attr("y2", (padding_top + (partido_height * yData.length) + (padding_top_axis*2)));  

    referenceBottomLineV
      .attr('y1', (padding_top + (partido_height * yData.length) + (padding_top_axis*2)))
      .attr("y2", (padding_top + (partido_height * yData.length) + (padding_top_axis*3)));  

    gxAxis.transition()
      .attr('transform', 'translate('+left_width+', '+(padding_top + (partido_height * yData.length) + (padding_top_axis*2))+')');

    yAxis.scale(y)
      .tickValues(yData)
      .tickFormat(function(d){
        return partidoDetalleData.get(d)[0].corto;
      });

    gyAxis.transition().call(yAxis);

    gyAxisLines.call(yAxisOrig
              .scale(y)
              .tickSize( -width )
              .tickFormat("")
          );

    gxAxisLines.call(xAxis2Orig
              .tickSize( (padding_top + (partido_height * yData.length) + (padding_top_axis) ) *-1)
              .tickFormat("")
          );

    var newTexts = gyAxis.selectAll('text')
      .call(_adjust_labels);

  }

  function _createHover(){

    if(!gyHover){
      gyHover = chart.append('g')
        .attr('class', 'y-hover')
        .attr('transform', 'translate(0,'+padding_top+')');
    }

    partidosHover = gyHover.selectAll("rect.hover-partido")
      .data(yData);

    partidosHover.enter()
      .append("rect")
      .attr("class", 'hover-partido')
      .attr("width", left_width)
      .attr("height", partido_guia_height)
      .attr("x", 0);

    partidosHover.exit()
      .remove();

    partidosHover
      .transition()
      .attr("y", function(d) { return y(d)-partido_guia_height/2; });

    var temp;
    $('rect.hover-partido').each(function(){
      temp = partidoDetalleData.get($(this)[0].__data__.trim())[0];
      $(this).qtip("destroy", true).qtip({
          content: { 
            text:'<span>' + temp.detalle + '</span>',
            title: temp.largo.toUpperCase()
          },
          position: {
              my: 'left center',
              at: 'middle right'
          },
          style: {
              classes: 'qtip-partido'
          },
          show: {
            solo: true
          }
      });
    });

  }

  function _createGuias(){

    if(!guias){
      guias = chart.append("g")
        .attr("class", "guia-container")
        .attr('transform', 'translate(0, '+padding_top+')');
    }

    partidos = guias.selectAll("rect.guia-partido")
      .data(yData);
    
    partidos.enter()
      .append("rect")
      .attr("class", 'guia-partido')
      .attr("width", width-left_width)
      .attr("height", partido_guia_height)
      .attr("x", left_width);

    partidos.exit()
      .remove();

    partidos
      .transition()
      .attr("y", function(d) { return y(d)-partido_guia_height/2; });

    //items
    var partidoGruposData = partidoDetalle.filter(function(e,i){
      return (yData.indexOf(e.id_partido)>-1);
    });

    partidoGruposData = d3.nest()
        .key(function(d) { return (d.grupo)?d.grupo:'p'+d.id_partido; })
        .entries(partidoGruposData);

    partidos_items = guias.selectAll("rect.guia-partido-items")
      .data(partidoGruposData);
    
    var inicio, fin;

    partidos_items.enter()
      .append("rect")
      .attr("class", 'guia-partido-items')
      .attr("width", left_width-10)
      .attr("x", 5);

    partidos_items.exit()
      .remove();

    partidos_items
      .transition()
      .attr("y", function(d) { return y(d.values[0].id_partido)-partido_guia_height/2; })
      .attr("height", function(d){
        inicio = y(d.values[0].id_partido)-partido_guia_height/2;
        fin = y(d.values[d.values.length-1].id_partido)+partido_guia_height/2
        return fin-inicio;
      });

  }

  function _adjust_labels(els){
    $(els[0]).each(function(i,e){
      _create_multiline(e);
    });

  }

  function _create_multiline(e) {
    var text_element = e;
    var width = left_width-15;
    var words = text_element.firstChild.data.split(' ');
    var start_x = text_element.getAttributeNS(null, 'x');
    text_element.firstChild.data = '';

    var tspan_element = document.createElementNS(svgNS, "tspan"); // Create first tspan element
    var text_node = document.createTextNode(words[0]);      // Create text in tspan element

    tspan_element.appendChild(text_node);             // Add tspan element to DOM
    text_element.appendChild(tspan_element);            // Add text to tspan element

    var counter = 1;

    for(var i=1; i<words.length; i++) {
      var len = tspan_element.firstChild.data.length;       // Find number of letters in string
      tspan_element.firstChild.data += " " + words[i];      // Add next word

      if (tspan_element.getComputedTextLength() > width-5) {
        tspan_element.firstChild.data = tspan_element.firstChild.data.slice(0, len);  // Remove added word

        counter++;

        var tspan_element = document.createElementNS(svgNS, "tspan");   // Create new tspan element
        tspan_element.setAttributeNS(null, "x", start_x);
        tspan_element.setAttributeNS(null, "dy", 18);
        text_node = document.createTextNode(words[i]);
        tspan_element.appendChild(text_node);
        text_element.appendChild(tspan_element);
      }
    }

    var classes = ' done '+counter+'-lines';

    text_element.setAttributeNS(null, "class", classes  );

    var ref = {
      1:'0.3em',
      2:'-0.5em',
      3:'0em'
    }

    text_element.setAttributeNS(null, "dy", ref[counter]);
  }

  function _getColor(id){
    return referenceData.get(id)[0].color;
  }

  function _getPartidoDetalle(nombre){
    var t;
    $(partidoDetalle).each(function(i,e){
      if(e.corto.trim() == nombre.trim()) {
        t = e;
        return;
      }
    });
    return t;
  }

  function _getPartidoNombres(arr){
    var t = [];
    $(arr).each(function(i,e){
      t.push(partidoDetalleData.get(e)[0].corto);
    });
    return t;
  }

  function _createPuntos(){

    if(!puntos){

      lineasContainer = chart.append("g")
        .attr("class", "lineas-container");

      puntosContainer = chart.append("g")
        .attr("class", "puntos-container")
        .attr('transform', 'translate('+left_width+', '+padding_top+')');

    }

    puntos = puntosContainer.selectAll("circle.participacion")
      .data(rawData);
    
    puntos.enter()
      .append("circle");

    puntos.exit()
      .remove();

    puntos
      .attr("class", function(d) { 
        var classes = (d.foto || d.video)?' participacion-media ':'';
        classes += (d.activo == 0)?' participacion-inactivo ' : '';
        return classes + ' participacion participacion-'+d.id_candidato+' participacion-'+_getColor(d.id_candidato); 
      })
      .attr("cy", 
        function(d,i) {
          circlesData.get(d.id_partido).get(d.id_candidato).push(d3.select(this));
          return y(d.id_partido); 
        })
      .attr("cx", function(d) { return x(d.fecha); })
      .call(_fixPosition)
      .attr("r", 0)
      .transition()
      .duration(300)
      .ease("linear")
      .delay(2500)
      .attr("r", function(d){
        return 5;
      });

  }

  function _fixPosition(obj){
    var max, div, start, orig;

    $.each(circlesData, function(ix1,partido){
      max = partido.max;
      mid = partido_guia_height/2;
      div = partido_guia_height/max;
      start = div/2;

      delete partido.max;
      var counter = 0;
      $.each(partido, function(ix2,candidato){
        $.each(candidato, function(ix3,circulo){
          orig = parseInt(circulo.attr('cy')) - mid;
          circulo.attr('cy',(orig+(counter*div)+start) );
        });
        counter++;
      });
    });

    _createTooltips();

  }

  function _createExclamations(){
    if(!exclamations){

      exclamationContainer = chart.append("g")
        .attr("class", "exclamation-container")
        .attr('transform', 'translate('+left_width+', '+padding_top+')');

    }

    var imgW = 30,
        imgH = 40;

    exclamations = exclamationContainer.selectAll("image.exclamation")
      .data(rawData);
    
    exclamations.enter()
      .append("image")
      .attr("class", "exclamation");

    exclamations.exit()
      .remove();

    exclamations
      .attr('xlink:href',function(d) { 
        return "http://www.hiroads.com/images/exclamation_mark_icon.png"
      })
      .attr("y", 
        function(d,i) {
          return y(d.id_partido)-(imgH/2); 
        })
      .attr("x", function(d) { 
        return x(d.fecha)-(imgW/2); 
      })
      .attr("width", imgW)
      .attr("height",imgH);
  }

  function _createTooltips(){
    var d,
      fecha,
      html,
      myParam,
      media;
    $('circle.participacion').not('circle.done').each(function(){
      d = $(this)[0].__data__;
      fecha = (d.fecha=='2001')?'2001/2002':d.fecha;

      media = false;

      if(d.video){
        media = '<p class="video-tooltip"><a class="modal-tooltip" href="http://www.youtube.com/embed/' + d.video + '" rel="shadowbox;width=600;height=400" title=" ' +d.epigrafe+ '"><img src="http://img.youtube.com/vi/' + d.video + '/0.jpg" /><span class="expand-tooltip"></span></a></p>';
      } else if(d.foto) {
        media = '<p class="foto-tooltip"><a class="modal-tooltip" href="'+BUILD+'data/img/gr/' + d.foto + '" rel="shadowbox;width=600;height=400" title=" ' +d.epigrafe+ '"><img src="'+BUILD+'data/img/ch/' + d.foto + '" /><span class="expand-tooltip"></span></a></p>';
      }

      html = '';

      if(media){
        html = media;
      }

      html += 
            '<p class="nombre-tooltip">' + d.nombre.toUpperCase() + '</p>'
            +'<p class="nombre-tooltip">Año ' + fecha + '</p>'
            +'<p class="partido-tooltip">' + d.partido.toUpperCase() + '</p>'
            +'<p class="desc-tooltip">' + d.observacion + '</p>';

      html += (d.nota)?'<p class="link-tooltip"><a target="_blank" href="' + d.nota + '" >VER NOTA</a></p>':'';

      myParam = (parseInt(d.fecha)<2009)?'bottom left':'bottom right';

      $(this).qtip("destroy", true).qtip({
          content: { 
            text: html
          },
          position: {
              my: myParam,
              at: 'top center'
          },
          show: {
              solo: true,
              effect: function(offset) {
                $(this).fadeIn(90);
                var that = this;
                Shadowbox.clearCache();
                Shadowbox.setup($(this).find('a.modal-tooltip')[0],{
                  onOpen: function(){
                    $(that).hide();
                  },
                  overlayOpacity:0.8
                });
              }
          },
          hide: {
               event: 'unfocus'
          },
          style: {
              classes: 'qtip-recorrido qtip-'+_getColor(d.id_candidato)
          }
      })
      .addClass('done');
    });

    _createLines();
  }

  function _createLines(){
    line = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return d3.select(d).attr('cx'); })
      .y(function(d) { return d3.select(d).attr('cy'); });

      lines = lineasContainer.selectAll("path.line")
          .data(d3.values(referenceData));

      lines.enter()
          .append("path")
          .attr('transform', 'translate('+left_width+', '+padding_top+')')
          .attr("stroke-width", 2)
          .attr("fill", "none");
          
      lines
      .attr("d", function(d){return line(chart.selectAll('.participacion-'+d[0].id)[0]); })
      .attr("class", function(d){ return "line line-"+d[0].id+' line-'+d[0].color; } )
      .attr("stroke-dasharray", function(d){ return d3.select(this).node().getTotalLength() + ' ' + d3.select(this).node().getTotalLength();} )
      .attr("stroke-dashoffset", function(d){ return d3.select(this).node().getTotalLength();} )
      .transition()
      .duration(2000)
      .ease("linear")
      .attr("stroke-dashoffset", 0)
      .delay(500);

      lines.exit()
        .remove();

  }

  return {
    update: function(newData,extraData){

      rawData = newData;

      var temp;

      referenceData = d3.nest()
        .key(function(d) { return d.id; })
        .map(extraData, d3.map);

      circlesData = d3.nest()
        .key(function(d) { return d.id_partido; })
        .key(function(d) { return d.id_candidato; })
        .sortValues(function(a,b) { return parseFloat(a.id_candidato) - parseFloat(b.id_candidato); } )
        .map(newData, d3.map);

      $.each(circlesData, function(i,e){
        var m = circlesData[i].entries().length;
        $.each(circlesData[i], function(i2,e2){
            circlesData[i][i2] = [];
        });

        circlesData[i].max = m;
      });

      var orderArr = partidoDetalleData.keys();

      yData =  d3.nest()
        .key(function(d) { return d.id_partido; })
        .map(newData, d3.map).keys();

      yData.sort(function(a,b) { return orderArr.indexOf(a) - orderArr.indexOf(b); });

      /*exclamationsData = d3.nest()
        .key(function(d) { return d.id_partido; })
        .key(function(d) { return d.fecha; })
        .rollup(function(d) { 
          var r = false;
          $.each(d,function(i,e){
            if(e.foto){
              r = true;
              return false;
            }
          })
          return r;
        })
        .map(rawData, d3.map);*/

      init();

    }
  }

}