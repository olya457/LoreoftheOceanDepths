import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ImageBackground, Animated, Easing, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BG = require('../assets/background.png');
const LOGO = require('../assets/logo.png');

export default function LoaderScreen() {
  const navigation = useNavigation<Nav>();

  const a = useRef(new Animated.Value(0)).current; 
  const s = useRef(new Animated.Value(0.94)).current; 

  useEffect(() => {
    Animated.parallel([
      Animated.timing(a, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(s, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3000);

    return () => clearTimeout(t);
  }, [a, s, navigation]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.center}>
        <Animated.Image
          source={LOGO}
          resizeMode="contain"
          style={[styles.logo, { opacity: a, transform: [{ scale: s }] }]}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 220, height: 220 },
});
