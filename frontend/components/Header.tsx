// components/Header.tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0180C', // rouge
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40, // pour espace avec le haut de l'écran
  },
  logo: {
    width: 100,
    height: 100,
  },
});
