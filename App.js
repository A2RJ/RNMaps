import React, {Component, useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {lineString as makeLineString} from '@turf/helpers';
import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';
import Geolocation from '@react-native-community/geolocation';

const accessToken = 'pk.eyJ1IjoiYTJyaiIsImEiOiJja2g3OW11N3MwNmh1MzBsbDQ4NGVrYWNtIn0.uvhpm1k_6EIRZXyOhHq7QQ';

MapboxGL.setAccessToken(accessToken);

const directionsClient = MapboxDirectionsFactory({accessToken});

export default App = () => {

  // Masih terdapat masalah yakni bagaimana cara melakukan request data 
  // current location user sekaligus dapat mengembalikan nilai
  // untuk route fecthRoute di useEffect
  
  // Bug latitude dan longitude pesan error must between -90 and 90
  
  const [A, setA] = useState([])
  const [route, setRoute] = useState(null);
  const startingPoint = [ 117.4324633333, -8.49743333333];
  const destinationPoint = [ 117.42465408310176,-8.498927206069524];

  const startDestinationPoints = [startingPoint,  destinationPoint]

  useEffect(() => {
    findCoordinates()
    fetchRoute()
  }, [A])
  
  // console.log(A) setelah useEffect => data current position user Setelah data current
  // position user ditemukan langsung kirim ke API, kemudian dari API data disimpan
  // langsung ke var startingPoint sehingga user dapat live position

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        const location = position.coords;
        setA([location.latitude, location.longitude])
        
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };


  const fetchRoute = async () => {
    const reqOptions = {
      waypoints: [
        {coordinates: startingPoint},
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


  return (
    <View style={{flex: 1, height: "100%", width: "100%" }}>
      <MapboxGL.MapView
        styleURL={MapboxGL.StyleURL.Street}
        zoomLevel={11}
        centerCoordinate={startingPoint}
        style={{flex: 1}}>
          <MapboxGL.Camera
            zoomLevel={11}
            centerCoordinate={startingPoint}
            animationMode={'flyTo'}
            animationDuration={0}
          >
          </MapboxGL.Camera>
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
  )
}