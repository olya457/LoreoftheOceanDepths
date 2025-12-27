import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;

const BG = require('../assets/background1.png');
const MERMAID = require('../assets/mermaid_card.png');
const POSEIDON = require('../assets/poseidon_card.png');

export default function OverlordsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.header, { marginTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={14}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Overlords</Text>
      </View>
      <View style={styles.card}>
        <Image source={MERMAID} style={styles.image} resizeMode="contain" />

        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>Mermaid</Text>
          <Text style={styles.cardText}>
            The deep holds{'\n'}not only treasures,{'\n'}but truths sweeter{'\n'}than any pearl.{'\n'}Uncover mine."
          </Text>

          <Pressable
            style={({ pressed }) => [styles.goldBtn, pressed && { opacity: 0.92 }]}
            onPress={() => navigation.navigate('Exchanger', { lord: 'mermaid' })}
          >
            <Text style={styles.goldBtnText}>Let’s go!</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>Poseidon</Text>
          <Text style={styles.cardText}>
            The Trident is{'\n'}not only a weapon,{'\n'}but a key to great{'\n'}secrets. Play your{'\n'}part in my legend."
          </Text>

          <Pressable
            style={({ pressed }) => [styles.goldBtn, pressed && { opacity: 0.92 }]}
            onPress={() => navigation.navigate('Exchanger', { lord: 'poseidon' })}
          >
            <Text style={styles.goldBtnText}>I’m Ready</Text>
          </Pressable>
        </View>

        <Image source={POSEIDON} style={styles.image} resizeMode="contain" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#173B6C',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D8B05C',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8B05C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backText: { color: '#fff', fontSize: 26, lineHeight: 28 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#D8B05C',
    fontSize: 20,
    fontWeight: '900',
    marginRight: 36,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#173B6C',
    borderRadius: 22,
    padding: IS_SMALL ? 14 : 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D8B05C',
  },

  image: { width: IS_SMALL ? 112 : 120, height: IS_SMALL ? 170 : 180 },

  cardTextWrap: { flex: 1, paddingHorizontal: 14 },

  cardTitle: {
    color: '#D8B05C',
    fontSize: IS_SMALL ? 18 : 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: IS_SMALL ? 13 : 14,
    lineHeight: IS_SMALL ? 18 : 20,
    marginBottom: 14,
  },

  goldBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D8B05C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBtnText: { color: '#0B1730', fontWeight: '900', fontSize: 14 },
});
