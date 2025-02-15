
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from './components/AudioPlayer';
import { search, getArtistDetails, getPlaylistItems } from "./services/youtubeService";
import ArtistView from './components/ArtistView';

const { width } = Dimensions.get("window");

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState({ songs: [], playlists: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [originalPlaylist, setOriginalPlaylist] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const searchResults = await search(query, activeTab);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleArtistSelect = async (artist) => {
    try {
      setLoading(true);
      setError(null);
      const details = await getArtistDetails(artist.id);
      setSelectedArtist(artist);
      setArtistSongs(details.songs);
    } catch (error) {
      console.error('Error loading artist:', error);
      setError('Failed to load artist details');
    } finally {
      setLoading(false);
    }
  };

  // const handlePlaylistSelect = async (playlist) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const songs = await getPlaylistItems(playlist.id);
  //     setOriginalPlaylist(songs); // Store original playlist order
  //     setCurrentPlaylist(songs);
  //     setCurrentPlaylistIndex(0);
  //     setCurrentTrack(songs[0]);
  //     setPlaying(true);
  //   } catch (error) {
  //     console.error('Error loading playlist:', error);
  //     setError('Failed to load playlist');
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  const handlePlaylistSelect = async (playlist) => {
    try {
      setLoading(true);
      setError(null);
      
      const songs = await getPlaylistItems(playlist.id);
      setOriginalPlaylist(songs); // Store original order
      setCurrentPlaylist(songs);
      setCurrentPlaylistIndex(0);
      setCurrentTrack(null); // Don't autoplay immediately
  
    } catch (error) {
      console.error('Error loading playlist:', error);
      setError('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSongSelect = (song) => {
    setCurrentPlaylist(null); // Clear playlist when selecting an individual song
    setCurrentPlaylistIndex(0);
    setCurrentTrack(song);
    setPlaying(true);
  };

  const handleNext = () => {
    if (currentPlaylist) {
      // For playlists
      if (currentPlaylistIndex < currentPlaylist.length - 1) {
        setCurrentPlaylistIndex(prev => prev + 1);
        setCurrentTrack(currentPlaylist[currentPlaylistIndex + 1]);
      }
    } else if (selectedArtist && artistSongs.length > 0) {
      // For artist songs
      const currentIndex = artistSongs.findIndex(song => song.id === currentTrack.id);
      if (currentIndex < artistSongs.length - 1) {
        setCurrentTrack(artistSongs[currentIndex + 1]);
      }
    } else if (results.songs.length > 0) {
      // For individual songs
      const currentIndex = results.songs.findIndex(song => song.id === currentTrack.id);
      if (currentIndex < results.songs.length - 1) {
        setCurrentTrack(results.songs[currentIndex + 1]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPlaylist) {
      // For playlists
      if (currentPlaylistIndex > 0) {
        setCurrentPlaylistIndex(prev => prev - 1);
        setCurrentTrack(currentPlaylist[currentPlaylistIndex - 1]);
      }
    } else if (selectedArtist && artistSongs.length > 0) {
      // For artist songs
      const currentIndex = artistSongs.findIndex(song => song.id === currentTrack.id);
      if (currentIndex > 0) {
        setCurrentTrack(artistSongs[currentIndex - 1]);
      }
    } else if (results.songs.length > 0) {
      // For individual songs
      const currentIndex = results.songs.findIndex(song => song.id === currentTrack.id);
      if (currentIndex > 0) {
        setCurrentTrack(results.songs[currentIndex - 1]);
      }
    }
  };

  const handlePlayerStateChange = (state) => {
    if (state === 'ended') {
      if (currentPlaylist || selectedArtist || results.songs.length > 0) {
        handleNext(); // Automatically play the next song
      } else {
        setPlaying(false);
      }
    }
    
    // Update ad state
    if (state === 'video-cued' || state === 'buffering') {
      setIsAdPlaying(true);
    } else if (state === 'playing' || state === 'paused') {
      setIsAdPlaying(false);
    }
  };

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    if (!currentPlaylist) return;

    if (!isShuffleOn) {
      // Turn shuffle on
      const currentSong = currentPlaylist[currentPlaylistIndex];
      const shuffledPlaylist = shuffleArray(currentPlaylist);
      const newIndex = shuffledPlaylist.findIndex(song => song.id === currentSong.id);
      setCurrentPlaylist(shuffledPlaylist);
      setCurrentPlaylistIndex(newIndex);
    } else {
      // Turn shuffle off - restore original order
      const currentSong = currentPlaylist[currentPlaylistIndex];
      const newIndex = originalPlaylist.findIndex(song => song.id === currentSong.id);
      setCurrentPlaylist(originalPlaylist);
      setCurrentPlaylistIndex(newIndex);
    }
    setIsShuffleOn(!isShuffleOn);
  };

  const handleTogglePlay = () => {
    setPlaying(!playing);
  };

  const renderSongs = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Songs</Text>
      {results.songs.map((song) => (
        <TouchableOpacity
          key={song.id}
          style={styles.songItem}
          onPress={() => handleSongSelect(song)}
        >
          <Image 
            source={{ uri: song.thumbnail }} 
            style={styles.thumbnail} 
          />
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{song.title}</Text>
            <Text style={styles.songArtist}>{song.artist}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPlaylists = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Playlists</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {results.playlists.map((playlist) => (
          <TouchableOpacity
            key={playlist.id}
            style={styles.playlistItem}
            onPress={() => handlePlaylistSelect(playlist)}
          >
            <Image 
              source={{ uri: playlist.thumbnail }} 
              style={styles.playlistImage} 
            />
            <Text style={styles.playlistTitle}>{playlist.title}</Text>
            <Text style={styles.playlistChannel}>{playlist.channelTitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderArtists = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Artists</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {results.artists.map((artist) => (
          <TouchableOpacity
            key={artist.id}
            style={styles.artistItem}
            onPress={() => handleArtistSelect(artist)}
          >
            <Image 
              source={{ uri: artist.image[0].url }} 
              style={styles.artistImage} 
            />
            <Text style={styles.artistName}>{artist.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // const renderContent = () => {
  //   if (loading) {
  //     return <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />;
  //   }

  //   if (error) {
  //     return <Text style={styles.errorText}>{error}</Text>;
  //   }

  //   if (selectedArtist) {
  //     return (
  //       <ArtistView
  //         artist={selectedArtist}
  //         songs={artistSongs}
  //         onBack={() => setSelectedArtist(null)}
  //         onSongSelect={handleSongSelect}
  //       />
  //     );
  //   }

  //   return (
  //     <ScrollView style={styles.results}>
  //       {activeTab === "all" && (
  //         <>
  //           {results.songs.length > 0 && renderSongs()}
  //           {results.artists.length > 0 && renderArtists()}
  //           {results.playlists.length > 0 && renderPlaylists()}
  //         </>
  //       )}
  //       {activeTab === "songs" && results.songs.length > 0 && renderSongs()}
  //       {activeTab === "artists" && results.artists.length > 0 && renderArtists()}
  //       {activeTab === "playlists" && results.playlists.length > 0 && renderPlaylists()}
  //     </ScrollView>
  //   );
  // };


  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />;
    }
  
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
  
    if (selectedArtist) {
      return (
        <ArtistView
          artist={selectedArtist}
          songs={artistSongs}
          onBack={() => setSelectedArtist(null)}
          onSongSelect={handleSongSelect}
        />
      );
    }
  
    // **Show playlist songs when a playlist is selected**
    if (currentPlaylist) {
      return (
        <ScrollView style={styles.section}>
          <Text style={styles.sectionTitle}>Playlist Songs</Text>
          {currentPlaylist.map((song, index) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songItem}
              onPress={() => handleSongSelect(song)}
            >
              <Image source={{ uri: song.thumbnail }} style={styles.thumbnail} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songArtist}>{song.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }
  
    return (
      <ScrollView style={styles.results}>
        {activeTab === "all" && (
          <>
            {results.songs.length > 0 && renderSongs()}
            {results.artists.length > 0 && renderArtists()}
            {results.playlists.length > 0 && renderPlaylists()}
          </>
        )}
        {activeTab === "songs" && results.songs.length > 0 && renderSongs()}
        {activeTab === "artists" && results.artists.length > 0 && renderArtists()}
        {activeTab === "playlists" && results.playlists.length > 0 && renderPlaylists()}
      </ScrollView>
    );
  };
  


  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['all', 'songs', 'artists', 'playlists'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

      {currentTrack && (
        <AudioPlayer
          currentTrack={currentTrack}
          playlist={currentPlaylist}
          play={playing}
          onStateChange={handlePlayerStateChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onShuffle={handleShuffle}
          isShuffleOn={isShuffleOn}
          onTogglePlay={handleTogglePlay}
        />
      )}

      {isAdPlaying && (
        <View style={styles.adOverlay}>
          <Text style={styles.adOverlayText}>
            Advertisement playing...
          </Text>
          <Text style={styles.adOverlaySubText}>
            Please wait or skip if available
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#282828',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#1DB954',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#282828',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1DB954',
  },
  tabText: {
    color: '#B3B3B3',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  results: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  songInfo: {
    marginLeft: 12,
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  songArtist: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  artistItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  artistName: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    padding: 16,
  },
  playlistItem: {
    width: 150,
    marginRight: 16,
  },
  playlistImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  playlistChannel: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 4,
  },
  adOverlay: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    alignItems: 'center',
  },
  adOverlayText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: 'bold',
  },
  adOverlaySubText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});

export default SearchScreen;