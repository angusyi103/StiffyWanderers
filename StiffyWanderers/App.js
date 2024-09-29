import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Progress from 'react-native-progress';

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
        <Image style={styles.sun} source={require('./assets/sun.png')} />
        <View style={styles.infoContainer}>
          <View style={styles.weatherInfo}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>20</Text>
              <Text style={styles.temperatureUnit}>°C</Text>
              <Image style={styles.weatherIcon} source={require('./assets/sun_n_cloud.png')} />
            </View>
            <View style={styles.locationContainer}>
              <Image style={styles.iconW} source={require('./assets/location-dot-solid1.png')} />
              <Text style={styles.locationText}>{locationText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.day}>Day 1</Text>
          <Text style={styles.name}>Stiffy Wanderers</Text>
        </View>

        <View style={styles.actionWrapper}>
          <View style={styles.progressContainer}>
            <Progress.Bar
              progress={0.3}
              height={15}
              width={400}
              color="white"
              style={styles.verticalBar}
              borderRadius={20}
            />
          </View>
          <Text style={styles.processText}>Weathering{'\n'}Process</Text>
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
    justifyContent: 'space-between',
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
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherInfo: {
    padding: 20,
    flexDirection: 'column', // Change to column for proper stacking
    alignItems: 'end', // Center elements horizontally
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align text to the baseline for proper alignment
    justifyContent: 'center', // Center temperature and unit horizontally
    // marginBottom: 10, // Add space between temperature and icon
  },
  temperature: {
    fontSize: 50,
    color: '#fff',
  },
  temperatureUnit: {
    fontSize: 24,
    color: '#fff',
  },
  weatherIcon: {
    width: 50, // Increase width for better visibility
    height: 32,
    marginLeft: 10, // Add spacing between temperature and icon
    paddingBottom: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // marginTop: 10,
  },
  locationText:{
    color: '#fff',
  },
  iconW: {
    width: 12,
    height: 16,
    marginRight: 5,
  },
  textContainer: {
    bottom: 50,
    left: 30,
    alignItems: 'flex-start',
    color: '#fff',
  },
  day: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name:{
    color: '#fff',
  },
  sun:{
    position: 'absolute',
    right: 70,
    top: 60,
    width: 50,
    height: 50,
  },
  actionWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    right: 20,
  },
  progressContainer: {
    marginBottom: 200, // Increase the margin to create space below
    alignItems: 'center',
  },
  verticalBar: {
    transform: [{ rotate: '270deg' }], // Rotate to make it vertical
    position: 'absolute', // Position it absolutely within the container
    bottom: 0, // Align it to the bottom
  },
  processText: {
    color: '#fff',
    width: 55,
    fontSize: 9,
    wordWrap: 'break-word',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
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
