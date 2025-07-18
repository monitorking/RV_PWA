// Fetch CSV de repetidores por país
async function cargarCSV(country) {
  const url = `https://www.repeaterbook.com/api/exportROW.php?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': '(AutoInfoApp, your@email.com)'
    }
  });
  const csv = await res.text();
  return csv.split('\n').slice(1).map(line => {
    const cols = line.split(',');
    return {
      nombre: cols[1].trim(),
      lat: parseFloat(cols[?]), // ajustar índice basado en columnas Lat/Long
      lon: parseFloat(cols[?]),
      freq: cols[?] // frecuencia
    };
  });
}

let repetidoresList = [];
cargarCSV('Spain%20,France%20,Germany').then(list => {
  repetidoresList = list;
});

// Luego como antes: watchPosition, obtener lat/lon, y hacer:
function actualizarRepetidores(lat, lon) {
  const cercanos = repetidoresList
    .map(r=>({...r, d: distKm(lat,lon,r.lat,r.lon)}))
    .filter(r=>['2‑m','70‑cm'].includes(r.band) && ['FM','DMR'].some(m=>r.mode.includes(m)))
    .sort((a,b)=>a.d-b.d)
    .slice(0,10);
  // mostrar en tabla
}
