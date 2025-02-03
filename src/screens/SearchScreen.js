import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { searchContent } from "../../app/services/youtubeApi";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    songs: [],
    playlists: [],
    artists: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("songs");

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
    <TouchableOpacity style={styles.itemContainer}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for songs, artists, or playlists..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />

      <View style={styles.tabContainer}>
        {["songs", "playlists", "artists"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      ) : (
        <FlatList
          data={results[activeTab]}
          renderItem={renderItem}
          keyExtractor={(item) => item.url}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: "#282828",
    borderRadius: 8,
    color: "#FFFFFF",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    marginRight: 16,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1DB954",
  },
  tabText: {
    color: "#B3B3B3",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFFFFF",
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
});

export default SearchScreen;
