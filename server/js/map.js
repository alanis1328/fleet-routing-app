const MapService = {
  map: null,
  markersLayer: null,
  routeLayer: null,
  tempPickerMarker: null,

  init() {
    this.map = L.map('map').setView([-36.82, -73.05], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    this.map.on('click', (e) => this.handleMapClick(e));
  },

  async handleMapClick(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;

    this.setPickerMarker(lat, lng);

    const statusEl = document.getElementById('addressStatus');
    const addressInput = document.getElementById('address');
    
    statusEl.innerText = 'Obteniendo calle...';
    statusEl.style.color = '#8b5cf6';

    const coordsInfo = document.getElementById('coordsInfo');
    coordsInfo.innerText = `📍 Ubicación: (${lat}, ${lng})`;
    coordsInfo.style.background = '#ede9fe';
    coordsInfo.style.borderColor = '#8b5cf6';
    coordsInfo.style.color = '#5b21b6';

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian || data.address.suburb || '';
        const house = data.address.house_number ? `#${data.address.house_number}` : '';
        const formatted = road ? `${road} ${house}`.trim() : (data.display_name.split(',')[0] || 'Ubicación seleccionada');
        
        addressInput.value = formatted;
        statusEl.innerText = `Dirección: ${formatted}`;
        statusEl.style.color = '#059669';
      }
    } catch {
      statusEl.innerText = 'Punto seleccionado en mapa.';
    }
  },

  setPickerMarker(lat, lng) {
    if (this.tempPickerMarker) {
      this.map.removeLayer(this.tempPickerMarker);
    }
    this.tempPickerMarker = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#ec4899',
      fillColor: '#f472b6',
      fillOpacity: 0.9,
      weight: 3
    }).addTo(this.map);
  },

  clearPicker() {
    if (this.tempPickerMarker) {
      this.map.removeLayer(this.tempPickerMarker);
      this.tempPickerMarker = null;
    }
  },

  drawRoute(geometry) {
    this.routeLayer.clearLayers();
    const polyline = L.geoJSON({
      type: 'Feature',
      geometry: geometry
    }, {
      style: { color: '#8b5cf6', weight: 5, opacity: 0.9 }
    });
    this.routeLayer.addLayer(polyline);
    this.map.fitBounds(polyline.getBounds().pad(0.1));
  }
};