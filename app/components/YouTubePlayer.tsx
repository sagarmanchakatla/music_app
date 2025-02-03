import React, { forwardRef, useEffect } from 'react';
import { Platform, View } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { Audio } from 'expo-av';

const YouTubePlayer = forwardRef(({ videoId, play, onStateChange }, ref) => {
  useEffect(() => {
    setupAudio();
    return () => cleanupAudio();
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const cleanupAudio = async () => {
    try {
      await Audio.setIsEnabledAsync(false);
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <iframe
        width="0"
        height="0"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${play ? 1 : 0}&enablejsapi=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <View style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
      <YoutubeIframe
        ref={ref}
        height={1}
        width={1}
        videoId={videoId}
        play={play}
        onChangeState={onStateChange}
        forceAndroidAutoplay={true}
        webViewProps={{
          mediaPlaybackRequiresUserAction: false,
          allowsInlineMediaPlayback: true,
          androidLayerType: 'hardware',
        }}
      />
    </View>
  );
});

export default YouTubePlayer;