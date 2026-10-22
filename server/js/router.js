const RouterService = {
  getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const perms = this.getPermutations(remaining);
      for (const p of perms) {
        result.push([current, ...p]);
      }
    }
    return result;
  },

  async calculateBestRoute(passengers) {
    if (passengers.length < 2) {
      alert('Se requieren al menos 2 personas registradas para calcular la ruta.');
      return null;
    }

    const allPermutations = this.getPermutations(passengers);
    let bestRoute = null;
    let minDuration = Infinity;
    let bestSequence = null;

    try {
      const routePromises = allPermutations.map(async (sequence) => {
        const coords = sequence.map(p => `${p.longitude},${p.latitude}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          return { route: data.routes[0], sequence: sequence };
        }
        return null;
      });

      const results = await Promise.all(routePromises);

      results.forEach(res => {
        if (res && res.route.duration < minDuration) {
          minDuration = res.route.duration;
          bestRoute = res.route;
          bestSequence = res.sequence;
        }
      });

      if (!bestRoute || !bestSequence) {
        alert('No se pudo encontrar una ruta viable.');
        return null;
      }

      return {
        route: bestRoute,
        sequence: bestSequence
      };
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al optimizar la ruta.');
      return null;
    }
  }
};