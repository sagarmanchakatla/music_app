// youtubeApi.js
import axios from "axios";

const YOUTUBE_API_KEY = "AIzaSyBe6hKp5D_VNizwr1BvhDxpbbH4IuJWVZ4";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export const searchContent = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: "snippet",
        q: query,
        type: "video,playlist,channel",
        maxResults: 5,
        key: YOUTUBE_API_KEY,
      },
    });

    const results = {
      songs: [],
      playlists: [],
      artists: [],
    };

    response.data.items.forEach((item) => {
      const itemType = item.id.kind.split("#")[1];
      const entry = {
        id: itemType === 'video' ? item.id.videoId : 
            itemType === 'playlist' ? item.id.playlistId : 
            item.id.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        url: "",
        type: itemType,
      };

      switch (itemType) {
        case "video":
          entry.url = `https://www.youtube.com/watch?v=${item.id.videoId}`;
          results.songs.push(entry);
          break;
        case "playlist":
          entry.url = `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
          results.playlists.push(entry);
          break;
        case "channel":
          entry.url = `https://www.youtube.com/channel/${item.id.channelId}`;
          results.artists.push(entry);
          break;
      }
    });
    // console.log(results);
    return results;
  } catch (error) {
    console.error("Error searching YouTube:", error);
    throw error;
  }
};