import axios from "axios";

const BASE_URL = "https://saavn.dev/api";

export const searchArtists = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}`);
    console.log('Artist Search Response:', response.data.data.results);

    if (!response.data?.data?.results) {
      throw new Error('Invalid API response structure');
    }

    return response.data.data.results.map(artist => ({
      id: artist.id,
      name: artist.name,
      role: artist.role,
      image: artist.image?.[2]?.url || artist.image?.[1]?.url || artist.image?.[0]?.url,
      type: artist.type,
      url: artist.url
    }));
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
};

export const getArtistDetails = async (artistId) => {
  try {
    const response = await axios.get(`${BASE_URL}/artists/${artistId}/songs`);
    console.log('Artist Details Response:', response.data);

    if (!response.data?.data) {
      throw new Error('Invalid API response structure');
    }

    return {
      songs: (response.data.data.results || []).map(song => ({
        id: song.id,
        title: song.name,
        artist: song.primaryArtists,
        thumbnail: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url,
        url: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || song.downloadUrl?.[2]?.url,
        duration: song.duration
      }))
    };
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return { songs: [] };
  }
};

export const searchContent = async (query, type = 'all') => {
  try {
    let results = { artists: [], songs: [], playlists: [] };

    if (type === 'all' || type === 'artists') {
      const artists = await searchArtists(query);
      results.artists = artists;
    }

    if (type === 'all' || type === 'songs') {
      const songsResponse = await axios.get(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}`);
      if (songsResponse.data?.data?.results) {
        results.songs = songsResponse.data.data.results.map(song => ({
          id: song.id,
          title: song.name,
          artist: song.primaryArtists,
          thumbnail: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url,
          url: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || song.downloadUrl?.[2]?.url,
          duration: song.duration
        }));
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching:', error);
    return { artists: [], songs: [], playlists: [] };
  }
};

export const testApiConnection = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/search/songs?query=test`, {
      headers: { Accept: '*/*' }
    });
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