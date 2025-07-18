// Inicialización del mapa
const map = L.map('map').setView([0,0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const marker = L.marker([0,0]).addTo(map);

// Hora
function actualizarHora() {
  document.getElementById('hora').textContent = new Date().toLocaleString();
}
setInterval(actualizarHora, 1000);
actualizarHora();

// Cargar CSV de repetidores
let repetidores = [];
fetch('repetidores.csv')
  .then(r => r.text())
  .then(txt => {
    const lines = txt.trim().split('\n');
    const headers = lines[0].split(',');
    repetidores = lines.slice(1).map(line => {
      const cols = line.split(',');
      return {
        nombre: cols[headers.indexOf('nombre')],
        lat: parseFloat(cols[headers.indexOf('lat')]),
        lon: parseFloat(cols[headers.indexOf('lon')]),
        freq: cols[headers.indexOf('freq')]
      };
    });
  });

// Función distancia Haversine
function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Mostrar repetidores cercanos
function mostrarReps(lat, lon) {
  const tbody = document.querySelector('#repetidores tbody');
  tbody.innerHTML = '';
  repetidores.map(r => ({
    ...r,
    d: distKm(lat, lon, r.lat, r.lon)
  }))
  .sort((a,b) => a.d - b.d)
  .slice(0,10)
  .forEach(r => {
    const tr = `<tr>
      <td>${r.nombre}</td><td>${r.d.toFixed(2)}</td><td>${r.freq}</td>
    </tr>`;
    tbody.insertAdjacentHTML('beforeend', tr);
  });
}

// Ubicación y clima
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(pos => {
    const { latitude:lat, longitude:lon, speed } = pos.coords;
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon], 12);
    document.getElementById('velocidad').textContent = ((speed||0)*3.6).toFixed(1);

    mostrarReps(lat, lon);

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
      .then(r => r.json())
      .then(data => {
        const cw = data.current_weather;
        document.getElementById('clima').textContent = 
          `${cw.temperature}°C, viento ${cw.windspeed} km/h`;
      });
  }, err => alert('GPS error: '+err.message), { enableHighAccuracy:true });
} else {
  alert('GPS no disponible');
}
