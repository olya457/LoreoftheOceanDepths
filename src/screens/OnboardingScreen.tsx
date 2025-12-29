import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;
const IS_TINY = H < 690;

const BG = require('../assets/background1.png');

const IMG_1 = require('../assets/onboard_1.png');
const IMG_2 = require('../assets/onboard_2.png');
const IMG_3 = require('../assets/onboard_3.png');

type Page = {
  image: any;
  title: string;
  body: string;
  button: string;
};

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const pages = useMemo<Page[]>(
    () => [
      {
        image: IMG_1,
        title: 'Welcome to the\nLORE of the Ocean DEPTHS',
        body: "Use Poseidon's trident to\ncollect underwater treasures!",
        button: 'Interesting!',
      },
      {
        image: IMG_2,
        title: 'Underwater depths',
        body: 'The more difficult the depths\nyou choose, the more artifacts\nyou will receive.',
        button: "Let’s go!",
      },
      {
        image: IMG_3,
        title: 'Artifact Exchange',
        body: "Exchange the artifacts you've\ncollected for fascinating stories\nfrom the ocean's masters.",
        button: 'Start Game!',
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const page = pages[index];

  const fade = useRef(new Animated.Value(0)).current;
  const up = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  const playIn = () => {
    fade.setValue(0);
    up.setValue(14);
    scale.setValue(0.985);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(up, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    playIn();
  }, [index]);

  const onPressButton = () => {
    if (index < pages.length - 1) {
      setIndex((v) => v + 1);
      return;
    }
    navigation.replace('Menu');
  };

  const CARD_W = Math.min(360, W - 44);

  const BTN_H = 54;
  const BASE_BOTTOM_GAP = 36;
  const ANDROID_LIFT = Platform.OS === 'android' ? 20 : 0;
  const SAFE_GAP = 20;

  const bottomPadForButton = insets.bottom + BASE_BOTTOM_GAP + ANDROID_LIFT;
  const reservedBottomSpace = BTN_H + bottomPadForButton + SAFE_GAP;

  const ANDROID_CARD_UP = Platform.OS === 'android' ? -50 : 0;

  const heroH = IS_TINY ? 360 : IS_SMALL ? 430 : 520;
  const cardPadV = IS_TINY ? 14 : 18;
  const titleSize = IS_TINY ? 16 : 18;
  const bodySize = IS_TINY ? 13 : 14;

  const cardTranslateY = Animated.add(up, 30 + ANDROID_CARD_UP);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.contentWrap, { paddingTop: 44 + 60, paddingBottom: reservedBottomSpace }]}>
        <Animated.View
          style={[
            styles.heroWrap,
            {
              opacity: fade,
              transform: [{ translateY: up }, { scale }],
            },
          ]}
        >
          <Image source={page.image} style={{ width: W, height: heroH }} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              width: CARD_W,
              paddingTop: cardPadV,
              paddingBottom: cardPadV,
              opacity: fade,
              transform: [{ translateY: cardTranslateY }],
              marginTop: -60 + ANDROID_CARD_UP,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { fontSize: titleSize }]}>{page.title}</Text>
          <Text style={[styles.cardText, { fontSize: bodySize }]}>{page.body}</Text>
        </Animated.View>
      </View>

      <View pointerEvents="box-none" style={styles.bottomArea}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { marginBottom: bottomPadForButton },
            pressed && { opacity: 0.9 },
          ]}
          onPress={onPressButton}
        >
          <Text style={styles.btnText}>{page.button}</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  contentWrap: {
    flex: 1,
    alignItems: 'center',
  },

  heroWrap: {
    width: '100%',
    alignItems: 'center',
  },

  card: {
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 60, 115, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(216, 176, 92, 0.9)',
  },

  cardTitle: {
    color: 'rgba(216, 176, 92, 1)',
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22,
  },

  cardText: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },

  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },

  btn: {
    width: Math.min(360, W - 44) - 16,
    height: 54,
    borderRadius: 28,
    backgroundColor: 'rgba(216, 176, 92, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnText: {
    color: '#0B1730',
    fontSize: 16,
    fontWeight: '900',
  },
});
