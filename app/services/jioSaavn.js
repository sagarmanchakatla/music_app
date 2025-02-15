import axios from "axios";

const BASE_URL = "https://saavn.dev/api";

const formatSongUrl = (downloadUrl) => {
  if (!downloadUrl) return null;
  // Get the highest quality URL available
  const url = downloadUrl[4]?.link || downloadUrl[3]?.link || downloadUrl[2]?.link || downloadUrl[1]?.link || downloadUrl[0]?.link;
  if (!url) return null;

  // Convert to HTTPS and add required parameters
  return url.replace('http://', 'https://') + '?_=123';
};

const formatSong = (song) => ({
  id: song.id,
  title: song.name,
  artist: song.primaryArtists,
  thumbnail: song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link,
  url: formatSongUrl(song.downloadUrl),
  duration: song.duration
});

export const search = async (query, type = "all") => {
  try {
    let results = {
      songs: [],
      albums: [],
      artists: [],
      playlists: []
    };

    if (type === "all" || type === "songs") {
      const songsResponse = await axios.get(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}`);
      results.songs = (songsResponse.data?.data?.results || []).map(formatSong);
    }

    if (type === "all" || type === "artists") {
      const artistsResponse = await axios.get(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}`);
      results.artists = artistsResponse.data?.data?.results || [];
    }

    if (type === "all" || type === "albums") {
      const albumsResponse = await axios.get(`${BASE_URL}/search/albums?query=${encodeURIComponent(query)}`);
      results.albums = albumsResponse.data?.data?.results || [];
    }

    if (type === "all" || type === "playlists") {
      const playlistsResponse = await axios.get(`${BASE_URL}/search/playlists?query=${encodeURIComponent(query)}`);
      results.playlists = playlistsResponse.data?.data?.results || [];
    }

    return results;
  } catch (error) {
    console.error('Error searching:', error);
    return { songs: [], albums: [], artists: [], playlists: [] };
  }
};

export const getArtistDetails = async (artistId) => {
  try {
    const songsResponse = await axios.get(`${BASE_URL}/artists/${artistId}/songs`);
    const songs = songsResponse.data?.data?.results || [];

    // Format songs to include necessary information
    const formattedSongs = songs.map(formatSong);

    return {
      songs: formattedSongs
    };
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return { songs: [] };
  }
};