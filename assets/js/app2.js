



var map = L.npmap.map({ div: 'map' });

marker1 = L.marker([37.4185539, -122.0829068]).addTo(map);
marker1.bindPopup("Google Campus");
marker2 = L.marker([37.792359, -122.404686]).addTo(map);
marker2.bindPopup("Financial District");
var group = new L.featureGroup([marker1, marker2]);
map.fitBounds(group.getBounds());