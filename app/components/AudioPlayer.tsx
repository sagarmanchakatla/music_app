import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Modal } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AudioPlayer = ({ 
  currentTrack, 
  playlist, 
  play, 
  onStateChange,
  onNext,
  onPrevious,
  onShuffle,
  isShuffleOn,
  onTogglePlay
}) => {
  const [videoId, setVideoId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (currentTrack?.url) {
      const videoId = extractVideoId(currentTrack.url);
      setVideoId(videoId);
    }
  }, [currentTrack]);

  const extractVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const toggleExpandedView = () => {
    setIsExpanded(!isExpanded);
  };

  if (!videoId) return null;

  return (
    <>
      {/* Minimized Player */}
      <TouchableOpacity onPress={toggleExpandedView} style={styles.minimizedContainer}>
        <Image source={{ uri: currentTrack.thumbnail }} style={styles.thumbnail} />
        <View style={styles.titleContainer}>
          <Text style={styles.songTitle} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
        <TouchableOpacity onPress={onTogglePlay} style={styles.controlButton}>
          <Ionicons name={play ? "pause" : "play"} size={30} color="#FFF" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Expanded Player */}
      <Modal
        visible={isExpanded}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleExpandedView}
      >
        <View style={styles.expandedContainer}>
          {/* Fullscreen Background */}
          <Image source={{ uri: currentTrack.thumbnail }} style={styles.backgroundImage} />
          <View style={styles.overlay} />

          {/* Close Button */}
          <TouchableOpacity onPress={toggleExpandedView} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>

          {/* Track Info */}
          <Image source={{ uri: currentTrack.thumbnail }} style={styles.expandedThumbnail} />
          <Text style={styles.expandedTitle}>{currentTrack.title}</Text>
          <Text style={styles.expandedArtist}>{currentTrack.artist}</Text>

          {/* Playback Controls */}
          <View style={styles.expandedControls}>
            <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onTogglePlay} style={styles.controlButton}>
              <Ionicons name={play ? "pause" : "play"} size={40} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Shuffle Button */}
          <TouchableOpacity onPress={onShuffle} style={styles.shuffleButton}>
            <Ionicons name="shuffle" size={28} color={isShuffleOn ? "#1DB954" : "#FFF"} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* YouTube Player (Hidden in UI) */}
      <YoutubePlayer
        height={0}
        play={play}
        videoId={videoId}
        onStateChange={onStateChange}
        initialPlayerParams={{
          preventFullScreen: true,
          controls: false,
          modestbranding: true,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  minimizedContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  songTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  controlButton: {
    padding: 8,
  },
  expandedContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  expandedThumbnail: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  expandedTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  expandedArtist: {
    color: '#B3B3B3',
    fontSize: 18,
    marginBottom: 20,
  },
  expandedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: width * 0.8,
    marginBottom: 20,
  },
  shuffleButton: {
    position: 'absolute',
    bottom: 40,
  },
});

export default AudioPlayer;
