import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { addPoints, getPoints } from '../store/progressStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'StartAdventure'>;

const { width: W, height: H } = Dimensions.get('window');

const IS_SMALL = H < 750;
const IS_TINY = H < 690;
const IS_VERY_TINY = H < 640;

const BG = require('../assets/background1.png');
const ICON_BACK = require('../assets/back.png');
const COIN = require('../assets/coin.png');

const LVL_EASY = require('../assets/game1.png');
const LVL_MED = require('../assets/game2.png');
const LVL_HARD = require('../assets/game3.png');

const RES_1 = require('../assets/res1.png');
const RES_2 = require('../assets/res2.png');
const RES_3 = require('../assets/res3.png');
const RES_4 = require('../assets/res4.png');
const RES_5 = require('../assets/res5.png');
const RES_6 = require('../assets/res6.png');

const STAFF = require('../assets/staff.png');

type DifficultyKey = 'easy' | 'medium' | 'hard';
type ResourceKey = 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'r6';

type ResourceDef = { key: ResourceKey; img: any };

type DifficultyConfig = {
  key: DifficultyKey;
  title: 'Easy' | 'Medium' | 'Hard';
  description: string;
  speedPct: number;
  pointsPerGood: number;
  targetCount: number;
  maxPoints: number;
  levelImg: any;
};

type FallingItem = {
  id: string;
  resKey: ResourceKey;
  x: number;
  size: number;
  y: Animated.Value;
  durationMs: number;
};

type Popup = {
  id: string;
  text: string;
  x: number;
  y: number;
  a: Animated.Value;
  ty: Animated.Value;
  kind: 'good' | 'bad';
};

const GOLD = 'rgba(216, 176, 92, 1)';
const NAVY = 'rgba(18, 54, 104, 0.92)';

const ALL_RESOURCES: ResourceDef[] = [
  { key: 'r1', img: RES_1 },
  { key: 'r2', img: RES_2 },
  { key: 'r3', img: RES_3 },
  { key: 'r4', img: RES_4 },
  { key: 'r5', img: RES_5 },
  { key: 'r6', img: RES_6 },
];

const DIFFS: DifficultyConfig[] = [
  {
    key: 'easy',
    title: 'Easy',
    description: 'Safe travel for resources, forgiving of mistakes.',
    speedPct: 50,
    pointsPerGood: 5,
    targetCount: 5,
    maxPoints: 450,
    levelImg: LVL_EASY,
  },
  {
    key: 'medium',
    title: 'Medium',
    description: "It's still safe, but you should be careful.",
    speedPct: 75,
    pointsPerGood: 10,
    targetCount: 4,
    maxPoints: 450,
    levelImg: LVL_MED,
  },
  {
    key: 'hard',
    title: 'Hard',
    description: 'A dangerous journey for resources, be careful and cautious.',
    speedPct: 100,
    pointsPerGood: 15,
    targetCount: 2,
    maxPoints: 450,
    levelImg: LVL_HARD,
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function pickTargets(all: ResourceDef[], count: number): ResourceKey[] {
  return all.slice(0, count).map((r) => r.key);
}

export default function StartAdventureScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [points, setPoints] = useState(0);
  const pointsRef = useRef(0);

  const [runPoints, setRunPoints] = useState(0);
  const runPointsRef = useRef(0);

  const [phase, setPhase] = useState<'select' | 'play' | 'win' | 'lose'>('select');
  const phaseRef = useRef<'select' | 'play' | 'win' | 'lose'>('select');

  const [selectedDiff, setSelectedDiff] = useState<DifficultyConfig | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [tridents, setTridents] = useState(3);
  const tridentsRef = useRef(3);

  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  const aFade = useRef(new Animated.Value(0)).current;

  const [items, setItems] = useState<FallingItem[]>([]);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const itemYRef = useRef<Record<string, number>>({});
  const itemAnimStopRef = useRef<Record<string, (() => void) | undefined>>({});
  const caughtIdsRef = useRef<Record<string, true>>({});

  const [popups, setPopups] = useState<Popup[]>([]);

  const staffW = IS_VERY_TINY ? 112 : IS_TINY ? 120 : IS_SMALL ? 140 : 160;
  const staffH = IS_VERY_TINY ? 148 : IS_TINY ? 160 : IS_SMALL ? 190 : 210;

  const staffX = useRef(new Animated.Value((W - staffW) / 2)).current;
  const staffXNum = useRef((W - staffW) / 2);
  const staffXListenerId = useRef<string | null>(null);

  const moveLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopMoveLoop = () => {
    if (moveLoopRef.current) {
      clearInterval(moveLoopRef.current);
      moveLoopRef.current = null;
    }
  };
  const startMoveLoop = (dir: -1 | 1) => {
    stopMoveLoop();
    const step = IS_VERY_TINY ? 6 : IS_TINY ? 7 : IS_SMALL ? 8 : 9;
    moveLoopRef.current = setInterval(() => {
      if (phaseRef.current !== 'play') return;
      if (isPausedRef.current) return;

      const nextX = clamp(staffXNum.current + dir * step, 10, W - staffW - 10);
      staffX.setValue(nextX);
      staffXNum.current = nextX;
    }, 16);
  };

  const staffY = useMemo(() => {
    const controlsH = (IS_VERY_TINY ? 90 : IS_TINY ? 96 : 108) + Math.max(insets.bottom, 12);
    const base = H - controlsH - (IS_VERY_TINY ? 190 : IS_TINY ? 205 : 220);
    return clamp(base, 220, H - 210);
  }, [insets.bottom]);

  const targets = useMemo<ResourceKey[]>(() => {
    if (!selectedDiff) return [];
    return pickTargets(ALL_RESOURCES, selectedDiff.targetCount);
  }, [selectedDiff]);

  const endY = useMemo(() => staffY + staffH * 0.35, [staffY, staffH]);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);
  useEffect(() => {
    runPointsRef.current = runPoints;
  }, [runPoints]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    tridentsRef.current = tridents;
  }, [tridents]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    staffXListenerId.current = staffX.addListener(({ value }) => {
      staffXNum.current = value;
    });
    return () => {
      if (staffXListenerId.current) staffX.removeListener(staffXListenerId.current);
    };
  }, [staffX]);

  useEffect(() => {
    Animated.timing(aFade, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [aFade]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await getPoints();
      if (mounted) setPoints(p);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => stopMoveLoop();
  }, []);

  const headerPadTop = Math.max(insets.top, 12);

  const stopSpawning = () => {
    if (spawnTimer.current) {
      clearInterval(spawnTimer.current);
      spawnTimer.current = null;
    }
  };

  const stopAllAnimations = () => {
    Object.keys(itemAnimStopRef.current).forEach((id) => {
      const stop = itemAnimStopRef.current[id];
      if (stop) stop();
    });
  };

  const resetRun = () => {
    stopMoveLoop();
    stopSpawning();
    stopAllAnimations();

    setRunPoints(0);
    runPointsRef.current = 0;

    setTridents(3);
    tridentsRef.current = 3;

    setItems([]);
    setPopups([]);

    itemYRef.current = {};
    itemAnimStopRef.current = {};
    caughtIdsRef.current = {};

    setIsPaused(false);
    isPausedRef.current = false;

    staffX.setValue((W - staffW) / 2);
    staffXNum.current = (W - staffW) / 2;
  };

  const startSpawning = () => {
    if (!selectedDiff) return;

    stopSpawning();

    const speed = selectedDiff.speedPct / 100;
    const spawnInterval = clamp(Math.round(700 / speed), 280, 900);

    spawnTimer.current = setInterval(() => {
      if (isPausedRef.current) return;
      if (phaseRef.current !== 'play') return;
      spawnOne(speed);
    }, spawnInterval);
  };

  const spawnOne = (speed: number) => {
    const res = ALL_RESOURCES[Math.floor(Math.random() * ALL_RESOURCES.length)];
    const size = IS_VERY_TINY ? 44 : IS_TINY ? 46 : IS_SMALL ? 54 : 60;

    const leftPad = IS_VERY_TINY ? 14 : 18;
    const rightPad = IS_VERY_TINY ? 14 : 18;
    const x = leftPad + Math.random() * (W - leftPad - rightPad - size);

    const startY = -90;
    const durationMs = clamp(Math.round(4300 / speed), 1700, 5200);

    const y = new Animated.Value(startY);
    const id = uid();

    y.addListener(({ value }) => {
      itemYRef.current[id] = value;
    });

    const item: FallingItem = { id, resKey: res.key, x, size, y, durationMs };
    setItems((prev) => [...prev, item]);

    const anim = Animated.timing(y, {
      toValue: endY,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    itemAnimStopRef.current[id] = () => y.stopAnimation();

    anim.start(({ finished }) => {
      if (!finished) return;

      y.removeAllListeners();
      delete itemYRef.current[id];
      delete itemAnimStopRef.current[id];
      delete caughtIdsRef.current[id];

      setItems((prev) => prev.filter((it) => it.id !== id));
    });
  };

  const onStartPressed = (diff: DifficultyConfig) => {
    setSelectedDiff(diff);
    setConfirmVisible(true);
  };

  const beginGame = async () => {
    if (!selectedDiff) return;

    setConfirmVisible(false);
    resetRun();
    setPhase('play');

    const total = await getPoints();
    setPoints(total);

    setRunPoints(0);
    runPointsRef.current = 0;

    startSpawning();
  };

  const showPopup = useCallback(
    (kind: 'good' | 'bad', text: string) => {
      const id = uid();

      const x = staffXNum.current + staffW * 0.55;
      const y = staffY + staffH * 0.1;

      const a = new Animated.Value(0);
      const ty = new Animated.Value(0);

      const p: Popup = { id, text, x, y, a, ty, kind };
      setPopups((prev) => [...prev, p]);

      Animated.parallel([
        Animated.timing(a, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ty, {
          toValue: -22,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(a, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setPopups((prev) => prev.filter((pp) => pp.id !== id));
        });
      });
    },
    [staffH, staffW, staffY]
  );

  const rafRef = useRef<number | null>(null);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));

    delete itemYRef.current[id];

    const stop = itemAnimStopRef.current[id];
    if (stop) stop();
    delete itemAnimStopRef.current[id];

    delete caughtIdsRef.current[id];
  };

  const handleCatch = async (it: FallingItem) => {
    if (!selectedDiff) return;
    if (phaseRef.current !== 'play') return;
    if (isPausedRef.current) return;

    it.y.removeAllListeners();
    removeItem(it.id);

    const isTarget = targets.includes(it.resKey);

    if (!isTarget) {
      showPopup('bad', 'Opps!');

      setTridents((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          stopSpawning();
          stopMoveLoop();
          setPhase('lose');
          return 0;
        }
        return next;
      });

      return;
    }

    const max = selectedDiff.maxPoints;

    const currentRun = runPointsRef.current;
    const remainingRun = Math.max(0, max - currentRun);
    const delta = Math.min(selectedDiff.pointsPerGood, remainingRun);

    if (delta <= 0) {
      stopSpawning();
      stopMoveLoop();
      setPhase('win');
      return;
    }

    const nextRun = currentRun + delta;
    runPointsRef.current = nextRun;
    setRunPoints(nextRun);

    await addPoints(delta);
    const freshTotal = await getPoints();
    setPoints(freshTotal);

    showPopup('good', `+${delta}`);

    if (nextRun >= max) {
      stopSpawning();
      stopMoveLoop();
      setPhase('win');
    }
  };

  const checkCollisions = () => {
    if (phaseRef.current !== 'play' || isPausedRef.current) {
      rafRef.current = requestAnimationFrame(checkCollisions);
      return;
    }

    const sx = staffXNum.current;
    const staffCatchLeft = sx + staffW * 0.2;
    const staffCatchRight = sx + staffW * 0.8;

    const catchLineY = staffY + staffH * 0.1;

    const snapshot = items;
    for (const it of snapshot) {
      if (caughtIdsRef.current[it.id]) continue;

      const y = itemYRef.current[it.id];
      if (typeof y !== 'number') continue;

      if (y >= catchLineY - it.size * 0.6 && y <= catchLineY + it.size * 0.6) {
        const itemLeft = it.x;
        const itemRight = it.x + it.size;

        const overlap = itemRight >= staffCatchLeft && itemLeft <= staffCatchRight;
        if (overlap) {
          caughtIdsRef.current[it.id] = true;
          handleCatch(it);
          break;
        }
      }
    }

    rafRef.current = requestAnimationFrame(checkCollisions);
  };

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(checkCollisions);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [items]);

  const openPause = () => {
    if (phaseRef.current !== 'play') return;
    stopMoveLoop();
    setIsPaused(true);
    stopSpawning();
    stopAllAnimations();
  };

  const resumeGame = () => {
    if (phaseRef.current !== 'play') return;

    setIsPaused(false);
    if (!selectedDiff) return;

    setItems((prev) => {
      prev.forEach((it) => {
        it.y.stopAnimation((curY) => {
          const cur = typeof curY === 'number' ? curY : 0;

          const remaining = Math.max(0, endY - cur);
          const full = Math.max(1, endY - -90);
          const k = remaining / full;

          const newDur = clamp(Math.round(it.durationMs * k), 250, it.durationMs);

          const anim = Animated.timing(it.y, {
            toValue: endY,
            duration: newDur,
            easing: Easing.linear,
            useNativeDriver: true,
          });

          itemAnimStopRef.current[it.id] = () => it.y.stopAnimation();

          anim.start(({ finished }) => {
            if (!finished) return;

            it.y.removeAllListeners();
            delete itemYRef.current[it.id];
            delete itemAnimStopRef.current[it.id];
            delete caughtIdsRef.current[it.id];

            setItems((p2) => p2.filter((x) => x.id !== it.id));
          });
        });
      });

      return prev;
    });

    startSpawning();
  };

  const onExitToMenu = () => {
    stopSpawning();
    stopAllAnimations();
    stopMoveLoop();

    setPhase('select');
    setSelectedDiff(null);
    setConfirmVisible(false);

    resetRun();
  };

  const onTryAgain = () => {
    if (!selectedDiff) {
      onExitToMenu();
      return;
    }
    stopSpawning();
    stopAllAnimations();
    stopMoveLoop();

    resetRun();
    setPhase('play');
    startSpawning();
  };

  const brokenCount = 3 - tridents;

  const HEADER_H = IS_VERY_TINY ? 42 : 46;

  const contentTop = Math.max(insets.top, 12) + 10 + HEADER_H + 14;
  const contentBottom = Math.max(insets.bottom, 12) + 14;
  const availableH = H - contentTop - contentBottom;

  const BOARD_W = Math.min(420, W - 28);

  const BOARD_H = clamp(availableH, 420, 820);

  const diffTitle = selectedDiff?.title ?? 'Game Difficulty';

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.headerWrap, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={[styles.header, { height: HEADER_H }]}>
          <Pressable
            onPress={() => {
              if (phaseRef.current === 'play') {
                openPause();
                return;
              }
              navigation.goBack();
            }}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}
            hitSlop={14}
          >
            <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={styles.headerTitle}>{diffTitle}</Text>

          <View style={styles.coinsPill}>
            <Text style={styles.coinsText}>{points}</Text>
            <Image source={COIN} style={styles.coinIcon} resizeMode="contain" />
          </View>
        </View>
      </View>
      {phase === 'select' ? (
        <Animated.View style={[styles.selectRoot, { opacity: aFade }]}>
          <View style={[styles.selectBoard, { width: BOARD_W, height: BOARD_H }]}>
            <ScrollView
              scrollEnabled
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.selectContent}
            >
              {DIFFS.map((d) => (
                <View key={d.key} style={styles.diffCard}>
                  <View style={[styles.diffImgTop, { height: IS_VERY_TINY ? 68 : IS_TINY ? 74 : 92 }]}>
                    <Image source={d.levelImg} style={styles.levelImg} resizeMode="cover" />
                  </View>

                  <Text style={styles.diffTitle}>{d.title}</Text>
                  <Text style={styles.diffDesc}>{d.description}</Text>

                  <Pressable
                    style={({ pressed }) => [styles.startPill, pressed && { opacity: 0.92 }]}
                    onPress={() => onStartPressed(d)}
                  >
                    <Text style={styles.startPillText}>Start game!</Text>
                  </Pressable>
                </View>
              ))}

              <View style={{ height: 18 }} />
            </ScrollView>
          </View>
        </Animated.View>
      ) : null}

      {phase === 'play' ? (
        <View style={styles.playWrap} pointerEvents="box-none">
          <View style={[styles.hudRow, { width: Math.min(420, W - 28) }]}>
            <Text style={styles.tridentText}>{'♆'.repeat(tridents)}</Text>

            <View style={styles.scoreMini}>
              <Text style={styles.scoreMiniText}>{runPoints}</Text>
            </View>

            <View style={styles.targetsMiniRow}>
              {targets.map((k) => {
                const def = ALL_RESOURCES.find((r) => r.key === k);
                if (!def) return null;
                return <Image key={k} source={def.img} style={styles.targetIcon} resizeMode="contain" />;
              })}
            </View>
          </View>

          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {items.map((it) => {
              const def = ALL_RESOURCES.find((r) => r.key === it.resKey);
              if (!def) return null;

              return (
                <Animated.View
                  key={it.id}
                  style={[
                    styles.fallItem,
                    { width: it.size, height: it.size, left: it.x, transform: [{ translateY: it.y }] },
                  ]}
                >
                  <Image source={def.img} style={{ width: it.size, height: it.size }} resizeMode="contain" />
                </Animated.View>
              );
            })}
          </View>

          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {popups.map((p) => (
              <Animated.View
                key={p.id}
                style={[styles.popupWrap, { left: p.x, top: p.y, opacity: p.a, transform: [{ translateY: p.ty }] }]}
              >
                <Text style={[styles.popupText, p.kind === 'bad' && styles.popupBad]}>{p.text}</Text>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            style={[
              styles.staffWrap,
              { width: staffW, height: staffH, top: staffY, transform: [{ translateX: staffX }] },
            ]}
          >
            <Image source={STAFF} style={{ width: staffW, height: staffH }} resizeMode="contain" />
          </Animated.View>

          <View style={[styles.controlsRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Pressable
              onPressIn={() => startMoveLoop(-1)}
              onPressOut={stopMoveLoop}
              style={({ pressed }) => [styles.ctrlBtnSmall, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.ctrlTextSmall}>◀</Text>
            </Pressable>

            <Pressable
              onPress={openPause}
              style={({ pressed }) => [styles.ctrlBtnPause, pressed && { opacity: 0.92 }]}
              hitSlop={10}
            >
              <Text style={styles.ctrlTextPause}>II</Text>
            </Pressable>

            <Pressable
              onPressIn={() => startMoveLoop(1)}
              onPressOut={stopMoveLoop}
              style={({ pressed }) => [styles.ctrlBtnSmall, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.ctrlTextSmall}>▶</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {phase === 'win' || phase === 'lose' ? (
        <View style={styles.resultWrap}>
          <View style={[styles.resultCard, { width: Math.min(420, W - 28) }]}>
            <Text style={styles.resultTitle}>
              {phase === 'win' ? 'You have collected all the resources!' : 'You broke all the tridents!'}
            </Text>

            <View style={styles.resultStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Earned artifacts:</Text>
                <Text style={styles.statValue}>{runPoints}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Broken tridents:</Text>
                <Text style={styles.statValue}>{phase === 'lose' ? 3 : 3 - tridents}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Resources collected:</Text>
                <Text style={styles.statValue}>{phase === 'win' ? 'Max' : '—'}</Text>
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.92 }]} onPress={onTryAgain}>
              <Text style={styles.continueText}>Continue</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.exitBtn, pressed && { opacity: 0.92 }]} onPress={onExitToMenu}>
              <Text style={styles.exitText}>Exit</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalDim}>
          <View style={[styles.confirmCard, { width: Math.min(420, W - 28) }]}>
            <Text style={styles.confirmTitle}>{selectedDiff?.title ?? ''}</Text>

            <Text style={styles.confirmText}>
              Your resources for collection:{' '}
              <Text style={{ fontWeight: '900', color: '#fff' }}>{selectedDiff ? selectedDiff.targetCount : 0}</Text>
            </Text>

            <View style={styles.confirmIcons}>
              {targets.map((k) => {
                const def = ALL_RESOURCES.find((r) => r.key === k);
                if (!def) return null;
                return <Image key={k} source={def.img} style={styles.confirmIcon} resizeMode="contain" />;
              })}
            </View>

            <View style={styles.confirmBtnsRow}>
              <Pressable
                style={({ pressed }) => [styles.confirmCancel, pressed && { opacity: 0.92 }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.confirmGo, pressed && { opacity: 0.92 }]} onPress={beginGame}>
                <Text style={styles.confirmGoText}>Let’s go!</Text>
              </Pressable>
            </View>

            <Text style={styles.confirmMeta}>
              Points per target: {selectedDiff?.pointsPerGood ?? 0} • Speed: {selectedDiff?.speedPct ?? 0}% • Max:{' '}
              {selectedDiff?.maxPoints ?? 0}
            </Text>
          </View>
        </View>
      </Modal>

      <Modal visible={isPaused} transparent animationType="fade" onRequestClose={() => setIsPaused(false)}>
        <View style={styles.modalDim}>
          <View style={[styles.pauseCard, { width: Math.min(420, W - 28) }]}>
            <Text style={styles.pauseTitle}>Pause</Text>
            <Text style={styles.pauseText}>Are you sure you want to finish the game?</Text>

            <View style={styles.pauseBtnsRow}>
              <Pressable style={({ pressed }) => [styles.pauseExit, pressed && { opacity: 0.92 }]} onPress={onExitToMenu}>
                <Text style={styles.pauseExitText}>Exit</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.pauseContinue, pressed && { opacity: 0.92 }]} onPress={resumeGame}>
                <Text style={styles.pauseContinueText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: Math.max(insets.bottom, 12) }} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  headerWrap: { paddingHorizontal: 18 },
  header: {
    marginTop: 10,
    height: 46,
    borderRadius: 16,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  headerTitle: { color: GOLD, fontSize: 14, fontWeight: '900' },

  coinsPill: {
    position: 'absolute',
    right: 10,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: 'rgba(0,0,0,0.20)',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  coinsText: { color: GOLD, fontWeight: '900', fontSize: 16 },
  coinIcon: { width: 18, height: 18 },

  selectRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  selectBoard: {
    borderRadius: 22,
    backgroundColor: 'rgba(14, 45, 92, 0.88)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
    padding: 12,
  },
  selectContent: {
    paddingBottom: 12,
  },

  diffCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.92)',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 14,
    marginTop: 12,
  },
  diffImgTop: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  levelImg: { width: '100%', height: '100%' },

  diffTitle: { marginTop: 10, color: '#FFFFFF', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  diffDesc: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  startPill: {
    marginTop: 10,
    height: 32,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  startPillText: { color: '#0B1730', fontSize: 12, fontWeight: '900' },

  playWrap: { flex: 1 },

  hudRow: {
    marginTop: 10,
    alignSelf: 'center',
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.85)',
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tridentText: { color: GOLD, fontWeight: '900', fontSize: 16, letterSpacing: 3 },

  scoreMini: {
    height: 30,
    minWidth: 60,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreMiniText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },

  targetsMiniRow: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  targetIcon: { width: 22, height: 22 },

  fallItem: { position: 'absolute', top: 0 },
  staffWrap: { position: 'absolute', left: 0 },

  popupWrap: { position: 'absolute' },
  popupText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  popupBad: { color: 'rgba(255,255,255,0.95)' },

  controlsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 14,
    paddingHorizontal: 18,
  },
  ctrlBtnSmall: {
    width: IS_VERY_TINY ? 80 : IS_TINY ? 86 : 94,
    height: IS_VERY_TINY ? 44 : IS_TINY ? 46 : 50,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.88)',
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlTextSmall: { color: GOLD, fontSize: 20, fontWeight: '900' },

  ctrlBtnPause: {
    width: IS_VERY_TINY ? 80 : IS_TINY ? 86 : 94,
    height: IS_VERY_TINY ? 44 : IS_TINY ? 46 : 50,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlTextPause: { color: GOLD, fontSize: 16, fontWeight: '900', letterSpacing: 2 },

  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: IS_TINY ? 26 : 34 },
  resultCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.96)',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 16,
    alignItems: 'center',
  },
  resultTitle: { color: GOLD, fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  resultStats: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statLabel: { color: 'rgba(255,255,255,0.80)', fontSize: 12, fontWeight: '800' },
  statValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },

  continueBtn: {
    marginTop: 14,
    width: '100%',
    height: 50,
    borderRadius: 26,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { color: '#0B1730', fontSize: 15, fontWeight: '900' },

  exitBtn: {
    marginTop: 10,
    width: '100%',
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  modalDim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  confirmCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.98)',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 16,
    alignItems: 'center',
  },
  confirmTitle: { color: GOLD, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  confirmText: { marginTop: 10, color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  confirmIcons: { marginTop: 10, flexDirection: 'row', justifyContent: 'center', columnGap: 12, flexWrap: 'wrap' },
  confirmIcon: { width: 26, height: 26 },

  confirmBtnsRow: { marginTop: 12, width: '100%', flexDirection: 'row', justifyContent: 'space-between', columnGap: 12 },

  confirmCancel: {
    flex: 1,
    height: 34,
    borderRadius: 18,
    backgroundColor: '#4B7CFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: { color: '#0B1730', fontSize: 12, fontWeight: '900' },

  confirmGo: { flex: 1, height: 34, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  confirmGoText: { color: '#0B1730', fontSize: 12, fontWeight: '900' },

  confirmMeta: { marginTop: 10, color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: '700', textAlign: 'center' },

  pauseCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.98)',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 16,
    alignItems: 'center',
  },
  pauseTitle: { color: GOLD, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  pauseText: { marginTop: 10, color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '800', textAlign: 'center' },

  pauseBtnsRow: { marginTop: 12, width: '100%', flexDirection: 'row', justifyContent: 'space-between', columnGap: 12 },

  pauseExit: {
    flex: 1,
    height: 34,
    borderRadius: 18,
    backgroundColor: '#4B7CFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseExitText: { color: '#0B1730', fontSize: 12, fontWeight: '900' },

  pauseContinue: { flex: 1, height: 34, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  pauseContinueText: { color: '#0B1730', fontSize: 12, fontWeight: '900' },
});
