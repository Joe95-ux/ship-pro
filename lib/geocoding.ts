// Function to get country coordinates from Google Geocoding API
export async function getCountryCoordinates(countryName: string): Promise<[number, number] | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found, using fallback coordinates');
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(countryName)}&key=${apiKey}`
    );
    
    if (!response.ok) {
      console.warn(`Failed to geocode ${countryName}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return [lat, lng];
    }
    
    console.warn(`No results found for ${countryName}: ${data.status}`);
    return null;
  } catch (error) {
    console.error(`Error geocoding ${countryName}:`, error);
    return null;
  }
}

// Fallback coordinates for common countries (in case API fails)
export const fallbackCoordinates: { [key: string]: [number, number] } = {
  'United States': [39.8283, -98.5795],
  'Canada': [56.1304, -106.3468],
  'United Kingdom': [55.3781, -3.4360],
  'Germany': [51.1657, 10.4515],
  'France': [46.2276, 2.2137],
  'Australia': [-25.2744, 133.7751],
  'Japan': [36.2048, 138.2529],
  'Brazil': [-14.2350, -51.9253],
  'India': [20.5937, 78.9629],
  'China': [35.8617, 104.1954],
  'Mexico': [23.6345, -102.5528],
  'Spain': [40.4637, -3.7492],
  'Italy': [41.8719, 12.5674],
  'Netherlands': [52.1326, 5.2913],
  'South Korea': [35.9078, 127.7669],
  'Turkey': [38.9637, 35.2433],
  'Saudi Arabia': [23.8859, 45.0792],
  'Argentina': [-38.4161, -63.6167],
  'Poland': [51.9194, 19.1451],
  'Colombia': [4.5709, -74.2973],
  'Peru': [-9.1900, -75.0152],
  'Chile': [-35.6751, -71.5430],
  'Venezuela': [6.4238, -66.5897],
  'Ecuador': [-1.8312, -78.1834],
  'Bolivia': [-16.2902, -63.5887],
  'Uruguay': [-32.5228, -55.7658],
  'Paraguay': [-23.4425, -58.4438],
  'Guyana': [4.8604, -58.9302],
  'Suriname': [3.9193, -56.0278],
  'French Guiana': [3.9339, -53.1258],
  'Fiji': [-17.7134, 178.0650],
  'Tanzania': [-6.3690, 34.8888],
  'South Africa': [-30.5595, 22.9375],
  'Egypt': [26.8206, 30.8025],
  'Nigeria': [9.0820, 8.6753],
  'Kenya': [-0.0236, 37.9062],
  'Ethiopia': [9.1450, 40.4897],
  'Morocco': [31.7917, -7.0926],
  'Algeria': [28.0339, 1.6596],
  'Tunisia': [33.8869, 9.5375],
  'Libya': [26.3351, 17.2283],
  'Sudan': [12.8628, 30.2176],
  'Somalia': [5.1521, 46.1996],
  'Djibouti': [11.8251, 42.5903],
  'Eritrea': [15.1794, 39.7823],
  'Yemen': [15.5527, 48.5164],
  'Oman': [21.5126, 55.9233],
  'UAE': [23.4241, 53.8478],
  'Qatar': [25.3548, 51.1839],
  'Bahrain': [26.0667, 50.5577],
  'Kuwait': [29.3117, 47.4818],
  'Iraq': [33.2232, 43.6793],
  'Iran': [32.4279, 53.6880],
  'Afghanistan': [33.9391, 67.7100],
  'Pakistan': [30.3753, 69.3451],
  'Bangladesh': [23.6850, 90.3563],
  'Sri Lanka': [7.8731, 80.7718],
  'Nepal': [28.3949, 84.1240],
  'Bhutan': [27.5142, 90.4336],
  'Myanmar': [21.9162, 95.9560],
  'Thailand': [15.8700, 100.9925],
  'Vietnam': [14.0583, 108.2772],
  'Laos': [19.8563, 102.4955],
  'Cambodia': [12.5657, 104.9910],
  'Malaysia': [4.2105, 108.9758],
  'Singapore': [1.3521, 103.8198],
  'Indonesia': [-0.7893, 113.9213],
  'Philippines': [12.8797, 121.7740],
  'Taiwan': [23.6978, 120.9605],
  'Hong Kong': [22.3193, 114.1694],
  'Macau': [22.1987, 113.5439],
  'Mongolia': [46.8625, 103.8467],
  'Kazakhstan': [48.0196, 66.9237],
  'Uzbekistan': [41.3775, 64.5853],
  'Turkmenistan': [38.9697, 59.5563],
  'Tajikistan': [38.5358, 71.0965],
  'Kyrgyzstan': [41.2044, 74.7661],
  'Azerbaijan': [40.1431, 47.5769],
  'Georgia': [42.3154, 43.3569],
  'Armenia': [40.0691, 45.0382],
  'Cyprus': [35.1264, 33.4299],
  'Greece': [39.0742, 21.8243],
  'Albania': [41.1533, 20.1683],
  'North Macedonia': [41.6086, 21.7453],
  'Bosnia and Herzegovina': [43.9159, 17.6791],
  'Croatia': [45.1000, 15.2000],
  'Slovenia': [46.1512, 14.9955],
  'Hungary': [47.1625, 19.5033],
  'Slovakia': [48.6690, 19.6990],
  'Czech Republic': [49.8175, 15.4730],
  'Austria': [47.5162, 14.5501],
  'Switzerland': [46.8182, 8.2275],
  'Liechtenstein': [47.1660, 9.5554],
  'Luxembourg': [49.8153, 6.1296],
  'Belgium': [50.8503, 4.3517],
  'Denmark': [56.2639, 9.5018],
  'Sweden': [60.1282, 18.6435],
  'Norway': [60.4720, 8.4689],
  'Finland': [61.9241, 25.7482],
  'Iceland': [64.9631, -19.0208],
  'Ireland': [53.1424, -7.6921],
  'Portugal': [39.3999, -8.2245],
  'Andorra': [42.5, 1.5],
  'Monaco': [43.7384, 7.4246],
  'San Marino': [43.9424, 12.4578],
  'Vatican City': [41.9029, 12.4534],
  'Malta': [35.9375, 14.3754],
  'Estonia': [58.5953, 25.0136],
  'Latvia': [56.8796, 24.6032],
  'Lithuania': [55.1694, 23.8813],
  'Belarus': [53.7098, 27.9534],
  'Moldova': [47.4116, 28.3699],
  'Ukraine': [48.3794, 31.1656],
  'Romania': [45.9432, 24.9668],
  'Bulgaria': [42.7339, 25.4858],
  'Serbia': [44.0165, 21.0059],
  'Montenegro': [42.7087, 19.3744],
  'Kosovo': [42.6026, 20.9030],
  'Western Sahara': [24.2155, -12.8858]
};

// Function to get fallback coordinates if API fails
export function getFallbackCoordinates(countryName: string): [number, number] | null {
  return fallbackCoordinates[countryName] || null;
}
