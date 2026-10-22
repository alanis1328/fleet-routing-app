let passengers = [];

async function loadPassengers() {
  try {
    passengers = await API.getPassengers();
    renderSidebarAndMarkers();
  } catch (err) {
    console.error('Error al cargar pasajeros:', err);
  }
}

function renderSidebarAndMarkers(orderedSequence = null) {
  MapService.markersLayer.clearLayers();
  const container = document.getElementById('passengersContainer');
  container.innerHTML = '';

  const listToRender = orderedSequence || passengers;

  listToRender.forEach((p, index) => {
    const marker = L.marker([p.latitude, p.longitude]);
    marker.bindPopup(`
      <div style="font-size: 0.9rem;">
        <b style="color: #7c3aed;">${p.first_name} ${p.last_name}</b><br/>
        📍 ${p.address}<br/>
        👤 Apoderado: ${p.guardian_name}<br/>
        📞 ${p.guardian_phone}
      </div>
    `);
    MapService.markersLayer.addLayer(marker);

    const card = document.createElement('div');
    card.className = 'passenger-card';
    card.innerHTML = `
      <div class="card-top">
        <span class="card-title">${p.first_name} ${p.last_name}</span>
        ${orderedSequence ? `<span class="stop-badge">Parada #${index + 1}</span>` : ''}
      </div>
      <div class="card-info">
        <span>📍 ${p.address}</span>
        <span>👤 ${p.guardian_name} (📞 ${p.guardian_phone})</span>
      </div>
      <div class="card-actions">
        <button class="card-btn" onclick="handleEdit('${p.id}')">Editar</button>
        <button class="card-btn card-btn-delete" onclick="handleDelete('${p.id}', '${p.first_name}')">Eliminar</button>
      </div>
    `;

    card.querySelector('.card-info').onclick = () => {
      MapService.map.flyTo([p.latitude, p.longitude], 16);
      marker.openPopup();
    };
    card.querySelector('.card-title').onclick = () => {
      MapService.map.flyTo([p.latitude, p.longitude], 16);
      marker.openPopup();
    };

    container.appendChild(card);
  });

  if (passengers.length > 0 && !orderedSequence) {
    const bounds = L.latLngBounds(passengers.map(p => [p.latitude, p.longitude]));
    MapService.map.fitBounds(bounds.pad(0.2));
  }
}

function handleEdit(id) {
  const p = passengers.find(item => item.id === id);
  if (p) ModalService.openEdit(p);
}

async function handleDelete(id, name) {
  if (!confirm(`¿Deseas eliminar a ${name}?`)) return;
  try {
    await API.deletePassenger(id);
    await loadPassengers();
    MapService.routeLayer.clearLayers();
    document.getElementById('routeSummary').style.display = 'none';
  } catch {
    alert('Error al eliminar alumno.');
  }
}

document.getElementById('passengerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const editId = document.getElementById('editPassengerId').value;
  const addressVal = document.getElementById('address').value.trim();
  const latVal = document.getElementById('lat').value;
  const lngVal = document.getElementById('lng').value;
  const phoneVal = document.getElementById('guardianPhone').value.trim();

  if (!addressVal || !latVal || !lngVal) {
    alert('Debes indicar la dirección y marcar el punto en el mapa.');
    return;
  }

  const payload = {
    first_name: document.getElementById('firstName').value.trim(),
    last_name: document.getElementById('lastName').value.trim(),
    address: addressVal,
    guardian_name: document.getElementById('guardianName').value.trim(),
    guardian_phone: phoneVal,
    latitude: parseFloat(latVal),
    longitude: parseFloat(lngVal)
  };

  try {
    if (editId) {
      await API.updatePassenger(editId, payload);
    } else {
      await API.createPassenger(payload);
    }
    ModalService.close();
    await loadPassengers();
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('btnOpenAddModal').addEventListener('click', () => ModalService.openAdd());
document.getElementById('btnCancelModal').addEventListener('click', () => ModalService.close());
document.getElementById('btnSearchAddress').addEventListener('click', () => ModalService.searchAddress());

document.getElementById('btnShortestRoute').addEventListener('click', async () => {
  const result = await RouterService.calculateBestRoute(passengers);
  if (result) {
    MapService.drawRoute(result.route.geometry);
    const durationMin = Math.round(result.route.duration / 60);
    const distanceKm = (result.route.distance / 1000).toFixed(1);

    document.getElementById('routeDuration').innerText = `${durationMin} min`;
    document.getElementById('routeDistance').innerText = `${distanceKm} km`;
    document.getElementById('routeSummary').style.display = 'block';

    renderSidebarAndMarkers(result.sequence);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  MapService.init();
  loadPassengers();
});