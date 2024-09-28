import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Button, Image, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Map({ route }) {
  const { location } = route.params; // Get location from route params
  const [region, setRegion] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location.coords;
      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [location]);

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
      {region ? (
        <>
          <MapView ref={mapRef} style={styles.map} region={region}>
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title="Current Location"
              description="You are here">
              <Image source={require('../assets/rock.png')} style={styles.rock} resizeMode="contain" />
            </Marker>
          </MapView>
          <View style={styles.buttonContainer}>
            <Button title="Zoom In" onPress={zoomIn} />
            <Button title="Zoom Out" onPress={zoomOut} />
          </View>
        </>
      ) : (
        <Text>Location data is not available.</Text>
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
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 150,
  },
  rock: {
    width: 50,
    height: 50,
  },
});
