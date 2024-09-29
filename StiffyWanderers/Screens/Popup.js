import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';

export default function Popup({ type, onClose }) {
  return (
    <View style={styles.popupContainer}>
      {type === 'hello' && (
        <View style={styles.popup}>
          <Image style={styles.img} source={require('../assets/hello.png')} />
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>OKAY!</Text>
          </TouchableOpacity>
        </View>
      )}
      {type === 'level up' && (
        <View style={styles.popup}>
          <Image style={styles.img} source={require('../assets/levelup.png')} />
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>OKAY!</Text>
          </TouchableOpacity>
        </View>
      )}
      {type === 'new area' && (
        <View style={styles.popup}>
          <Image style={styles.img} source={require('../assets/area.png')} />
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>GET GIFT!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    width: '100%',
    height: '100%',
    zIndex: 999,
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center', // Center the popup vertically
    alignItems: 'center',     // Center the popup horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: dim the background
  },
  popup: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFCD8', // Popup background color
    padding: 20,
    borderRadius: 10,
    width: 320,
    height: 530,
    zIndex: 1000,
    borderColor: 'black',
    borderWidth: 4,
  },
  img: {
    width: 380,  // Set an explicit width
    height: 340, // Set an explicit height
    resizeMode: 'contain',  // Ensures the image scales properly
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#2400FF',
    paddingTop: 10,
    borderRadius: 5,
    marginTop: 20,
    width: 200,
    height: 60,
    borderColor: 'black',
    borderWidth: 4,
  },
  btnText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    
  },
});
