import React from 'react';
import { StyleSheet, View, Button, Image, Text } from 'react-native';

export default function Popup({ type, onClose }) {
  return (
    <View style={styles.container}>
      {type === 'hello' && (
        <>
          <Text style={styles.text}>HELLO STIFFY TRAINER😎︎</Text>
          <Image style={styles.img} source={require('../assets/hello.png')} />
          <Text style={styles.text}>YOU ARE NOW AN Level 1: Rock-in-Training ROCK</Text>
          <Button title="OKAY!" onPress={onClose} />
        </>
      )}
      {type === 'level up' && (
        <>
          <Text style={styles.text}>LEVEL UP‼️</Text>
          <Image style={styles.img} source={require('../assets/levelup.png')} />
          <Text style={styles.text}>YOU ARE NOW AN Level 2: Slightly Stronger ROCK</Text>
          <Button title="OKAY!" onPress={onClose} />
        </>
      )}
      {type === 'new area' && (
        <>
          <Text style={styles.text}>NEW AREA!!</Text>
          <Image style={styles.img} source={require('../assets/area.png')} />
          <Text style={styles.text}>Explore your surroundings!</Text>
          <Button title="GET GIFT!" onPress={onClose} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    padding: 20,
    borderRadius: 10,
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
  },
  img: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
});
