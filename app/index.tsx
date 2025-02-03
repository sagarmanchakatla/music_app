import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Audio } from 'expo-av';
import WebView from './components/CustomWebView';
import YouTubePlayer from './components/YouTubePlayer';
import { searchContent } from "./services/youtubeApi";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    songs: [],
    playlists: [],
    artists: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("songs");
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const playerRef = React.useRef(null);

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  const handlePlayPause = (item) => {
    if (currentTrack?.id === item.id) {
      setPlaying(!playing);
    } else {
      setCurrentTrack(item);
      setPlaying(true);
    }
    setPlayerVisible(true);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchContent(query);
      setResults(searchResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.itemContainer,
        currentTrack?.id === item.id && styles.activeItem
      ]}
      onPress={() => handlePlayPause(item)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      {currentTrack?.id === item.id && (
        <View style={styles.playingIndicator}>
          <Ionicons 
            name={playing ? "pause-circle" : "play-circle"} 
            size={32} 
            color="#1DB954"
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const MiniPlayer = () => {
    if (!currentTrack) return null;

    return (
      <LinearGradient
        colors={['#282828', '#181818']}
        style={styles.miniPlayer}
      >
        <TouchableOpacity 
          style={styles.miniPlayerContent}
          onPress={() => setPlayerVisible(true)}
        >
          <Image 
            source={{ uri: currentTrack.thumbnail }} 
            style={styles.miniPlayerThumbnail} 
          />
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>
              {currentTrack.description}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.miniPlayerButton}
            onPress={(e) => {
              e.stopPropagation();
              setPlaying(!playing);
            }}
          >
            <Ionicons 
              name={playing ? "pause-circle" : "play-circle"} 
              size={36} 
              color="#1DB954"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#121212', '#282828']}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for songs, artists, or playlists..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        <View style={styles.tabContainer}>
          {["songs", "playlists", "artists"].map((tab) => (
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
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      ) : (
        <FlatList
          data={results[activeTab]}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      {currentTrack && (
        <YouTubePlayer
          ref={playerRef}
          videoId={currentTrack.id}
          play={playing}
          onStateChange={onStateChange}
        />
      )}

      {currentTrack && !playerVisible && <MiniPlayer />}

      <Modal
        visible={playerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPlayerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#282828', '#121212']}
            style={styles.playerContainer}
          >
            <View style={styles.playerHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPlayerVisible(false)}
              >
                <Ionicons name="chevron-down" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {currentTrack && (
              <>
                <Image 
                  source={{ uri: currentTrack.thumbnail }} 
                  style={styles.playerThumbnail}
                />
                <Text style={styles.playerTitle}>{currentTrack.title}</Text>
                <Text style={styles.playerArtist}>{currentTrack.description}</Text>
                
                <View style={styles.controls}>
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="shuffle" size={24} color="#B3B3B3" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="play-skip-back" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => setPlaying(!playing)}
                  >
                    <Ionicons 
                      name={playing ? "pause-circle" : "play-circle"} 
                      size={64} 
                      color="#1DB954"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="play-skip-forward" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="repeat" size={24} color="#B3B3B3" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: "#FFFFFF10",
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tab: {
    marginRight: 24,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1DB954",
  },
  tabText: {
    color: "#B3B3B3",
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 60,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    color: "#B3B3B3",
    marginTop: 4,
  },
  loader: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  activeItem: {
    backgroundColor: '#282828',
  },
  playingIndicator: {
    padding: 8,
    justifyContent: 'center',
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  miniPlayerThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniPlayerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniPlayerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
  },
  miniPlayerArtist: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 4,
  },
  miniPlayerButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  playerContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    height: '80%',
  },
  closeButton: {
    alignSelf: 'center',
    padding: 10,
    marginBottom: 20,
  },
  playerThumbnail: {
    width: width - 80,
    height: width - 80,
    borderRadius: 8,
    marginBottom: 20,
  },
  playerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  playerArtist: {
    color: '#B3B3B3',
    fontSize: 16,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    marginHorizontal: 20,
  },
  playerHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default SearchScreen;
