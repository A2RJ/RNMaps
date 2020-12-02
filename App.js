import React, { useState, useEffect, useRef } from 'react';
import { Alert, View, Text, Button } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { lineString as makeLineString } from '@turf/helpers';
import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';
import Geolocation from '@react-native-community/geolocation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import openMap, { createOpenLink } from 'react-native-open-maps'

const accessToken = 'pk.eyJ1IjoiYTJyaiIsImEiOiJja2g3OW11N3MwNmh1MzBsbDQ4NGVrYWNtIn0.uvhpm1k_6EIRZXyOhHq7QQ';

MapboxGL.setAccessToken(accessToken);

const directionsClient = MapboxDirectionsFactory({ accessToken });
const destinationPoint = [117.42784, -8.50641];

export default App = () => {
  const map = useRef(null);
  const [startingPoint, setStartingPoint] = useState([])
  const [route, setRoute] = useState(null);
  const startDestinationPoints = [startingPoint, destinationPoint]

  useEffect(() => {
    findCoordinates()
  }, [])

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        const location = [position.coords.longitude, position.coords.latitude];
        setStartingPoint(location)
        findRoute(location)
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const findRoute = async (location) => {
    const reqOptions = {
      waypoints: [
        { coordinates: location },
        { coordinates: destinationPoint },
      ],
      profile: 'driving-traffic',
      geometries: 'geojson',
    };

    const res = await directionsClient.getDirections(reqOptions).send();
    const newRoute = makeLineString(res.body.routes[0].geometry.coordinates);
    setRoute(newRoute);
  }

  const onRegionDidChange = async () => {
      await map.current.flyTo();
      // setStartingPoint(startingPoint);
  }

  const renderAnnotations = () => {
    return (
      startDestinationPoints.map((point, index) => (
        <MapboxGL.PointAnnotation
          key={`${index}-PointAnnotation`}
          id={`${index}-PointAnnotation`}
          coordinate={point}>
          <View style={{
            height: 30,
            width: 30,
            backgroundColor: '#00cccc',
            borderRadius: 50,
            borderColor: '#fff',
            borderWidth: 3
          }}
          ></View>
        </MapboxGL.PointAnnotation>
      ))
    );
  }

  return startingPoint.length > 0 ? (
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView
        ref={ map }
        styleURL={MapboxGL.StyleURL.Street}
        zoomLevel={15}
        zoomEnabled={true}
        centerCoordinate={startingPoint}
        rotateEnabled={true}
        logoEnabled={false}
        compassEnabled={true}
        showUserLocation={true}
        onRegionDidChange={onRegionDidChange}
        // onUserLocationUpdate={state yg akan merubah coords}
        // userTrackingMode={MapboxGL.UserTrackingModes.Follow}
        style={{ flex: 1 }}>
        <MapboxGL.Camera
          zoomLevel={15}
          centerCoordinate={startingPoint}
          animationMode={'flyTo'}
          animationDuration={2000}
          followUserLocation={true}
          followUserMode="compass"
          followZoomLevel={15} />
        {/* Untuk menampilkan icon driver, agar dapat tracking maka connect socket.io kemudian coordinates listen
          hanya render ulang markerview dan renderAnnotations saja */}
        <MapboxGL.MarkerView coordinate={startingPoint}>
          <FontAwesomeIcon icon={faCoffee} />
        </MapboxGL.MarkerView>
        
        {renderAnnotations()}
        {route && (
          <MapboxGL.ShapeSource id='shapeSource' shape={route}>
            <MapboxGL.LineLayer id='lineLayer' style={{ lineWidth: 5, lineJoin: 'bevel', lineColor: '#ff0000' }} />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
      <Button onPress={ onRegionDidChange }
      title="Go to" style={{
            position: 'absolute',
            bottom: 0,
            width: '100%'
          }} />
    </View>
  ) :
    <View>
      <Button onPress={() => findCoordinates()} title="Pick location"  style={{
            position: 'absolute',
            bottom: 0,
            width: '100%'
          }}/>
    </View>
}