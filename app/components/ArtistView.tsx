import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ArtistView = ({ artist, songs, onBack, onSongSelect }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image 
          source={{ 
            uri: artist.image?.[2]?.url || 
                 artist.image?.[1]?.url || 
                 artist.image?.[0]?.url || 
                 'https://www.jiosaavn.com/_i/3.0/artist-default-music.png'
          }} 
          style={styles.artistImage} 
        />
        <Text style={styles.artistName}>{artist.name || 'Unknown Artist'}</Text>
        <Text style={styles.artistRole}>{artist.role || 'Artist '}</Text>
      </View>

      <FlatList
        data={songs}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.songItem}
            onPress={() => onSongSelect(item)}
          >
            <Image 
              source={{ uri: item.thumbnail }} 
              style={styles.songThumbnail} 
            />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No songs available</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
  },
  artistImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  artistName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artistRole: {
    color: '#B3B3B3',
    fontSize: 16,
  },
  songItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  songThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  songInfo: {
    marginLeft: 16,
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  songArtist: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ArtistView; 