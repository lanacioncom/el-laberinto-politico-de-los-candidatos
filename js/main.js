var App;

;(function(global, document, BUILD, $, d3, Handlebars){

    "use strict";

    App = global.App = global.App || {};

    App.params = {
        width:960,
        selectedIds: []
    };

    //Data
    App.dataUrl = 'https://docs.google.com/spreadsheet/pub?key=0AjbfzXKdfMPDdEozb3g3dVRCbWdlT2tjeWppUEZ1LXc&output=csv&gid=';
    App.dataFicha;
    App.dataCandidato;
    App.dataDetalle;

    //Components
    App.$contenedor = $(".contenedor");
    App.$slide = $(".slide");
    App.$candidatos = $(".candidatos");
    //App.$selectionContainer = $(".selected-candidatos");
    App.$selectContainer = $(".select-container");
    App.$sliderContainer = $(".slider-container");
    App.$select;
    App.$actionBtn = $("#ver-recorrido");
    App.$limpiarBtn = $("#limpiar");
    App.$sliderControl = $("#slider-control");
    App.$referenceblock = $(".reference-block");
    App.$creditosBtn = $("#creditos-btn");

    //Templates
    App.itemTemplate = Handlebars.compile($("#politico-item").html());
    App.selectListTemplate = Handlebars.compile($("#politico-select-list").html());

    //Vars
    App.page = 0;
    App.candidatosSelected = [];
    App.candidatosDetalleSelected = [];
    App.colors = ['blue','green','purple','orange'];

    //Grap
    App.graph;

    /*SETUP START*/

    App.init = function() {
        App.getHash();
        App.setSizes();

        queue()
          .defer(d3.csv, BUILD+'data/candidatos.csv')
          .defer(d3.csv, BUILD+'data/trayectorias.csv')
          .defer(d3.csv, BUILD+'data/partidos.csv')
          .awaitAll(App.filesLoaded);

    };

    App.setSizes = function() {
        App.$contenedor.width(App.params.width);
        App.$candidatos.width(App.params.width);
    };

    App.getHash = function() {
        var hash = window.location.hash;
        App.params.selectedIds = (hash)?hash.substring(1).split('-').slice(0,4):[];
    };

    App.filesLoaded = function(error, results){
        App.graph = d3.politicos('timeline-candidatos',App.params.width,results[2]);

        App.dataLoaded(results[0]);
        App.detailsLoaded(results[1]);

        if(App.params.selectedIds.length>0){
            App.selectInitial();
        }
    };

    App.detailsLoaded = function(data){
        App.dataDetalle = d3.nest()
            .key(function(d) { return parseInt(d.id_candidato); })
            .map(data.filter(function(e){return (e.partido==="NADA")?false:true;}), d3.map);
    };

    App.dataLoaded = function(data){

        App.dataFicha = data;

        App.dataCandidato =  d3.nest()
            .key(function(d) { return parseInt(d.id); })
            .map(App.dataFicha, d3.map);

        App.$actionBtn.on('click',App.updateGraph);
        App.$limpiarBtn.on('click',App.limpiar);
        App.createSlide();
        App.$sliderControl.on('click',App.toggleSlider);
        App.createSelect();

        App.$creditosBtn.on('click',App.openCreditos);

    }

    App.openCreditos = function() {
        Shadowbox.open({
            content:    '#creditos-modal',
            player:     "inline",
            height:     432,
            width:      500
        });
    }

    App.limpiar = function() {
        if(!$(this).hasClass('disabled')){
            $.each(App.candidatosSelected,function(i,e){
                App.removeCandidato(e.id);
            });
            App.cleanGraph();
        }
    }

    App.selectInitial = function() {
        $.each(App.params.selectedIds,function(i,e){
            App.selectCandidato(parseInt(e));
        });
        App.updateGraph();
    }

    App.toggleSlider = function() {
        var h = (App.$sliderContainer.height()==0)?192:0;
        App.animateSliderContainer(h);
    }

    App.animateSliderContainer = function(h) {
        if(App.$sliderContainer.height()!=h){
            App.$sliderControl.toggleClass('mostrar');
            App.$sliderContainer.clearQueue().animate({  height:h }, 800, "easeInOutCirc");
        }
    }

    App.formatSelect = function(person,a,b) {
        var color = App.getColorCandidatosSelected(person.id);
        return "<span class='selected-reference selected-reference-"+color+"'><span class='white-bg'>" + person.text + "</span></span>" ;
    }

    App.createSelect = function(){
        App.$selectContainer.html(App.selectListTemplate(App.dataFicha));
        var options = { 
            maximumSelectionSize: 4,
            placeholder: "Seleccioná hasta 4 políticos",
            formatSelection: App.formatSelect,
            escapeMarkup:function (m) { return m;}
        };
        App.$select = $('#select-politicos').select2(options);

        App.$select.on("change", 
                function(e) { 
                    e.preventDefault();
                    if(e.added)
                        App.selectCandidato(e.added.id);

                    if(e.removed)
                        App.removeCandidato(e.removed.id);


                });
    }

    App.createSlide = function(){
        App.$slide.css('width',App.params.width);
        App.$slide.html(App.itemTemplate(App.dataFicha));
        App.$fichas = $('.ficha');
        App.$fichas.on('click',App.clickFicha);
        App.$fichas.hover(App.mouseEnterFicha,App.mouseLeaveFicha);

        App.$fichas.each(function(){
            $(this).qtip({
                content: '<span>' + $(this).data('tooltip') + '</span>',
                position: {
                    my: 'center center',
                    at: 'top center',
                    target: 'mouse',
                    adjust: {
                        mouse: true,
                        y:30
                    }
                },
                show: {
                    solo: true
                },
                style: {
                    classes: 'qtip-candidato'
                }
            });
        });
    }

    /*SETUP END*/

    /*SELECT START*/

    App.mouseEnterFicha = function(){
        var f = $(this);
        if(!f.is(".disabled, .selected")){
            App.onFicha(f,App.colors[0],true);
        }
    };

    App.mouseLeaveFicha = function(){
        var f = $(this);
        if(f.hasClass('ficha-hover')){
            App.offFicha(f,App.colors[0],true);
        }
    };

    App.clickFicha = function(){
        var f = $(this);
        if(f.hasClass("selected") && !f.hasClass("ficha-hover") ){
            App.removeCandidato(f.data('id'));
        }else{
            if(App.candidatosSelected.length<4){
                App.selectCandidato(f.data('id'));
            }
        }
    };

    App.onFicha = function(f,color,hover){
        if(hover){
            f.addClass("ficha-hover"); 
        } else {
            f.removeClass("ficha-hover"); 
        }
        f.addClass("selected");
        f.find('.selection').addClass('border-color-'+color);
        f.find('.check').addClass('color-'+color);
    };

    App.offFicha = function(f,color,hover){
        if(hover){
           f.removeClass("ficha-hover"); 
        }
        f.removeClass("selected");
        f.find('.selection').removeClass('border-color-'+color);
        f.find('.check').removeClass('color-'+color);
    };

    App.setSelectedHash = function(){
        window.location.hash = App.candidatosSelected
            .reduce(function(previousValue, currentValue, index, array){
                return (previousValue)?previousValue + '-' + currentValue.id:'' + currentValue.id;
              }
              ,''
            );
    };

    App.selectCandidato = function(id){

        var candidato = App.getDataCandidato(id),
            f = App.$slide.find('#ficha-'+id);
        
        //Slider
        candidato.color = App.colors.shift();

        //CSS de la ficha
        App.onFicha(f,candidato.color,false);

        //Selected
        App.candidatosSelected.push(candidato);
        
        //Data for graph
        App.candidatosDetalleSelected = App.candidatosDetalleSelected.concat(App.getDetalleCandidato(id));

        //Select
        var m = App.$select.select2("val");
        App.$select.select2("val",m.concat([id+""]));
        
        //Check
        App.checkLimit();
    };

    App.removeCandidato = function(id){
        var f = App.$slide.find('#ficha-'+id);
            
        //Selected
        var m = [];
        App.candidatosSelected = App.candidatosSelected.filter(function(a){
            if(a.id==id){
                App.colors.push(a.color);
                App.offFicha(f,a.color,false);
                return false;
            }
            m.push(a.id+"");
            return true;
        });

        App.candidatosDetalleSelected = App.candidatosDetalleSelected.filter(function(a){
            if(a.id_candidato==id){
                return false;
            }
            return true;
        });
        
        //Select
        App.$select.select2("val",m);

        App.checkLimit();
    };

    App.getColorCandidatosSelected = function(id){
        var r = App.candidatosSelected.filter(function(a){
            if(a.id==id){
                return true;
            }
            return false;
        })[0];

        r = (r)?r.color:false;

        return r;
    };

    App.cleanGraph = function(){
        App.animateSliderContainer(192);
        App.graph.update([],[]);
    };

    App.updateGraph = function(){
        if(!$(this).hasClass('disabled')){
            $('body,html').animate({scrollTop : 155},'slow');
            App.$referenceblock.show();
            App.setSelectedHash();
            App.animateSliderContainer(0);
            App.graph.update(App.candidatosDetalleSelected,App.candidatosSelected);
        }
    };

    App.checkLimit = function(){
        //fichas
        if(App.candidatosSelected.length==4){
            App.$slide.find('.ficha').not('.selected').addClass('disabled');
        } else if (App.$slide.find('.disabled').size()>0){
            App.$slide.find('.ficha').not('.selected').removeClass('disabled');
        }

        //btn
        if(App.candidatosSelected.length==0){
            App.$limpiarBtn.addClass('disabled');
            App.$actionBtn.addClass('disabled');
        }else if(App.candidatosSelected.length==1){
            App.$actionBtn.html("VER RECORRIDO").removeClass('disabled');
            App.$limpiarBtn.removeClass('disabled');
        }else{
            App.$actionBtn.html("COMPARAR");
        }
    };

    App.getDataCandidato = function(id){
        return App.dataCandidato.get(id)[0];
    };

    App.getDetalleCandidato = function(id){
        return (App.dataDetalle.get(id))?App.dataDetalle.get(id):[];
    };

    /*SELECT END*/


})(window, document, BUILD, jQuery, d3, Handlebars);

window.onload = function() {
    var opts = {
        fb:{
            title:'El laberinto político de los candidatos',
            text:'Visualizá el camino que realizaron los candidatos a través de las últimas elecciones. En qué partido estuvieron y con quiénes. - lanacion.com',
            img: 'http://interactivos.lanacion.com.ar/candidatos/'+BUILD+'img/screen.png'
        },
        tw:{
            text:'Conocé el laberinto político de los candidatos',
            related : 'lndata',
            via: 'lanacioncom',
            ht: 'ddj,dataviz'
        },
        em:{
            subject:'El laberinto político de los candidatos',
            body:'Visualizá el camino que realizaron los candidatos a través de las últimas elecciones. En qué partido estuvieron y con quiénes.'
        },
        getUrl: function(via){
            //return 'http://interactivos.lanacion.com.ar/candidatos/'+window.location.hash;
            return window.location.origin+window.location.pathname+window.location.hash;
        }
    };

    App.init(); 
    MiniShare.init(opts);
    Shadowbox.init();

}