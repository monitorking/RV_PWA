// Inicializar mapa
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const marker = L.marker([0, 0]).addTo(map);

// Actualizar hora cada segundo
function actualizarHora() {
  document.getElementById('hora').textContent = new Date().toLocaleString();
}
setInterval(actualizarHora, 1000);
actualizarHora();

// Mostrar repetidores desde RepeaterBook API
function mostrarRepetidoresRepeaterBook(lat, lon) {
  const url = `https://api.repeaterbook.com/repeaters?lat=${lat}&lon=${lon}&band=2m,70cm&mode=FM`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#repetidores tbody');
      tbody.innerHTML = "";
      const repetidores = data.repeaters || [];
      repetidores.slice(0, 10).forEach(r => {
        const fila = `<tr>
          <td>${r.callsign || r.name || '---'}</td>
          <td>${parseFloat(r.distance_km || 0).toFixed(1)}</td>
          <td>${r.output_freq || '---'}</td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', fila);
      });
    })
    .catch(err => {
      console.error("Error al consultar RepeaterBook:", err);
    });
}

// Mostrar clima desde Open-Meteo
function mostrarClima(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const cw = data.current_weather;
      document.getElementById('clima').textContent =
        `${cw.temperature}°C, viento ${cw.windspeed} km/h`;
    })
    .catch(err => {
      console.error("Error al obtener el clima:", err);
    });
}

// GPS en tiempo real + repetidores cada 5 minutos
if (navigator.geolocation) {
  function actualizarDatos(pos) {
    const { latitude: lat, longitude: lon, speed } = pos.coords;
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon], 12);
    document.getElementById('velocidad').textContent = ((speed || 0) * 3.6).toFixed(1);

    mostrarClima(lat, lon);
    mostrarRepetidoresRepeaterBook(lat, lon);
  }

  // Actualización continua para mapa y velocidad
  navigator.geolocation.watchPosition(actualizarDatos, err => {
    alert("Error de GPS: " + err.message);
  }, {
    enableHighAccuracy: true,
    maximumAge: 1000
  });

  // Actualizar repetidores cada 5 minutos
  setInterval(() => {
    navigator.geolocation.getCurrentPosition(actualizarDatos);
  }, 5 * 60 * 1000);

} else {
  alert("GPS no disponible en este dispositivo.");
}
