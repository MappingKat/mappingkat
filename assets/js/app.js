/* globals L */

var App, NPMap;

App = {
  current: null,
  data: {},
  createLayer: function(id) {
    App.current = L.heatLayer(App.data[id], {
      radius: 25
    }).addTo(NPMap.config.L);
    NPMap.config.L.fitBounds(new L.LatLngBounds(App.data[id]));
  },
  to: function(id) {
    if (App.current) {
      NPMap.config.L.removeLayer(App.current);
      App.current = null;
    }

    if (App.data[id]) {
      App.createLayer(id);
    } else {
      L.npmap.util._.reqwest({
        success: function(response) {
          var features = response.features,
            latLngs = [];

          for (var i = 0; i < features.length; i++) {
            var coordinates = features[i].geometry.coordinates;

            latLngs.push([
              coordinates[1],
              coordinates[0]
            ]);
          }
          debugger;
          App.data[id] = latLngs;
          App.createLayer(id);
        },
        type: 'jsonp',
        url: 'https://raw.githubusercontent.com/MappingKat/mappingkat/assets/data/map.json?callback=callback'
      });
    }
  }
};
NPMap = {
  baseLayers: false,
  center: {
    lat: 45.4812,
    lng: -100.4907
  },
  div: 'map',
  hooks: {
    init: function(callback) {
      var RadioControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: function() {
          var select = L.DomUtil.create('select', 'form-control');

          select.innerHTML = '<option value="work">Work</option><option value="travel">Travel</option>';
          select.onchange = function() {
            App.to(this.value);
          };

          L.DomEvent.on(select, 'mousedown', L.DomEvent.stopPropagation);
          return select;
        }
      });

      /*
       (c) 2014, Vladimir Agafonkin
       simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
       https://github.com/mourner/simpleheat
      */
      !function(){"use strict";function t(i){return this instanceof t?(this._canvas=i="string"==typeof i?document.getElementById(i):i,this._ctx=i.getContext("2d"),this._width=i.width,this._height=i.height,this._max=1,void this.clear()):new t(i)}t.prototype={defaultRadius:25,defaultGradient:{.4:"blue",.6:"cyan",.7:"lime",.8:"yellow",1:"red"},data:function(t){return this._data=t,this},max:function(t){return this._max=t,this},add:function(t){return this._data.push(t),this},clear:function(){return this._data=[],this},radius:function(t,i){i=i||15;var a=this._circle=document.createElement("canvas"),e=a.getContext("2d"),s=this._r=t+i;return a.width=a.height=2*s,e.shadowOffsetX=e.shadowOffsetY=200,e.shadowBlur=i,e.shadowColor="black",e.beginPath(),e.arc(s-200,s-200,t,0,2*Math.PI,!0),e.closePath(),e.fill(),this},gradient:function(t){var i=document.createElement("canvas"),a=i.getContext("2d"),e=a.createLinearGradient(0,0,0,256);i.width=1,i.height=256;for(var s in t)e.addColorStop(s,t[s]);return a.fillStyle=e,a.fillRect(0,0,1,256),this._grad=a.getImageData(0,0,1,256).data,this},draw:function(t){this._circle||this.radius(this.defaultRadius),this._grad||this.gradient(this.defaultGradient);var i=this._ctx;i.clearRect(0,0,this._width,this._height);for(var a,e=0,s=this._data.length;s>e;e++)a=this._data[e],i.globalAlpha=Math.max(a[2]/this._max,t||.05),i.drawImage(this._circle,a[0]-this._r,a[1]-this._r);var n=i.getImageData(0,0,this._width,this._height);return this._colorize(n.data,this._grad),i.putImageData(n,0,0),this},_colorize:function(t,i){for(var a,e=3,s=t.length;s>e;e+=4)a=4*t[e],a&&(t[e-3]=i[a],t[e-2]=i[a+1],t[e-1]=i[a+2])}},window.simpleheat=t}(),
      /*
       (c) 2014, Vladimir Agafonkin
       Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
       https://github.com/Leaflet/Leaflet.heat
      */
      L.HeatLayer=L.Class.extend({initialize:function(t,i){this._latlngs=t,L.setOptions(this,i)},setLatLngs:function(t){return this._latlngs=t,this.redraw()},addLatLng:function(t){return this._latlngs.push(t),this.redraw()},setOptions:function(t){return L.setOptions(this,t),this._heat&&this._updateOptions(),this.redraw()},redraw:function(){return!this._heat||this._frame||this._map._animating||(this._frame=L.Util.requestAnimFrame(this._redraw,this)),this},onAdd:function(t){this._map=t,this._canvas||this._initCanvas(),t._panes.overlayPane.appendChild(this._canvas),t.on("moveend",this._reset,this),t.options.zoomAnimation&&L.Browser.any3d&&t.on("zoomanim",this._animateZoom,this),this._reset()},onRemove:function(t){t.getPanes().overlayPane.removeChild(this._canvas),t.off("moveend",this._reset,this),t.options.zoomAnimation&&t.off("zoomanim",this._animateZoom,this)},addTo:function(t){return t.addLayer(this),this},_initCanvas:function(){var t=this._canvas=L.DomUtil.create("canvas","leaflet-heatmap-layer leaflet-layer"),i=this._map.getSize();t.width=i.x,t.height=i.y;var a=this._map.options.zoomAnimation&&L.Browser.any3d;L.DomUtil.addClass(t,"leaflet-zoom-"+(a?"animated":"hide")),this._heat=simpleheat(t),this._updateOptions()},_updateOptions:function(){this._heat.radius(this.options.radius||this._heat.defaultRadius,this.options.blur),this.options.gradient&&this._heat.gradient(this.options.gradient),this.options.max&&this._heat.max(this.options.max)},_reset:function(){var t=this._map.containerPointToLayerPoint([0,0]);L.DomUtil.setPosition(this._canvas,t);var i=this._map.getSize();this._heat._width!==i.x&&(this._canvas.width=this._heat._width=i.x),this._heat._height!==i.y&&(this._canvas.height=this._heat._height=i.y),this._redraw()},_redraw:function(){var t,i,a,e,s,n,h,o,r,_=[],d=this._heat._r,l=this._map.getSize(),m=new L.LatLngBounds(this._map.containerPointToLatLng(L.point([-d,-d])),this._map.containerPointToLatLng(l.add([d,d]))),c=void 0===this.options.maxZoom?this._map.getMaxZoom():this.options.maxZoom,u=1/Math.pow(2,Math.max(0,Math.min(c-this._map.getZoom(),12))),g=d/2,f=[],p=this._map._getMapPanePos(),v=p.x%g,w=p.y%g;for(t=0,i=this._latlngs.length;i>t;t++)m.contains(this._latlngs[t])&&(a=this._map.latLngToContainerPoint(this._latlngs[t]),s=Math.floor((a.x-v)/g)+2,n=Math.floor((a.y-w)/g)+2,r=(this._latlngs[t].alt||1)*u,f[n]=f[n]||[],e=f[n][s],e?(e[0]=(e[0]*e[2]+a.x*r)/(e[2]+r),e[1]=(e[1]*e[2]+a.y*r)/(e[2]+r),e[2]+=r):f[n][s]=[a.x,a.y,r]);for(t=0,i=f.length;i>t;t++)if(f[t])for(h=0,o=f[t].length;o>h;h++)e=f[t][h],e&&_.push([Math.round(e[0]),Math.round(e[1]),Math.min(e[2],1)]);this._heat.data(_).draw(),this._frame=null},_animateZoom:function(t){var i=this._map.getZoomScale(t.zoom),a=this._map._getCenterOffset(t.center)._multiplyBy(-i).subtract(this._map._getMapPanePos());this._canvas.style[L.DomUtil.TRANSFORM]=L.DomUtil.getTranslateString(a)+" scale("+i+")"}}),L.heatLayer=function(t,i){return new L.HeatLayer(t,i)};

      new RadioControl().addTo(NPMap.config.L);
      App.to('work');
      callback();
    },
    preinit: function(callback) {
      var overlay = L.npmap.preset.baselayers.nps.parkTiles;
      // boundary to invert...
      (function(){function d(a){var d=[a.latLng([90,180]),a.latLng([90,-270]),a.latLng([-90,-180]),a.latLng([-90,180])];a.extend(a.Polygon.prototype,{initialize:function(e,b){if(b.invert&&(!b.invertMultiPolygon || App.networkCode === 'pacn')){var c=[];c.push(d);c.push(e[0]);e=c}a.Polyline.prototype.initialize.call(this,e,b);this._initWithHoles(e)},getBounds:function(){return this.options.invert?new a.LatLngBounds(this._holes):new a.LatLngBounds(this.getLatLngs())}});a.extend(a.MultiPolygon.prototype,{initialize:function(a,b){this._layers={};this._options=b;if(b.invert){b.invertMultiPolygon=!0;var c=[];c.push(d);for(var f in a)c.push(a[f][0]);a=[c]}this.setLatLngs(a)}})}"function"===typeof define&&define.amd?define(["leaflet"],function(a){d(a)}):d(L)})();

      overlay.id += ',mapbox.pencil';
      overlay.popup = {
        title: '{{#if name}}{{name}}{{else}}{{FCategory}}{{/if}}'
      };

      NPMap.config.overlays = [
        overlay
      ];
      callback();
    }
  },
  scaleControl: true,
  zoom: 4
};

(function() {
  var s = document.createElement('script');
  s.src = 'http://www.nps.gov/npmap/npmap.js/2.0.0/npmap-bootstrap.min.js';
  document.body.appendChild(s);
})();
