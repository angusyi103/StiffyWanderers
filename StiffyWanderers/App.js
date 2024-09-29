import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';

function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    })();
  }, []);

  let locationText = 'Fetching location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.bgB}>
        <Image style={styles.bgDown} source={require('./assets/morning-down2.png')} />

        <View style={styles.infoContainer}>
          <View style={styles.weatherInfo}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>20</Text>
              <Text style={styles.temperatureUnit}>°C</Text>
              <Image style={styles.weatherIcon} source={require('./assets/sun_n_cloud.png')} resizeMode="contain" />
            </View>
            <View style={styles.locationContainer}>
              <Image style={styles.iconW} source={require('./assets/location-dot-solid.svg')} />
              <Text>{locationText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.day}>Day 1</Text>
          <Text>Stiffy Wanderers</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Image source={require('./assets/water.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Image source={require('./assets/wind.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.mapIcon]} onPress={() => navigation.navigate('Map', { location })}>
            <Image source={require('./assets/map.png')} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={Map} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgB: {
    position: 'relative',
    flex: 1,
    justifyContent: 'space-between', // Ensures content is properly spaced
    borderTopColor: '#111',
    borderTopWidth: 4,
    borderBottomColor: '#111',
    backgroundColor: '#61A5DB',
  },
  bgDown: {
    position: 'absolute',
    bottom: 0,
    padding: 0,
    width: '100%',
  },
  infoContainer: {
    padding: 20,
    zIndex: 1, // Ensure it stays above the background image
    justifyContent: 'center', // Ensure the content is centered vertically
    alignItems: 'center',
  },
  weatherInfo: {
    padding: 20,
    flexDirection: 'column', // Change to column for proper stacking
    alignItems: 'center', // Center elements horizontally
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align text to the baseline for proper alignment
    justifyContent: 'center', // Center temperature and unit horizontally
    marginBottom: 10, // Add space between temperature and icon
  },
  temperature: {
    fontSize: 50,
    color: '#fff',
  },
  temperatureUnit: {
    fontSize: 24, // Adjust to a smaller size relative to temperature
    color: '#fff',
  },
  weatherIcon: {
    width: 50, // Increase width for better visibility
    height: 50,
    marginLeft: 10, // Add spacing between temperature and icon
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  iconW: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  textContainer: {
    bottom: 50,
    left: 30,
    alignItems: 'flex-start',
  },
  day: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute', // Make sure it's positioned absolutely
    bottom: 50, // Adjust this to position it vertically
    right: 20, // Align the container to the right edge
    flexDirection: 'column', // Stack buttons vertically
    alignItems: 'flex-end', // Align buttons to the right
    justifyContent: 'space-between', // Center items vertically within the container
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  mapIcon: {
    marginTop: 20,
  },
  cW: {
    color: '#fff',
  },
});
