import React, {Component, useState, useEffect} from 'react';
import { Alert, View, Text, Button} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {lineString as makeLineString} from '@turf/helpers';
import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';
import Geolocation from '@react-native-community/geolocation';

const accessToken = 'pk.eyJ1IjoiYTJyaiIsImEiOiJja2g3OW11N3MwNmh1MzBsbDQ4NGVrYWNtIn0.uvhpm1k_6EIRZXyOhHq7QQ';

MapboxGL.setAccessToken(accessToken);

const directionsClient = MapboxDirectionsFactory({accessToken});

export default App = () => {
  
  const [startingPoint, setStartingPoint] = useState([])
  const destinationPoint = [ 117.42784,-8.50641];
  const [route, setRoute] = useState(null);

  const startDestinationPoints = [startingPoint,  destinationPoint]

  useEffect(() => {
    findCoordinates()
  }, [])

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        const location = [position.coords.longitude, position.coords.latitude];
        // const location = [117.43241,-8.49731];
        setStartingPoint(location)
        fetchRoute(location)
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };


  const fetchRoute = async (location) => {
    console.log(location);
    // await findCoordinates()
    const reqOptions = {
      waypoints: [
        {coordinates: location},
        {coordinates: destinationPoint},
      ],
      profile: 'driving-traffic',
      geometries: 'geojson',
    };

    const res = await directionsClient.getDirections(reqOptions).send();

    const newRoute = makeLineString(res.body.routes[0].geometry.coordinates);
    // console.log(newRoute);
    setRoute(newRoute);
  };

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
          />
        </MapboxGL.PointAnnotation>
      ))
    );
  }


  return startingPoint.length > 0 ? (
    <View style={{flex: 1, height: "100%", width: "100%" }}>
      <MapboxGL.MapView
        styleURL={MapboxGL.StyleURL.Street}
        zoomLevel={11}
        zoomLevel={true}
        centerCoordinate={startingPoint}
        style={{flex: 1}}>
          <MapboxGL.Camera
            zoomLevel={11}
            centerCoordinate={startingPoint}
            animationMode={'flyTo'}
            animationDuration={0}
            >
          </MapboxGL.Camera>
          <MapboxGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={false}
          />
          {renderAnnotations()}
          {
            route && (
              <MapboxGL.ShapeSource id='shapeSource' shape={route}>
              <MapboxGL.LineLayer id='lineLayer' style={{lineWidth: 5, lineJoin: 'bevel', lineColor: '#ff0000'}} />
            </MapboxGL.ShapeSource>
          )
        }
      </MapboxGL.MapView>
    </View>
  ) : 
  <View>
    <Text>Lokasi tidak ditemukan { startingPoint }</Text>
    <Button
      onPress={findCoordinates}
      title="Learn More"
      color="#841584"
      accessibilityLabel="Learn more about this purple button"
    />
  </View>
}