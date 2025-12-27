import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, LordKey } from '../navigation/types';
import { getPoints } from '../store/progressStore';

const { width: W, height: H } = Dimensions.get('window');

const scale = W / 375; 
const normalize = (size: number) => Math.round(size * scale);

const GOLD = 'rgba(216, 176, 92, 1)';

export default function ExchangerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  
  const lord: LordKey = route.params?.lord ?? 'mermaid';
  const [points, setPoints] = useState(0);

  const data = useMemo(() => ({
    title: lord === 'poseidon' ? 'Poseidon' : 'Mermaid',
    hero: lord === 'poseidon' ? require('../assets/poseidon_card.png') : require('../assets/mermaid_card.png'),
  }), [lord]);

  useEffect(() => {
    getPoints().then(setPoints);
  }, []);

  return (
    <ImageBackground source={require('../assets/background1.png')} style={styles.bg}>
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          hitSlop={20}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle} adjustsFontSizeToFit numberOfLines={1}>
          {data.title}
        </Text>
        <View style={styles.coinsPill}>
          <Text style={styles.coinsText}>{points}</Text>
          <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
        </View>
      </View>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image 
            source={data.hero} 
            style={styles.hero} 
            resizeMode="contain" 
          />
        </View>
        <View style={[styles.panel, { marginBottom: insets.bottom + 20 }]}>
          <Text style={styles.panelTitle} adjustsFontSizeToFit numberOfLines={1}>
            I&apos;ll tell you a story about...
          </Text>
          
          <Image source={require('../assets/book.png')} style={styles.book} resizeMode="contain" />

          <Pressable 
            style={styles.goldBtn} 
            onPress={() => navigation.navigate('SavedStories', { lord })}
          >
            <Text style={styles.goldBtnText}>Open history</Text>
          </Pressable>

          <Pressable 
            style={styles.blueBtn} 
            onPress={() => navigation.navigate('WhatsInside', { lord })}
          >
            <Text style={styles.blueBtnText}>What&apos;s inside?</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '92%',
    alignSelf: 'center',
    height: normalize(54),
    backgroundColor: '#173B6C',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 12,
    zIndex: 10,
  },

  backBtn: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: { color: '#fff', fontSize: normalize(24), fontWeight: 'bold' },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: GOLD,
    fontSize: normalize(18),
    fontWeight: '900',
    marginHorizontal: 8,
  },

  coinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    height: normalize(36),
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GOLD,
    gap: 5,
  },

  coinsText: { color: GOLD, fontWeight: '900', fontSize: normalize(16) },
  coinIcon: { width: 20, height: 20 },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroContainer: {
    flex: 1,
    width: W,
    minHeight: H * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    width: '100%',
    height: '100%',
    maxHeight: H * 0.5,
  },

  panel: {
    width: '92%',
    backgroundColor: 'rgba(23, 59, 108, 0.95)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: GOLD,
    padding: normalize(16),
    alignItems: 'center',
  },

  panelTitle: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: '900',
    marginBottom: 12,
  },

  book: {
    width: '50%',
    height: normalize(70),
    marginBottom: 15,
  },

  goldBtn: {
    width: '100%',
    height: normalize(50),
    backgroundColor: GOLD,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  goldBtnText: { color: '#0B1730', fontSize: normalize(18), fontWeight: '900' },

  blueBtn: {
    width: '70%',
    height: normalize(34),
    backgroundColor: '#4B7CFF',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  blueBtnText: { color: '#0B1730', fontSize: normalize(13), fontWeight: '900' },
});