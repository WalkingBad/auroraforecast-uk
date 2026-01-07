(function(){
  function getLatLon() {
    var lat = NaN, lon = NaN;
    var timer = document.getElementById('darkness-timer');
    if (timer) {
      lat = parseFloat(timer.dataset.lat || '');
      lon = parseFloat(timer.dataset.lon || '');
      if (!isNaN(lat) && !isNaN(lon)) return { lat: lat, lon: lon };
    }
    try {
      var ld = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i=0;i<ld.length;i++) {
        var obj = null; try { obj = JSON.parse(ld[i].textContent || ''); } catch(e) { obj = null; }
        if (!obj) continue;
        if (obj['@type'] === 'Place' && obj.geo && typeof obj.geo.latitude === 'number' && typeof obj.geo.longitude === 'number') {
          return { lat: obj.geo.latitude, lon: obj.geo.longitude };
        }
      }
    } catch(e) { /* silent */ }
    return null;
  }

  var location = getLatLon();
  if (!location) {
    return;
  }

  var snapshotPromise = fetch('https://europe-west1-aurorame-621f6.cloudfunctions.net/seoSnapshot?lat=' + location.lat + '&lon=' + location.lon)
    .then(function(r){ if(!r.ok) throw new Error('http '+r.status); return r.json(); });

  function hydrateThreeHour() {
    try {
      var wrapper = document.querySelector('[data-testid="three-hour-forecast"] .responsive-content');
      if (!wrapper) return;
      var unavailable = wrapper.querySelector('.three-hour-forecast-unavailable');
      if (!unavailable) return;
      snapshotPromise
        .then(function(data){
          var h12 = Array.isArray(data.h12) ? data.h12.slice(0,3) : [];
          if (h12.length < 3) return;
          function fmtTime(t){ try{ var d = new Date(String(t).replace(' ','T')+'Z'); return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false}); }catch(e){ return '--:--'; } }
          var statusColors = (data.ui && data.ui.statusColors) || { very_low:'#FF4747', low:'#FFB800', medium:'#34C97B', high:'#6BE7A0' };
          var statusTexts = (data.ui && data.ui.statusTexts) || {};
          var itemsHtml = '';
          for (var i=0;i<h12.length;i++){
            var h = h12[i];
            var status = h.status || 'very_low';
            var color = statusColors[status] || '#FF4747';
            var text = statusTexts[status] || String(status).replace('_',' ');
            var prob = Math.round(h.probAdj || h.probBase || 0);
            itemsHtml += '<div class="forecast-item">'
              + '<div class="forecast-time">' + fmtTime(h.time) + '</div>'
              + '<div class="forecast-kp">Kp ' + String(h.kp ?? 0).replace(/\.0$/, '') + '</div>'
              + '<div class="forecast-status" style="color: ' + color + '">' + text + '</div>'
              + (prob ? '<div class="forecast-probability">' + prob + '%</div>' : '')
              + '</div>';
          }
          var cta = wrapper.querySelector('.forecast-cta');
          var ctaHtml = cta ? cta.outerHTML : '';
          wrapper.innerHTML = '<section class="three-hour-forecast">'
            + '<h2>Next 3 Hours Timeline</h2>'
            + '<div class="forecast-timeline">' + itemsHtml + '</div>'
            + ctaHtml
            + '</section>';
        })
        .catch(function(){ /* silent */ });
    } catch(e){ /* silent */ }
  }

  function hydrateFactors() {
    try {
      snapshotPromise
        .then(function(data){
          // Kp
          var kpCard = document.querySelector('[data-factor="kp"] .factor-value-main');
          var kpVal = null;
          if (data && data.conditions && typeof data.conditions.kpIndex === 'number') kpVal = data.conditions.kpIndex;
          else if (data && data.h12 && data.h12[0] && typeof data.h12[0].kp === 'number') kpVal = data.h12[0].kp;
          if (kpCard && kpVal != null) {
            var kpLabel = 'Very Quiet';
            if (kpVal >= 5) kpLabel = 'Storm';
            else if (kpVal >= 3) kpLabel = 'Good';
            else if (kpVal >= 1) kpLabel = 'Low';
            // set label (text node) and value
            var firstNode = kpCard.childNodes[0];
            if (firstNode && firstNode.nodeType === Node.TEXT_NODE) firstNode.textContent = kpLabel + ' ';
            var kv = kpCard.querySelector('.value'); if (kv) kv.textContent = String(kpVal).replace(/\.0$/, '');
          }
          // Weather
          var weatherCard = document.querySelector('[data-factor="weather"] .factor-value-main');
          var cloud = data && data.conditions && data.conditions.cloudCover;
          if (weatherCard && typeof cloud === 'number') { var wv = weatherCard.querySelector('.value'); if (wv) wv.textContent = cloud + '%'; }
          // Moon
          var moonCard = document.querySelector('[data-factor="moon"] .factor-value-main');
          var moon = data && data.conditions && data.conditions.moonIllumination;
          if (moonCard && typeof moon === 'number') {
            var moonLabel = 'Full Moon';
            if (moon < 5) moonLabel = 'New Moon';
            else if (moon < 35) moonLabel = 'Crescent';
            else if (moon < 65) moonLabel = 'Quarter';
            else if (moon < 95) moonLabel = 'Gibbous';
            var firstMoonNode = moonCard.childNodes[0];
            if (firstMoonNode && firstMoonNode.nodeType === Node.TEXT_NODE) firstMoonNode.textContent = moonLabel + ' ';
            var mv = moonCard.querySelector('.value'); if (mv) mv.textContent = moon + '%';
          }
          // Darkness
          var darknessCard = document.querySelector('[data-factor="darkness"] .factor-value-main');
          var sky = data && data.conditions && data.conditions.skyDarkness;
          if (darknessCard && typeof sky === 'string') {
            var label = 'Daylight';
            if (sky === 'dark' || sky === 'night') label = 'Night';
            else if (sky === 'astronomical') label = 'Astronomical Twilight';
            else if (sky === 'nautical' || sky === 'dawn' || sky === 'twilight') label = 'Nautical Twilight';
            var firstNode = darknessCard.childNodes[0];
            if (firstNode && firstNode.nodeType === Node.TEXT_NODE) firstNode.textContent = label + ' ';
          }
          // Magnetic Latitude
          var magCard = document.querySelector('[data-factor="magneticLatitude"] .factor-value-main');
          var mlat = null;
          if (data && data.location && typeof data.location.magneticLatitude === 'number') mlat = data.location.magneticLatitude;
          else if (data && data.place && typeof data.place.mlat === 'number') mlat = data.place.mlat;
          if (magCard && typeof mlat === 'number') { var mlv = magCard.querySelector('.value'); if (mlv) mlv.textContent = mlat.toFixed(1) + '°'; }
        })
        .catch(function(){ /* silent */ });
    } catch(e){ /* silent */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      hydrateThreeHour();
      hydrateFactors();
    });
  } else {
    hydrateThreeHour();
    hydrateFactors();
  }
})();
