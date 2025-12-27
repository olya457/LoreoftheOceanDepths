import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, LordKey } from '../navigation/types';
import { getUnlockedCount, getUnlockCost } from '../store/progressStore';

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;

const BG = require('../assets/background1.png');
const ICON_BACK = require('../assets/back.png');
const MERMAID = require('../assets/mermaid_card.png');
const POSEIDON = require('../assets/poseidon_card.png');

type R = RouteProp<RootStackParamList, 'WhatsInside'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WhatsInsideScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();

  const lord: LordKey = route.params?.lord ?? 'mermaid';

  const heroImg = lord === 'poseidon' ? POSEIDON : MERMAID;
  const title = lord === 'poseidon' ? "What's inside (Poseidon)" : "What's inside (Mermaid)";

  const unlockCost = getUnlockCost();
  const [unlockedCount, setUnlockedCount] = React.useState<number>(1);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getUnlockedCount(lord);
      if (mounted) setUnlockedCount(c);
    })();
    return () => {
      mounted = false;
    };
  }, [lord]);

  const info = useMemo(() => {
    return {
      total: 15,
      opened: unlockedCount,
      nextCost: unlockCost,
    };
  }, [unlockedCount, unlockCost]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.topWrap, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}
            hitSlop={14}
          >
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
          <Text style={styles.topTitle}>{title}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Image source={heroImg} style={styles.hero} resizeMode="contain" />

          <Text style={styles.h1}>Unlocked stories</Text>
          <Text style={styles.p}>
            Opened: <Text style={styles.bold}>{info.opened}</Text> / {info.total}
          </Text>
          <Text style={styles.p}>
            Next unlock cost: <Text style={styles.bold}>{info.nextCost}</Text> points
          </Text>

          <Pressable
            onPress={() => navigation.navigate('SavedStories', { lord })}
            style={({ pressed }) => [styles.btnGold, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.btnGoldText}>Go to stories list</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const GOLD = 'rgba(216, 176, 92, 1)';
const NAVY = 'rgba(18, 54, 104, 0.92)';

const styles = StyleSheet.create({
  bg: { flex: 1 },

  topWrap: { paddingHorizontal: 18 },
  topBar: {
    marginTop: 10,
    height: 46,
    borderRadius: 16,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  backBtn: {
    position: 'absolute',
    left: 10,
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.60)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { width: 18, height: 18, tintColor: '#FFFFFF' },
  topTitle: { color: GOLD, fontSize: 14, fontWeight: '900' },

  content: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },

  card: {
    width: Math.min(390, W - 36),
    alignSelf: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.92)',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 16,
    alignItems: 'center',
  },

  hero: {
    width: Math.min(260, W - 120),
    height: IS_SMALL ? 160 : 180,
    marginBottom: 10,
  },

  h1: { color: GOLD, fontSize: 16, fontWeight: '900', textAlign: 'center', marginTop: 6 },
  p: { marginTop: 8, color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  bold: { fontWeight: '900', color: '#FFFFFF' },

  btnGold: {
    marginTop: 14,
    width: '100%',
    height: 48,
    borderRadius: 26,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGoldText: { color: '#0B1730', fontSize: 14, fontWeight: '900' },
});
