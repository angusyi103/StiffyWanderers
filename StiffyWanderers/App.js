import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Map from './Screens/Map';
import Popup from './Screens/Popup';
import { Video } from 'expo-av';

function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [locationFetched, setLocationFetched] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [rain, setRain] = useState(false);
  const [address, setAddress] = useState(null);
  const [addressText, setAddressText] = useState('Fetching address...');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showWaterGif, setShowWaterGif] = useState(false);
  const [showWindGif, setShowWindGif] = useState(false);
  const [storedTemp, setStoredTemp] = useState(null);
  const [progress, setProgress] = useState(0.0);
  const [popupType, setPopupType] = useState(null);
  const [popupVisible, setPopupVisible] = useState(true);
  const [jumpLoc, setJumpLoc] = useState(false);
  const video = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  // Function to fetch progress from AsyncStorage
  const loadProgress = async () => {
    try {
      const storedProgress = await AsyncStorage.getItem('progress');
      if (storedProgress !== null) {
        setProgress(parseFloat(storedProgress)); // Set progress from stored value
      }
      console.log('store progress', storedProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Function to save progress to AsyncStorage
  const saveProgress = async (progressValue) => {
    try {
      await AsyncStorage.setItem('progress', progressValue.toString());
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const storeTemp = async (temp) => {
    try {
      await AsyncStorage.setItem('currentTemperature', String(temp));
    } catch (error) {
      console.error('Error saving temperature', error);
    }
  };

  // Get stored temperature from AsyncStorage
  const getStoredTemp = async () => {
    try {
      const savedTemp = await AsyncStorage.getItem('currentTemperature');
      if (savedTemp !== null) {
        setStoredTemp(savedTemp);
      }
    } catch (error) {
      console.error('Error retrieving temperature', error);
    }
  };

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

        const currentDate = new Date().toDateString();
        const storedDate = await AsyncStorage.getItem('lastUpdateDate');
        const storedProgress = await AsyncStorage.getItem('progress');
        if (storedDate !== currentDate) {
          const newProgress = Math.min((parseFloat(storedProgress) || 0) + 0.05, 1);
          setProgress(newProgress);
          await AsyncStorage.setItem('progress', newProgress.toString());
          await AsyncStorage.setItem('lastUpdateDate', currentDate);
        }
      } else {
        setRain(false);
      }
      // setRain(true); //For test

      const currentTemp = Math.round(data.main.temp);
      storeTemp(currentTemp);
    } catch (error) {
      console.error('Error fetching weather data: ', error);
      setErrorMsg('Error fetching weather data');
    } finally {
      setLoading(false);
    }
  };

  // Function to get current location
  const getLocation = async () => {
    if (locationFetched) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setLoading(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    setLocationFetched(true);

    let addressResults = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    console.log('address', addressResults);
    setAddress(addressResults[0]); // Get the first result
  };

  // Function to get the current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const checkIfBothPressedToday = async () => {
    const waterPressed = await checkIfActionDoneToday('waterPressDate');
    const windPressed = await checkIfActionDoneToday('windPressDate');
    return waterPressed && windPressed;
  };

  const handleAddProgress = async () => {
    const bothPressed = await checkIfBothPressedToday();
    if (bothPressed) {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 0.03;

        // Check if the new progress is 100%
        console.log('progress', newProgress);
        if (newProgress >= 1) {
          setShowVideo(true); // Show the video
        }
        return newProgress;
      });
    }
  };

  // Check if the action was done today
  const checkIfActionDoneToday = async (actionKey) => {
    try {
      const lastActionDate = await AsyncStorage.getItem(actionKey);
      const currentDate = getCurrentDate();
      return lastActionDate === currentDate;
    } catch (error) {
      console.error(`Error checking ${actionKey}:`, error);
      return false;
    }
  };

  // Function to store the action date
  const storeActionDate = async (actionKey) => {
    try {
      const currentDate = getCurrentDate();
      await AsyncStorage.setItem(actionKey, currentDate);
    } catch (error) {
      console.error(`Error storing ${actionKey}:`, error);
    }
  };

  const handleWaterPress = async () => {
    const actionKey = 'waterPressDate';
    const isDoneToday = await checkIfActionDoneToday(actionKey);

    if (!isDoneToday) {
      setShowWaterGif((prevState) => !prevState);
      await storeActionDate(actionKey); // Store today's date after press
      await handleAddProgress(); // Check if both pressed, then add progress
    } else {
      handleGifClose();
      console.log('Water button has already been pressed today.');
    }
  };

  const handleGifClose = () => {
    setShowWaterGif(false);
    setShowWindGif(false);
  };

  const handleWindPress = async () => {
    const actionKey = 'windPressDate';
    const isDoneToday = await checkIfActionDoneToday(actionKey);

    if (!isDoneToday) {
      setShowWindGif((prevState) => !prevState);
      await storeActionDate(actionKey);
      await handleAddProgress();
    } else {
      handleGifClose();
      console.log('Wind button has already been pressed today.');
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
    setJumpLoc(false);
  };

  useEffect(() => {
    loadProgress();
    getLocation();
    getStoredTemp();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeather(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // if (loading) {
  //   return <ActivityIndicator size="large" color="#0000ff" />; // Show loading indicator
  // }

  if (errorMsg) {
    return <Text>{errorMsg}</Text>; // Show error message
  }

  const reset = async () => {
    setShowVideo(true);
    // setProgress(100); // Set the progress state to zero
    try {
      await AsyncStorage.removeItem('waterPressDate');
      await AsyncStorage.removeItem('windPressDate');

      console.log('Wind and water times have been reset.');
    } catch (error) {
      console.error('Error resetting wind and water times:', error);
    }
  };

  const manualSetLoc = async () => {
    const newLocation = { coords: { latitude: 25.033964, longitude: 121.564468 } };
    setLocation(newLocation); // Update state

    let addressResults = await Location.reverseGeocodeAsync({
      latitude: newLocation.coords.latitude, // Use newLocation instead of location state
      longitude: newLocation.coords.longitude,
    });

    setAddress(addressResults[0]);
    setJumpLoc(true);
  };

  useEffect(() => {
    if (address) {
      const formattedAddress = `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim();
      setAddressText(formattedAddress);
    } else {
      setAddressText('Fetching address...');
    }
  }, [address]);

  return (
    <View style={{ flex: 1 }}>
      {rain && (
        <Image
          style={styles.rainOverlayImage}
          source={require('./assets/rain-bg.png')} // The image to show when it rains
        />
      )}

      {showVideo && <Video source={require('./assets/upgrade-plus-popup.mp4')} resizeMode="cover" style={styles.finalVideo} shouldPlay={true} />}

      <View style={[styles.bgB, { backgroundColor: rain ? 'transparent' : '#61A5DB' }]}>
        {progress === 0 && popupVisible && <Popup type="hello" onClose={closePopup} />}

        {jumpLoc && popupVisible && <Popup type="new area" onClose={closePopup} />}

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
          {/* For test */}
          {/* <Button title="Show Hello Popup" onPress={() => showPopup('hello')} />
          <Button title="Show Level Up Popup" onPress={() => showPopup('level up')} />
          <Button title="Show New Area Popup" onPress={() => showPopup('new area')} />
          {popupType && <Popup type={popupType} onClose={closePopup} />} */}
          <TouchableOpacity style={styles.actionButton} onPress={reset}>
            <Image source={require('./assets/water.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={manualSetLoc}>
            <Image source={require('./assets/wind.png')} />
          </TouchableOpacity>

          <View style={styles.dayContainer}>
            <Text style={styles.dayTitle}>DAY</Text>
            <Text style={styles.day}>1</Text>
          </View>
          <Text style={styles.name}>Stiffy Wanderers</Text>
        </View>

        <View style={styles.actionWrapper}>
          <View style={styles.progressContainer}>
            <Progress.Bar progress={progress} height={15} width={400} color="white" style={styles.verticalBar} borderRadius={20} />
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
    height: '75%',
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
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dayTitle: {
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  day: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    color: '#fff',
  },
  clouds: {
    position: 'absolute',
    right: 70,
    top: 150,
    width: 120,
    height: 45,
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
    width: 56,
    fontSize: 10,
    wordWrap: 'break-word',
    textAlign: 'center',
    marginBottom: 10,
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
  customButton: {
    backgroundColor: '#2400FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  finalVideo: {
    width: '100%',
    height: '100%',
    top: 0,
  },
});
