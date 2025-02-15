// // youtubeApi.js
// import axios from "axios";

// const YOUTUBE_API_KEY = "AIzaSyBe6hKp5D_VNizwr1BvhDxpbbH4IuJWVZ4";
// const BASE_URL = "https://www.googleapis.com/youtube/v3";

// export const searchContent = async (query) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/search`, {
//       params: {
//         part: "snippet",
//         q: query,
//         type: "video,playlist,channel",
//         maxResults: 5,
//         key: YOUTUBE_API_KEY,
//       },
//     });

//     const results = {
//       songs: [],
//       playlists: [],
//       artists: [],
//     };

//     response.data.items.forEach((item) => {
//       const itemType = item.id.kind.split("#")[1];
//       const entry = {
//         id: itemType === 'video' ? item.id.videoId : 
//             itemType === 'playlist' ? item.id.playlistId : 
//             item.id.channelId,
//         title: item.snippet.title,
//         description: item.snippet.description,
//         thumbnail: item.snippet.thumbnails.high.url,
//         url: "",
//         type: itemType,
//       };

//       switch (itemType) {
//         case "video":
//           entry.url = `https://www.youtube.com/watch?v=${item.id.videoId}`;
//           results.songs.push(entry);
//           break;
//         case "playlist":
//           entry.url = `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
//           results.playlists.push(entry);
//           break;
//         case "channel":
//           entry.url = `https://www.youtube.com/channel/${item.id.channelId}`;
//           results.artists.push(entry);
//           break;
//       }
//     });
//     // console.log(results);
//     return results;
//   } catch (error) {
//     console.error("Error searching YouTube:", error);
//     throw error;
//   }
// };

import axios from "axios";

const BASE_URL = "https://api.deezer.com";

export const searchContent = async (query) => {
  try {
    console.log("Searching for:", query);
    const [songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.all([
      axios.get(`${BASE_URL}/search/track?q=${query}&limit=20`),
      axios.get(`${BASE_URL}/search/album?q=${query}&limit=20`),
      axios.get(`${BASE_URL}/search/artist?q=${query}&limit=20`),
      axios.get(`${BASE_URL}/search/playlist?q=${query}&limit=20`),
    ]);

    return {
      songs: songsRes.data.data.map(track => ({
        id: track.id.toString(),
        title: track.title,
        description: track.artist.name,
        thumbnail: track.album.cover_medium,
        artist: track.artist.name,
        duration: track.duration,
        preview: track.preview,
        albumName: track.album.title,
        url: track.link
      })),
      
      playlists: playlistsRes.data.data.map(playlist => ({
        id: playlist.id.toString(),
        title: playlist.title,
        description: `${playlist.nb_tracks} tracks`,
        thumbnail: playlist.picture_medium,
        trackCount: playlist.nb_tracks,
        creator: playlist.creator?.name || 'Unknown',
        url: playlist.link
      })),

      artists: artistsRes.data.data.map(artist => ({
        id: artist.id.toString(),
        title: artist.name,
        description: `${artist.nb_fan || 0} fans`,
        thumbnail: artist.picture_medium,
        url: artist.link
      }))
    };
  } catch (error) {
    console.error("Error searching music:", error);
    return {
      songs: [],
      playlists: [],
      artists: []
    };
  }
};

export default {
  searchContent
};