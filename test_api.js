// Test Instagram API endpoint
const RAPIDAPI_KEY = 'd1d36e7c26mshe6eec42e04a14f8p19a837jsn0086949ddfba';
const RAPIDAPI_HOST = 'instagram-looter2.p.rapidapi.com';

// Test with real Instagram account
async function testInstagramAPI() {
  try {
    console.log('Testing Instagram API...');
    
    const response = await fetch(`https://${RAPIDAPI_HOST}/profile?username=instagram`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Raw Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check what fields are available
    if (data) {
      console.log('\nAvailable top-level fields:');
      Object.keys(data).forEach(key => {
        console.log(`- ${key}: ${typeof data[key]}`);
      });
      
      // If data has a nested structure, explore it
      if (data.data) {
        console.log('\nNested data.data fields:');
        Object.keys(data.data).forEach(key => {
          console.log(`- ${key}: ${typeof data.data[key]}`);
          if (key === 'follower_count' || key === 'follower_count') {
            console.log(`  Value: ${data.data[key]}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testInstagramAPI();