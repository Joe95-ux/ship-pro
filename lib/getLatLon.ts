export default async function getLatLonForCity(city: string, country: string) {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + " " + country)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
  
    if (geocodeData.status !== "OK" || !geocodeData.results?.length) {
      throw new Error(`Geocoding failed: ${geocodeData.status} - ${geocodeData.error_message || "No results found"}`);
    }
  
    const { lat, lng } = geocodeData.results[0].geometry.location;
    return { lon: lng, lat };
  }
  