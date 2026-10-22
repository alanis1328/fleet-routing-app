const ModalService = {
  openAdd() {
    document.getElementById('modalTitle').innerText = 'Nuevo Alumno';
    document.getElementById('editPassengerId').value = '';
    document.getElementById('passengerForm').reset();
    document.getElementById('addressStatus').innerText = '';
    
    const info = document.getElementById('coordsInfo');
    info.innerText = '📍 Haz clic en el mapa para marcar y cambiar la dirección exacta.';
    info.style.background = '#fdf2f8';
    info.style.borderColor = '#f472b6';
    info.style.color = '#831843';

    MapService.clearPicker();
    document.getElementById('passengerModal').style.display = 'block';
  },

  openEdit(p) {
    document.getElementById('modalTitle').innerText = 'Editar Información del Alumno';
    document.getElementById('editPassengerId').value = p.id;
    document.getElementById('firstName').value = p.first_name;
    document.getElementById('lastName').value = p.last_name;
    document.getElementById('address').value = p.address;
    document.getElementById('guardianName').value = p.guardian_name;
    document.getElementById('guardianPhone').value = p.guardian_phone;
    document.getElementById('lat').value = p.latitude;
    document.getElementById('lng').value = p.longitude;
    document.getElementById('addressStatus').innerText = '';

    const info = document.getElementById('coordsInfo');
    info.innerText = `📍 Ubicación: (${p.latitude}, ${p.longitude})`;
    info.style.background = '#ede9fe';
    info.style.borderColor = '#8b5cf6';
    info.style.color = '#5b21b6';

    MapService.setPickerMarker(p.latitude, p.longitude);
    MapService.map.flyTo([p.latitude, p.longitude], 16);
    document.getElementById('passengerModal').style.display = 'block';
  },

  close() {
    document.getElementById('passengerModal').style.display = 'none';
    document.getElementById('passengerForm').reset();
    MapService.clearPicker();
  },

  async searchAddress() {
    const address = document.getElementById('address').value.trim();
    const statusEl = document.getElementById('addressStatus');

    if (!address) {
      statusEl.innerText = 'Escribe una dirección antes de buscar.';
      statusEl.style.color = '#e11d48';
      return;
    }

    statusEl.innerText = 'Buscando en Concepción...';
    statusEl.style.color = '#8b5cf6';

    try {
      const query = encodeURIComponent(`${address}, Concepción, Chile`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        document.getElementById('lat').value = parseFloat(item.lat).toFixed(6);
        document.getElementById('lng').value = parseFloat(item.lon).toFixed(6);
        statusEl.innerText = 'Dirección localizada con éxito.';
        statusEl.style.color = '#059669';

        MapService.setPickerMarker(item.lat, item.lon);
        MapService.map.flyTo([item.lat, item.lon], 16);
        document.getElementById('coordsInfo').innerText = `📍 Ubicación: (${item.lat}, ${item.lon})`;
      } else {
        statusEl.innerText = 'No se encontró la dirección. Marca el punto en el mapa.';
        statusEl.style.color = '#e11d48';
      }
    } catch {
      statusEl.innerText = 'Error al consultar el servicio de mapa.';
    }
  }
};