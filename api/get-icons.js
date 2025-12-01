// API route: /api/get-icons.js
// Fetches the current icon data from the repository

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch the icons.json file from the GitHub repository
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/data/icons.json`;
    
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch icons data: ${response.statusText}`);
    }

    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching icons:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch icons data',
      message: error.message 
    });
  }
}
