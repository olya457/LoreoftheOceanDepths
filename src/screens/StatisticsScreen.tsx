import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Platform,
  Share,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPoints, getUnlockedCount, getUnlockCost } from '../store/progressStore';
import type { LordKey } from '../navigation/types';

const { height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const ICON_BACK = require('../assets/back.png');
const LOGO = require('../assets/logo.png');

const GOLD = 'rgba(216, 176, 92, 1)';
const NAVY = 'rgba(18, 54, 104, 0.92)';

function clampInt(n: number, min: number, max: number) {
  const x = Math.floor(Number.isFinite(n) ? n : 0);
  return Math.max(min, Math.min(max, x));
}

export default function StatisticsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const lord: LordKey = 'thor' as LordKey;
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [openStories, setOpenStories] = useState(1);
  const brokenTridents = 0;
  const headerPadTop = Math.max(insets.top, 12);
  const aOpacity = useRef(new Animated.Value(0)).current;
  const aUp = useRef(new Animated.Value(14)).current;

  const playIntro = useCallback(() => {
    aOpacity.setValue(0);
    aUp.setValue(14);
    Animated.parallel([
      Animated.timing(aOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(aUp, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [aOpacity, aUp]);

  const load = useCallback(async () => {
    const points = await getPoints();
    const unlockCost = typeof getUnlockCost === 'function' ? getUnlockCost() : 300;
    const collections = unlockCost > 0 ? Math.floor(points / unlockCost) : 0;

    const u = await getUnlockedCount(lord);

    setCollectionsCount(clampInt(collections, 0, 9999));
    setOpenStories(u);
  }, [lord]);

  useFocusEffect(
    useCallback(() => {
      load();
      playIntro();
    }, [load, playIntro])
  );

  const shareText = useMemo(() => {
    return `Statistics\n\nArtifact collections: ${collectionsCount}\nBroken tridents: ${brokenTridents}\nOpen stories: ${openStories}`;
  }, [collectionsCount, brokenTridents, openStories]);

  const onShare = async () => {
    try {
      await Share.share(
        { message: shareText, title: 'Statistics' },
        Platform.OS === 'ios' ? { subject: 'Statistics' } : undefined
      );
    } catch {}
  };

  const logoH = IS_TINY ? 160 : IS_SMALL ? 190 : 220;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.headerWrap, { paddingTop: headerPadTop }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={14}>
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.contentWrap,
          {
            opacity: aOpacity,
            transform: [{ translateY: aUp }],
          },
        ]}
      >
     
        <View style={styles.centerLogoWrap}>
          <Image source={LOGO} style={[styles.logo, { height: logoH }]} resizeMode="contain" />
        </View>

 
        <View
          style={[
            styles.cardWrap,
            {
              paddingBottom: Math.max(insets.bottom, 18),
              transform: [{ translateY: -30 }],
            },
          ]}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My statistics</Text>

            <View style={styles.rows}>
        
              <View style={styles.row}>
                <View style={styles.labelPill}>
                  <Text style={styles.labelText}>Artifact collections:</Text>
                </View>
                <View style={styles.valuePill}>
                  <Text style={styles.valueText}>{collectionsCount}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.labelPill}>
                  <Text style={styles.labelText}>Broken tridents:</Text>
                </View>
                <View style={styles.valuePill}>
                  <Text style={styles.valueText}>{brokenTridents}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.labelPill, styles.labelPillActive]}>
                  <Text style={[styles.labelText, styles.labelTextActive]}>Open stories:</Text>
                </View>
                <View style={styles.valuePill}>
                  <Text style={styles.valueText}>{openStories}</Text>
                </View>
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.92 }]} onPress={onShare}>
              <Text style={styles.shareText}>Share</Text>
            </Pressable>

          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  headerWrap: { paddingHorizontal: 18 },
  header: {
    marginTop: 10,
    height: IS_TINY ? 48 : 52,
    borderRadius: 18,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: GOLD, fontSize: IS_TINY ? 22 : 26, fontWeight: '900' },

  backBtn: {
    position: 'absolute',
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  backIcon: { width: 18, height: 18, tintColor: '#FFFFFF' },

  contentWrap: { flex: 1 },

  centerLogoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  logo: { width: '92%' },

  cardWrap: {
    paddingHorizontal: 18,
    paddingTop: IS_TINY ? 4 : 10,
  },

  card: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: GOLD,
    paddingTop: IS_TINY ? 14 : 18,
    paddingHorizontal: 18,
    paddingBottom: IS_TINY ? 14 : 18,
  },

  cardTitle: {
    color: GOLD,
    fontSize: IS_TINY ? 24 : 28,
    fontWeight: '900',
    textAlign: 'left',
    marginBottom: IS_TINY ? 10 : 14,
  },

  rows: { rowGap: IS_TINY ? 10 : 12 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 12 },

  labelPill: {
    flex: 1,
    height: IS_TINY ? 32 : 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    backgroundColor: 'rgba(0,0,0,0.16)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  labelText: { color: 'rgba(255,255,255,0.92)', fontWeight: '800', fontSize: IS_TINY ? 12 : 13 },

  labelPillActive: {
    backgroundColor: 'rgba(0,0,0,0.26)',
    borderColor: 'rgba(255,255,255,0.55)',
  },
  labelTextActive: { color: 'rgba(255,255,255,0.98)' },

  valuePill: {
    width: IS_TINY ? 64 : 74,
    height: IS_TINY ? 32 : 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: 'rgba(0,0,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: { color: 'rgba(255,255,255,0.95)', fontWeight: '900', fontSize: IS_TINY ? 12 : 13 },

  shareBtn: {
    marginTop: IS_TINY ? 16 : 20,
    height: IS_TINY ? 52 : 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { color: '#0B1730', fontSize: IS_TINY ? 20 : 22, fontWeight: '900' },

  meta: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
