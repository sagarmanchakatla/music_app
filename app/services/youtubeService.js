import axios from "axios";

const API_KEY = "AIzaSyBe6hKp5D_VNizwr1BvhDxpbbH4IuJWVZ4"; // Replace with your YouTube API key
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const formatVideoToSong = (video) => ({
  id: video.id.videoId || video.id,
  title: video.snippet.title,
  artist: video.snippet.channelTitle,
  thumbnail: video.snippet.thumbnails.medium.url,
  url: `https://www.youtube.com/watch?v=${video.id.videoId || video.id}`,
  duration: video.contentDetails?.duration || null
});

const formatChannelToArtist = (channel) => ({
  id: channel.id.channelId,
  name: channel.snippet.title,
  image: [{ url: channel.snippet.thumbnails.medium.url }],
  role: channel.snippet.description
});

const formatPlaylistItem = (playlist) => ({
  id: playlist.id.playlistId,
  name: playlist.snippet.title,
  image: [{ url: playlist.snippet.thumbnails.medium.url }],
  songCount: 0, // Requires additional API call
  description: playlist.snippet.description
});

export const search = async (query, type = "all") => {
  try {
    let results = {
      songs: [],
      playlists: [],
      artists: []
    };

    if (type === "all" || type === "songs") {
      const videosResponse = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: `${query} songs`,
          type: 'video',
          videoCategoryId: '10', // Music category
          maxResults: 15,
          key: API_KEY
        }
      });
      
      // Get video details for duration
      const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
      const videoDetailsResponse = await axios.get(`${BASE_URL}/videos`, {
        params: {
          part: 'contentDetails,snippet',
          id: videoIds,
          key: API_KEY
        }
      });
      
      results.songs = videoDetailsResponse.data.items.map(formatVideoToSong);
    }

    if (type === "all" || type === "playlists") {
      const playlistsResponse = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: `${query} playlist`,
          type: 'playlist',
          maxResults: 10,
          key: API_KEY
        }
      });

      results.playlists = playlistsResponse.data.items.map(playlist => ({
        id: playlist.id.playlistId,
        title: playlist.snippet.title,
        thumbnail: playlist.snippet.thumbnails.medium.url,
        channelTitle: playlist.snippet.channelTitle,
        url: `https://www.youtube.com/playlist?list=${playlist.id.playlistId}`
      }));
    }

    if (type === "all" || type === "artists") {
      const channelsResponse = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: `${query} music artist`,
          type: 'channel',
          maxResults: 10,
          key: API_KEY
        }
      });

      results.artists = channelsResponse.data.items.map(channel => ({
        id: channel.id.channelId,
        name: channel.snippet.title,
        image: [{ url: channel.snippet.thumbnails.medium.url }],
        description: channel.snippet.description
      }));
    }

    return results;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

export const getPlaylistItems = async (playlistId) => {
  try {
    const response = await axios.get(`${BASE_URL}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: 50,
        key: API_KEY
      }
    });

    const items = response.data.items;
    const videoIds = items.map(item => item.contentDetails.videoId).join(',');

    // Get video details for duration
    const videoDetailsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,snippet',
        id: videoIds,
        key: API_KEY
      }
    });

    return videoDetailsResponse.data.items.map(formatVideoToSong);
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    throw error;
  }
};

export const getArtistDetails = async (channelId) => {
  try {
    // Get channel's uploads playlist
    const channelResponse = await axios.get(`${BASE_URL}/channels`, {
      params: {
        part: 'contentDetails,snippet',
        id: channelId,
        key: API_KEY
      }
    });

    const channel = channelResponse.data.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const songs = await getPlaylistItems(uploadsPlaylistId);

    return {
      artist: {
        id: channelId,
        name: channel.snippet.title,
        image: [{ url: channel.snippet.thumbnails.medium.url }],
        description: channel.snippet.description
      },
      songs
    };
  } catch (error) {
    console.error('Error fetching artist details:', error);
    throw error;
  }
}; 