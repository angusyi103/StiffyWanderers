import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Map() {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null); // Create a reference for the MapView

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005, // Initial zoom level
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  const zoomIn = () => {
    if (region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const zoomOut = () => {
    if (region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
          >
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title="Current Location"
              description="You are here"
            />
          </MapView>
          <View style={styles.buttonContainer}>
            <Button title="Zoom In" onPress={zoomIn} />
            <Button title="Zoom Out" onPress={zoomOut} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20, // Adjust to be closer to the bottom
    left: 20, // Adjust position as needed
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 150, // Set a fixed width for the buttons
  },
});
