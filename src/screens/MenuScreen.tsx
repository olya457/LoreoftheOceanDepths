import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getPoints } from '../store/progressStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;
const IS_TINY = H < 690;
const IS_VERY_TINY = H < 640;
const BASE_W = 390;
const s = (n: number) => {
  const k = Math.max(0.86, Math.min(1.08, W / BASE_W));
  return Math.round(n * k);
};

const BG = require('../assets/background1.png');
const LOGO = require('../assets/logo.png');
const ICON_COIN = require('../assets/coin.png');

type Key = 'StartAdventure' | 'Overlords' | 'SavedStories' | 'Statistics';

function MenuBtn({
  title,
  active,
  onPress,
  height,
  fontSize,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
  height: number;
  fontSize: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btnBase,
        { height },
        active ? styles.btnGold : styles.btnBlue,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Text style={[styles.btnText, { fontSize }, active ? styles.btnTextDark : styles.btnTextLight]}>{title}</Text>
    </Pressable>
  );
}

export default function MenuScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [activeKey, setActiveKey] = useState<Key | null>(null);
  const [points, setPoints] = useState<number>(0);

  const loadPoints = useCallback(async () => {
    try {
      const p = await getPoints();
      setPoints(p);
    } catch {
      setPoints(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPoints();
    }, [loadPoints])
  );

  const aTop = useRef(new Animated.Value(0)).current;
  const aLogo = useRef(new Animated.Value(0)).current;
  const aPanel = useRef(new Animated.Value(0)).current;

  const runIntro = useCallback(() => {
    aTop.setValue(0);
    aLogo.setValue(0);
    aPanel.setValue(0);

    Animated.sequence([
      Animated.timing(aTop, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(aLogo, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(aPanel, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [aTop, aLogo, aPanel]);

  useFocusEffect(
    useCallback(() => {
      runIntro();
      return undefined;
    }, [runIntro])
  );

  const fadeTop = aTop.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const yTop = aTop.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  const fadeLogo = aLogo.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const yLogo = aLogo.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  const fadePanel = aPanel.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const yPanel = aPanel.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  const topPad = Math.max(insets.top, 12) + (IS_TINY ? 8 : 12);

  const topBarH = IS_VERY_TINY ? 48 : IS_TINY ? 52 : 56;
  const topBarRadius = IS_TINY ? 16 : 18;
  const titleSize = IS_VERY_TINY ? 18 : IS_TINY ? 20 : 22;

  const pillH = IS_VERY_TINY ? 32 : IS_TINY ? 34 : 36;
  const pillPadL = IS_VERY_TINY ? 12 : 14;
  const pillPadR = IS_VERY_TINY ? 8 : 10;
  const scoreSize = IS_VERY_TINY ? 14 : 16;
  const coinSize = IS_VERY_TINY ? 18 : IS_TINY ? 20 : 22;

  const logoW = Math.min(IS_VERY_TINY ? 300 : IS_TINY ? 320 : 360, W - (IS_TINY ? 56 : 70));
  const logoH = Math.min(IS_VERY_TINY ? 190 : IS_TINY ? 220 : 260, Math.round(logoW * 0.72));

  const logoTop = IS_VERY_TINY ? 10 : IS_TINY ? 16 : 26; 
  const logoExtraDown = IS_VERY_TINY ? 10 : 20; 

  const panelW = useMemo(() => {
    const max = 392;
    const side = IS_VERY_TINY ? 28 : 36;
    return Math.min(max, W - side);
  }, []);

  const panelRadius = IS_TINY ? 20 : 22;
  const panelPadH = IS_VERY_TINY ? 12 : IS_TINY ? 14 : 16;
  const panelPadV = IS_VERY_TINY ? 14 : 18;

  const btnH = IS_VERY_TINY ? 48 : IS_TINY ? 52 : 58;
  const btnRadius = IS_VERY_TINY ? 24 : IS_TINY ? 28 : 30;
  const btnFont = IS_VERY_TINY ? 15 : IS_TINY ? 16 : 18;
  const btnGap = IS_VERY_TINY ? 10 : 14;

  const panelTop = useMemo(() => {
    const base = IS_VERY_TINY ? 250 : IS_TINY ? 280 : IS_SMALL ? 300 : 320;
    const extraDown = IS_VERY_TINY ? 40 : 80; 
    const top = base + extraDown;
    const panelHeightApprox = panelPadV * 2 + btnH * 4 + btnGap * 3;
    const bottomSafe = Math.max(insets.bottom, 12) + 18;

    const maxTop = H - bottomSafe - panelHeightApprox;
    const clamped = Math.max(top, Math.min(top, maxTop));
    if (IS_VERY_TINY) return Math.max(170, clamped);
    return Math.max(190, clamped);
  }, [insets.bottom, btnH, btnGap, panelPadV]);

  const onPick = (key: Key) => {
    setActiveKey(key);
    setTimeout(() => {
      navigation.navigate(key);
    }, 140);
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View
        style={[
          styles.topBarWrap,
          {
            paddingTop: topPad,
            paddingHorizontal: IS_VERY_TINY ? 14 : 18,
            opacity: fadeTop,
            transform: [{ translateY: yTop }],
          },
        ]}
      >
        <View
          style={[
            styles.topBar,
            {
              height: topBarH,
              borderRadius: topBarRadius,
            },
          ]}
        >
          <Text style={[styles.topBarTitle, { fontSize: titleSize }]}>Menu</Text>

          <View
            style={[
              styles.scorePill,
              {
                height: pillH,
                paddingLeft: pillPadL,
                paddingRight: pillPadR,
                borderRadius: pillH / 2,
                right: IS_VERY_TINY ? 10 : 12,
              },
            ]}
          >
            <Text style={[styles.scoreText, { fontSize: scoreSize }]}>{points}</Text>
            <Image source={ICON_COIN} style={{ width: coinSize, height: coinSize }} resizeMode="contain" />
          </View>
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            marginTop: logoTop + logoExtraDown,
            opacity: fadeLogo,
            transform: [{ translateY: yLogo }],
          },
        ]}
      >
        <Image source={LOGO} style={{ width: logoW, height: logoH }} resizeMode="contain" />
      </Animated.View>
      <Animated.View
        style={[
          styles.panel,
          {
            top: panelTop,
            left: (W - panelW) / 2,
            width: panelW,
            paddingHorizontal: panelPadH,
            paddingTop: panelPadV,
            paddingBottom: panelPadV,
            borderRadius: panelRadius,
            opacity: fadePanel,
            transform: [{ translateY: yPanel }],
          },
        ]}
      >
        <View style={{ height: 2 }} />
        <MenuBtn
          title="Start Adventure"
          active={activeKey === 'StartAdventure'}
          onPress={() => onPick('StartAdventure')}
          height={btnH}
          fontSize={btnFont}
        />
        <View style={{ height: btnGap }} />
        <MenuBtn
          title="Overlords"
          active={activeKey === 'Overlords'}
          onPress={() => onPick('Overlords')}
          height={btnH}
          fontSize={btnFont}
        />
        <View style={{ height: btnGap }} />
        <MenuBtn
          title="Saved stories"
          active={activeKey === 'SavedStories'}
          onPress={() => onPick('SavedStories')}
          height={btnH}
          fontSize={btnFont}
        />
        <View style={{ height: btnGap }} />
        <MenuBtn
          title="Statistics"
          active={activeKey === 'Statistics'}
          onPress={() => onPick('Statistics')}
          height={btnH}
          fontSize={btnFont}
        />
      </Animated.View>

      <View style={{ height: Math.max(insets.bottom, 12) }} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  topBarWrap: {},

  topBar: {
    backgroundColor: 'rgba(18, 54, 104, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(216, 176, 92, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  topBarTitle: {
    color: 'rgba(216, 176, 92, 1)',
    fontWeight: '900',
    includeFontPadding: false,
    ...Platform.select({
      android: { textAlignVertical: 'center' as const },
    }),
  },

  scorePill: {
    position: 'absolute',
    backgroundColor: 'rgba(11, 33, 70, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(216, 176, 92, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },

  scoreText: {
    color: 'rgba(216, 176, 92, 1)',
    fontWeight: '900',
    includeFontPadding: false,
  },

  logoWrap: { alignItems: 'center' },

  panel: {
    position: 'absolute',
    backgroundColor: 'rgba(14, 45, 92, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },

  btnBase: {
    width: '100%',
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },

  btnGold: { backgroundColor: 'rgba(216, 176, 92, 1)' },
  btnBlue: { backgroundColor: 'rgba(74, 128, 255, 0.86)' },

  btnText: { fontWeight: '900', includeFontPadding: false },

  btnTextDark: { color: '#0B1730' },
  btnTextLight: { color: '#FFFFFF' },
});
