const API = {
  async getPassengers() {
    const res = await fetch('/api/passengers');
    if (!res.ok) throw new Error('Error al obtener pasajeros');
    return res.json();
  },

  async createPassenger(payload) {
    const res = await fetch('/api/passengers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');
    return data;
  },

  async updatePassenger(id, payload) {
    const res = await fetch(`/api/passengers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar');
    return data;
  },

  async deletePassenger(id) {
    const res = await fetch(`/api/passengers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar');
    return data;
  }
};