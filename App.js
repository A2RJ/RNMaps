import React, { useEffect, useState } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, StyleSheet, Text, View, Dimensions, ActivityIndicator, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const initialState = {
  latitude: null,
  longitude: null,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}
const App = () => {

  const [currentPosition, setCurrentPosititon] = useState(initialState);

  useEffect(() =>{
    Geolocation.getCurrentPosition(
      info => {
        const { latitude, longitude} = info.coords
        setCurrentPosititon({
          ...currentPosition,
          latitude,
          longitude
        });
      },
      error => Alert.alert(error.message + "error bang"),
      { timeout: 20000, maximumAge: 1000 }
    )
    
  });

  return currentPosition.latitude ? (
    <View style={styles.container}>
      <MapView style={styles.mapStyle}
        provider= { PROVIDER_GOOGLE }
        showsUserLocation
        initialRegion={currentPosition} />
    </View>
  ) : <ActivityIndicator style={{flex:1}} animating size="large" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default App;

