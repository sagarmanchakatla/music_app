import axios from "axios";

const BASE_URL = "https://deezerdevs-deezer.p.rapidapi.com";

// Create axios instance with RapidAPI headers
const api = axios.create({
  headers: {
    'X-RapidAPI-Key': '8c78690e61msh423d7efbbd7b5bap192fdfjsn055b24ca7d3a', // You'll need to sign up at RapidAPI
    'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
  }
});

export const searchContent = async (query) => {
  try {
    console.log("Searching for:", query);
    const encodedQuery = encodeURIComponent(query);
    
    // Using RapidAPI endpoints
    const songsRes = await api.get(`${BASE_URL}/search?q=${encodedQuery}`);
    console.log("API Response:", songsRes.data);

    // Process and return the results
    return {
      songs: (songsRes.data.data || []).map(track => ({
        id: track.id.toString(),
        title: track.title,
        description: track.artist.name,
        thumbnail: track.album.cover_medium || track.album.cover,
        artist: track.artist.name,
        duration: track.duration,
        preview: track.preview,
        albumName: track.album.title,
        url: track.link
      })),
      playlists: [], // RapidAPI Deezer doesn't support playlist search directly
      artists: []    // RapidAPI Deezer doesn't support artist search directly
    };
  } catch (error) {
    console.error("Error searching music:", error.response?.data || error.message);
    return {
      songs: [],
      playlists: [],
      artists: []
    };
  }
};

export const testApiConnection = async () => {
  try {
    const response = await api.get(`${BASE_URL}/search?q=test`);
    console.log("API connection successful");
    return true;
  } catch (error) {
    console.error("API connection failed:", error);
    return false;
  }
};

export default {
  searchContent,
  testApiConnection
}; 