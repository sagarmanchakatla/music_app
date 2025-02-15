

// import React, { forwardRef, useEffect } from 'react';
// import { Platform, View } from 'react-native';
// import YoutubeIframe from 'react-native-youtube-iframe';
// import { Audio } from 'expo-av';

// const YouTubePlayer = forwardRef(({ videoId, play, onStateChange }, ref) => {
//   useEffect(() => {
//     setupAudio();
//     return () => cleanupAudio();
//   }, []);

//   const setupAudio = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         staysActiveInBackground: true,
//         playsInSilentModeIOS: true,
//         shouldDuckAndroid: true,
//         playThroughEarpieceAndroid: false,
//       });
//     } catch (error) {
//       console.error('Error setting up audio:', error);
//     }
//   };

//   const cleanupAudio = async () => {
//     try {
//       await Audio.setIsEnabledAsync(false);
//     } catch (error) {
//       console.error('Error cleaning up audio:', error);
//     }
//   };

//   // Extract video ID from YouTube URL if needed
//   const getYouTubeId = (url) => {
//     if (!url) return '';
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : '';
//   };

//   const actualVideoId = videoId.includes('youtube.com') ? getYouTubeId(videoId) : videoId;

//   if (Platform.OS === 'web') {
//     return (
//       <iframe
//         width="0"
//         height="0"
//         src={`https://www.youtube.com/embed/${actualVideoId}?autoplay=${play ? 1 : 0}&enablejsapi=1`}
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//         allowFullScreen
//         style={{ display: 'none' }}
//       />
//     );
//   }

//   return (
//     <View style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
//       <YoutubeIframe
//         ref={ref}
//         height={1}
//         width={1}
//         videoId={actualVideoId}
//         play={play}
//         onChangeState={onStateChange}
//         forceAndroidAutoplay={true}
//         webViewProps={{
//           mediaPlaybackRequiresUserAction: false,
//           allowsInlineMediaPlayback: true,
//           androidLayerType: 'hardware',
//         }}
//       />
//     </View>
//   );
// });

// export default YouTubePlayer;



import React, { forwardRef, useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { Audio } from 'expo-av';
import * as Progress from 'react-native-progress';

const YouTubePlayer = forwardRef(({ 
  videoId, 
  play, 
  onStateChange,
  onProgress: parentOnProgress 
}, ref) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

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

  const getYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleProgress = (event) => {
    const { currentTime, duration } = event;
    setProgress(currentTime);
    setDuration(duration);
    
    if (parentOnProgress) {
      parentOnProgress(event);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const actualVideoId = videoId.includes('youtube.com') ? getYouTubeId(videoId) : videoId;

  return (
    <View style={styles.container}>
      <YoutubeIframe
        ref={ref}
        height={0}
        width={0}
        videoId={actualVideoId}
        play={play}
        onChangeState={onStateChange}
        onProgress={handleProgress}
        forceAndroidAutoplay={true}
        initialPlayerParams={{
          preventFullScreen: true,
          controls: false,
          modestbranding: true,
        }}
      />
      
      <View style={styles.progressContainer}>
        <Progress.Bar
          progress={duration > 0 ? progress / duration : 0}
          width={300}
          height={3}
          color="#1DB954"
          unfilledColor="#444"
          borderWidth={0}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(progress)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  timeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  timeText: {
    color: '#B3B3B3',
    fontSize: 12,
  },
});

export default YouTubePlayer;