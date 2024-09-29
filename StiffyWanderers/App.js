import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Progress from 'react-native-progress';
import Map from './Screens/Map';

function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [rain, setRain] = useState(false);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showWaterGif, setShowWaterGif] = useState(false); // State to control GIF visibility
  const [showWindGif, setShowWindGif] = useState(false);

  // Function to fetch weather data
  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=2c943a8c60ceab50d7013af3fed83e14`
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('weather', data);
      setWeatherData(data);

      const weatherCondition = data.weather[0].main.toLowerCase();
      if (['rain', 'shower rain', 'thunderstorm', 'snow'].includes(weatherCondition)) {
        setRain(true);
      } else {
        setRain(false); // Reset if the weather condition is not related to rain
      }
      setRain(true); //For test
    } catch (error) {
      console.error('Error fetching weather data: ', error);
      setErrorMsg('Error fetching weather data');
    } finally {
      setLoading(false);
    }
  };

  // Function to get current location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setLoading(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    let addressResults = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    console.log('address', addressResults);
    setAddress(addressResults[0]); // Get the first result
  };

  const handleWaterPress = () => {
    console.log('water press');
    setShowWaterGif((prevState) => !prevState);
  };

  const handleGifClose = () => {
    setShowWaterGif(false);
    setShowWindGif(false);
  };

  const handleWindPress = () => {
    console.log('wind press');
    setShowWindGif((prevState) => !prevState);
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeather(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  let addressText = 'Fetching address...';
  if (address) {
    addressText = `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Show loading indicator
  }

  if (errorMsg) {
    return <Text>{errorMsg}</Text>; // Show error message
  }

  return (
    <View style={{ flex: 1 }}>
      {rain && (
        <Image
          style={styles.rainOverlayImage}
          source={require('./assets/rain-bg.png')} // The image to show when it rains
        />
      )}
      <View style={[styles.bgB, { backgroundColor: rain ? 'transparent' : '#61A5DB' }]}>
        {showWaterGif && <Image style={styles.waterGif} source={require('./assets/water.gif')} />}
        {showWindGif && <Image style={styles.windGif} source={require('./assets/hairdry.gif')} />}

        <Image style={styles.bgDown} source={rain ? require('./assets/rain-down.png') : require('./assets/morning-down2.png')} />
        {rain ? (
          <Image style={styles.clouds} source={require('./assets/clouds.png')} />
        ) : (
          <Image style={styles.sun} source={require('./assets/sun.png')} />
        )}

        <View style={styles.infoContainer}>
          <View style={styles.weatherInfo}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>{weatherData ? Math.round(weatherData.main.temp) : 'N/A'}</Text>
              <Text style={styles.temperatureUnit}>°C</Text>
              <Image style={styles.weatherIcon} source={require('./assets/sun_n_cloud.png')} />
            </View>
            <View style={styles.locationContainer}>
              <Image style={styles.iconW} source={require('./assets/location-dot-solid1.png')} />
              <Text style={styles.locationText}>{addressText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.day}>Day 1</Text>
          <Text style={styles.name}>Stiffy Wanderers</Text>
        </View>

        <View style={styles.actionWrapper}>
          <View style={styles.progressContainer}>
            <Progress.Bar progress={0.3} height={15} width={400} color="white" style={styles.verticalBar} borderRadius={20} />
          </View>
          <Text style={styles.processText}>Weathering{'\n'}Process</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleWaterPress}>
              <Image source={require('./assets/water.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleWindPress}>
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
  rainOverlayImage: {
    position: 'absolute', // To overlay on top of bgB
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1, // Ensure it's on top
    backgroundColor: '#8B94AE',
  },
  bgB: {
    position: 'relative',
    flex: 1,
    justifyContent: 'space-between',
    borderTopColor: '#111',
    borderTopWidth: 4,
    borderBottomColor: '#111',
    backgroundColor: '#61A5DB',
    zIndex: -1,
  },
  waterGif: {
    position: 'absolute',
    top: 150,
    left: 100,
    width: 250,
    height: 250,
    zIndex: 10,
  },
  windGif: {
    position: 'absolute',
    top: 150,
    left: 100,
    width: 250,
    height: 250,
    zIndex: 10,
    transform: [{ rotate: '290deg' }],
  },
  bgDown: {
    position: 'absolute',
    bottom: 0,
    padding: 0,
    width: '100%',
    zIndex: 0,
  },
  infoContainer: {
    padding: 20,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  weatherInfo: {
    padding: 20,
    flexDirection: 'column',
    alignItems: 'end',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
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
    width: 50,
    height: 32,
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  locationText: {
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
  name: {
    color: '#fff',
  },
  clouds: {

  },
  sun: {
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
    marginBottom: 200,
    alignItems: 'center',
  },
  verticalBar: {
    transform: [{ rotate: '270deg' }],
    position: 'absolute',
    bottom: 0,
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
