const url = 'https://jaeabevgkqwyfalvnwgp.supabase.co/rest/v1/drivers?select=id,name,vehicle_id,safety_score';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZWFiZXZna3F3eWZhbHZud2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDMyNDIsImV4cCI6MjA5NjQ3OTI0Mn0.TEBGz2nu_sw3iDGukw1B5onS9tlLfxTD0nEs0I5ZuJ4';

async function check() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.log('Error payload:', data);
      return;
    }
    console.log('Total drivers fetched:', data.length);
    if (data.length > 0) {
      console.log('First 5 drivers:', data.slice(0, 5));
    }
  } catch (e) {
    console.error(e);
  }
}

check();
