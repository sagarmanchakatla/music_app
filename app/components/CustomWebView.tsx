import React from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const CustomWebView = (props) => {
  if (Platform.OS === 'web') {
    return <iframe {...props} />;
  }
  return <WebView {...props} />;
};

export default CustomWebView;