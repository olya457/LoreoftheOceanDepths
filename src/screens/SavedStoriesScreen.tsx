import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  FlatList,
  Share,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, LordKey } from '../navigation/types';
import { getPoints, getUnlockedCount, unlockNextStory, getUnlockCost } from '../store/progressStore';

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;
const IS_TINY = H < 690;

const BG = require('../assets/background.png');

const ICON_BACK = require('../assets/back.png');
const LOCK_OPEN = require('../assets/lock_open.png');
const LOCK_CLOSED = require('../assets/lock_closed.png');

const IMG_POSEIDON = require('../assets/poseidon_card.png');
const IMG_MERMAID = require('../assets/mermaid_card.png');

type Story = {
  id: string;
  title: string;
  body: string;
};

type ScreenRoute = RouteProp<RootStackParamList, 'SavedStories'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const POSEIDON_STORIES: Story[] = [
  {
    id: 'p1',
    title: "The Trident's Weight",
    body:
      "Everyone only sees my power. The roar of the waves, the shaking of the earth. But they don't feel the weight of the Trident. It is not just a weapon. It is a balance. Every move I make can either raise a continent or plunge it into the abyss. Yesterday, I wanted to smash an arrogant fleet that was plundering the reefs without permission. I had already raised my hand, feeling the energy boil in the water. But I remembered the small fishing village on that shore, which feeds itself from these same waters. And I lowered the Trident. Instead of a storm, just a small 'warning' low tide. Let them think.",
  },
  {
    id: 'p2',
    title: 'The Dispute with Athena',
    body:
      "Athena again. That old argument over Attica still rings in my ears. I gave them a salt spring! A spring, gushing right out of the rock, a sign of the sea's inexhaustible wealth! And she? An olive tree. An olive tree! A piece of wood that burns and yields oil. The mortals chose her. And even now, when I look at Athens, I feel a bitterness born in my waves. Foolish mortals. They chose the land when they had an entire ocean of opportunities before them.",
  },
  {
    id: 'p3',
    title: 'The Palace at Aegae',
    body:
      'My palace at Aegae is not what people imagine. No golden towers, no columns adorned with diamonds. It is light. Every wall, every arch, is made of pearl and the purest, transparent coral. The sunlight, passing through the mass of water, refracts and creates rainbows on the floor. And there, in the silence, I truly rest. No shouts of sailors, no complaints from the nymphs, no quarrels with Zeus. Only me, Amphitrite, and the steady breathing of the Ocean. This is my true throne, not the storm.',
  },
  {
    id: 'p4',
    title: 'The Horses of the Sea',
    body:
      "They say I created horses. It is true, but not the way they think. I didn't mold them from clay. When I first rose from the sea, I felt speed. It wasn't swimming, but flying over the surface, a pure, uncontrolled energy. And I wanted to give that energy to the land. I struck the shore with the Trident, and from the spray and foam they burst forth—the first horses. Wild, untamed, with manes of seaweed. A part of me is in them, which is why I always patronize them, and they are the only creatures on land that I consider my family.",
  },
  {
    id: 'p5',
    title: 'The Price of Forgiveness',
    body:
      "I know I am feared. I am the wrath of the sea. But no one remembers how many I have saved. That ship that was caught in the storm off the coast of the Peloponnese. The captain forgot to make a sacrifice to me before setting sail, but his daughter... She threw her only gold locket into the water. A trifle? Not to me. It was an act of humility and trust. My anger instantly subsided. I couldn't save the ship, but I summoned the dolphins, and they carried every survivor to shore. The sea always takes, but it also gives. You just need to know what payment will appease its Lord.",
  },
  {
    id: 'p6',
    title: 'The Coral Oath',
    body:
      'They think my laws are storms and tides. But my strongest rule is quiet: coral must live. I carved an oath into the seabed—no anchors, no nets, no greed where reefs breathe. When mortals forget, I do not always punish with thunder. Sometimes I simply remove the current that guides them home. A slow lesson is still a lesson.',
  },
  {
    id: 'p7',
    title: 'The Quiet Harbor',
    body:
      'One night I watched a harbor sleep. Lanterns trembled on the water like tiny moons. A sailor prayed not for treasure, but for his brother’s safe return. I could have answered with a spectacle. Instead, I calmed the swell so the small boat could pass the rocks. Mercy is strongest when no one sees it.',
  },
  {
    id: 'p8',
    title: 'Salt in the Crown',
    body:
      'Kings wear gold. I wear salt. It stings old wounds, it preserves the truth. When rulers ask for favor, I taste their words in the spray. If there is rot beneath the promise, the sea turns heavy. If there is honesty, even a poor fisherman can find a generous tide.',
  },
  {
    id: 'p9',
    title: "The Whale’s Map",
    body:
      'A whale carries routes older than empires. Once, she traced a spiral in the deep and invited me to follow. There I found warm vents glowing like hidden stars. I marked the place with a ring of shells—my private map. Not every wonder is meant to be named.',
  },
  {
    id: 'p10',
    title: 'The Bronze Net',
    body:
      'A cursed net sank near Aegae—bronze threads, hungry and silent. It caught not fish, but light. Divers vanished in its shadow. I could have shattered it, yet metal remembers rage. I asked the octopus to unweave it knot by knot. Patience can defeat any trap.',
  },
  {
    id: 'p11',
    title: 'The Lantern Festival Below',
    body:
      'Down where the sand is fine as flour, the nymphs hold a festival. They paint shells and release glowing plankton into the water. It looks like a constellation drifting. I sit among them without a crown. A god is still allowed to feel joy.',
  },
  {
    id: 'p12',
    title: 'A Storm Held Back',
    body:
      'The storm wanted to rise—hot air, cold sea, the perfect argument. My hand reached for the Trident… and stopped. I remembered the children on the pier, counting waves like they were stories. I let the clouds grumble, but I kept the lightning asleep.',
  },
  {
    id: 'p13',
    title: 'The Pearl Tribunal',
    body:
      'When two clans of dolphins disputed a feeding ground, they asked for my judgment. I placed one pearl on the sand and watched who guarded it and who tried to steal it. The verdict was obvious. Justice doesn’t need speeches—only a clear test.',
  },
  {
    id: 'p14',
    title: 'The Broken Statue',
    body:
      'A statue of me fell from a cliff and cracked on the rocks. Mortals would call it disrespect. I called it time. I carried the fragments to a reef and let coral rebuild my face slowly. The sea restores what pride cannot.',
  },
  {
    id: 'p15',
    title: 'The Last Tide of Winter',
    body:
      'In winter the sea becomes strict and clean. The last tide before ice feels like a door closing. I listen to the silence and count the ships that made it home. I am feared for my wrath, but I am also the one who keeps the balance.',
  },
];

const MERMAID_STORIES: Story[] = [
  {
    id: 'm1',
    title: 'The Storm Song',
    body:
      'There was a Storm yesterday. Not the kind that just rocks ships, but the kind that tears them to splinters. I sat on top of our Coral Palace and listened to it rumble overhead. Many of my sisters get scared and hide in the caves. But me? I sing back. My voice is thin, silver, but it pierces the chaos. And I saw how the largest wave, the one that looked like a mountain, suddenly smoothed out, calmed for a moment. I think even Great Poseidon was listening.',
  },
  {
    id: 'm2',
    title: 'The Glass City',
    body:
      "Humans call it a 'sunken ship'. For us, it’s a whole city. Glass portholes, copper railings, and such... silence. I visit often. I collect shiny beads, scraps of silk ribbons, and sometimes find strange, flat books. And once, I found a small wooden figure—a mermaid, can you imagine? And she had a little fish instead of a tail. I placed her on the tallest mast so she could look at the sky. That’s probably like their dreams.",
  },
  {
    id: 'm3',
    title: 'The Dolphin Conspiracy',
    body:
      "I have a friend—an old dolphin named Echo. He's seen more sunsets than my great-great-grandfather has seen pearls. Today, he brought me news: something very large and very noisy is being built on the surface, right above our favorite manatee feeding ground. I know what that means. We decided to give them a small 'welcome.' Echo promised to gather the pod, and I'll prepare the most enticing current. Let them find another way. The sea is not a road.",
  },
  {
    id: 'm4',
    title: 'The Human Whisper',
    body:
      "The strangest thing about humans is their speech. It doesn't flow like water; it crashes against the rocks like the tide. I’ve learned to understand snippets when they sing on their boats. It’s always the same: about love, about gold, about fear. But yesterday, I heard something different. A boy was sitting on the edge of the pier, talking to the sea. He was talking about his sadness over a lost seashell. Just a seashell! I couldn't resist. I swam so close that his feet were almost next to my tail. And I left the most beautiful, iridescent shell I could find right at his feet. He didn't see me. But his smile lit up even the ocean floor.",
  },
  {
    id: 'm5',
    title: 'The Lost Comb',
    body:
      "My hair is my strength. It holds all the shades of the sea: from emerald to deep indigo. And I comb it with a comb made of fin bone. But last week, I lost it in the underwater caves, where the glowing jellyfish live. I searched for it for three days, and my magic weakened. I couldn't even summon small fish. I had to ask the octopus for help. Humiliating, right? But when he returned the comb, tangled with seaweed and shining, I realized that true strength isn't in well-combed hair. It's in the connections you forge in the deep.",
  },
  {
    id: 'm6',
    title: 'Moonlight Bubbles',
    body:
      'At night the surface becomes a mirror. I swim under it and blow bubbles into the moonlight. Each bubble holds a tiny reflection, a stolen star. When one pops, it makes a sound like a secret being released. I never tell my sisters. Some wonders are private.',
  },
  {
    id: 'm7',
    title: 'The Ribbon Shrine',
    body:
      'I found a ribbon tangled on a rock—soft, pale, and stubborn. Humans drop so many things, as if the sea is a pocket. I tied it around a coral branch like an offering. Now fish dart through it like it’s a doorway. Maybe it became holy by accident.',
  },
  {
    id: 'm8',
    title: 'The Library of Sand',
    body:
      'There is a place where currents write. Lines appear on the seabed, then vanish. I sit and read them before they fade—stories made of ripples. No ink, no paper, only water remembering itself. If you blink too long, you miss a chapter.',
  },
  {
    id: 'm9',
    title: "Echo’s Old Joke",
    body:
      'Echo the dolphin told me a joke older than pearls. He clicked and whistled until I understood: it was about a crab who wanted to be a king. I laughed so hard my tail hit the kelp. Laughter travels far underwater. Somewhere, Poseidon surely heard it.',
  },
  {
    id: 'm10',
    title: 'The Mirror Shell',
    body:
      'A shell as smooth as glass rested in a crevice. When I looked into it, I saw myself… but not exactly. My eyes were brighter, my crown taller, my fear invisible. I realized the shell shows what you wish to be. I left it for another dreamer.',
  },
  {
    id: 'm11',
    title: 'The Painted Current',
    body:
      'Near the reef, plankton glows in colors—blue, green, gold. If you swim through it fast, the water paints your hair like ribbons of light. I did it once, then twice, until the night turned into a festival around me. Even sharks looked confused.',
  },
  {
    id: 'm12',
    title: 'A Small Rescue',
    body:
      'A tiny turtle got stuck in a loop of rope. It thrashed, tired, angry at the world. I sang softly so it would calm, then chewed the fibers with my sharpest shell-edge. When it swam away, it didn’t look back. That’s fine. Freedom doesn’t owe thanks.',
  },
  {
    id: 'm13',
    title: 'The Coral Crown',
    body:
      'My sisters believe crowns must be made of pearls. I disagree. I grew a crown from living coral—slow, patient, warm. It changes shape with the seasons. It’s never the same twice. That’s what makes it true: it lives, like the sea itself.',
  },
  {
    id: 'm14',
    title: 'The Surface Lullaby',
    body:
      'Sometimes I float beneath a boat and listen. Humans sing as if their voices are heavy, falling into the water. I catch the melody and turn it lighter, make it drift. When they stop, the sea keeps singing for them. They don’t know their song survived.',
  },
  {
    id: 'm15',
    title: 'The Secret Door',
    body:
      'In a wall of stone there is a crack that breathes warm water. It feels like a hidden door. I pressed my ear to it and heard distant rumbling—an underwater river speaking. One day I’ll follow it. Not yet. Some doors should be opened when you’re ready.',
  },
];

function TopBar({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  return (
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
  );
}

export default function SavedStoriesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();

  const initialLord: LordKey | null = route.params?.lord ?? null;

  const [hero, setHero] = useState<LordKey | null>(initialLord);
  const [openStory, setOpenStory] = useState<Story | null>(null);

  const [points, setPoints] = useState<number>(0);
  const [unlockedCount, setUnlockedCount] = useState<number>(1);

  const [unlockModalVisible, setUnlockModalVisible] = useState<boolean>(false);

  const unlockCost = getUnlockCost();

  const listTitle = hero === 'poseidon' ? 'Poseidon stories' : 'Mermaid stories';

  const data: Story[] = useMemo(() => {
    if (hero === 'poseidon') return POSEIDON_STORIES;
    return MERMAID_STORIES;
  }, [hero]);

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
    let mounted = true;
    (async () => {
      if (!hero) return;
      const c = await getUnlockedCount(hero);
      if (mounted) setUnlockedCount(c);
    })();
    return () => {
      mounted = false;
    };
  }, [hero]);

  const refreshPoints = async () => {
    const p = await getPoints();
    setPoints(p);
  };

  const onShare = async () => {
    if (!openStory) return;
    try {
      await Share.share({ message: `${openStory.title}\n\n${openStory.body}` });
    } catch {}
  };

  const onTryUnlockNext = async () => {
    if (!hero) return;

    const res = await unlockNextStory(hero);
    await refreshPoints();

    if (res.ok) {
      setUnlockedCount(res.unlockedCount);
      setUnlockModalVisible(false);
      return;
    }
  };

  const storyCardHeight = useMemo(() => {
    const base = IS_TINY ? 420 : IS_SMALL ? 470 : 520;
    const cap = H - (IS_TINY ? 230 : 250);
    return Math.min(cap, base) - 40;
  }, []);

  if (!hero) {
    return (
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <TopBar title="Saved stories" />

        <View style={styles.sectionWrap}>
          <View style={styles.bigCard}>
            <Image source={IMG_POSEIDON} style={styles.bigCardImg} resizeMode="contain" />
            <Text style={styles.bigCardTitle}>Poseidon stories</Text>
            <Pressable
              style={({ pressed }) => [styles.openPill, pressed && { opacity: 0.9 }]}
              onPress={() => setHero('poseidon')}
            >
              <Text style={styles.openPillText}>Open</Text>
            </Pressable>
          </View>

          <View style={[styles.bigCard, { marginTop: 18 }]}>
            <Image source={IMG_MERMAID} style={styles.bigCardImg} resizeMode="contain" />
            <Text style={styles.bigCardTitle}>Mermaid stories</Text>
            <Pressable
              style={({ pressed }) => [styles.openPill, pressed && { opacity: 0.9 }]}
              onPress={() => setHero('mermaid')}
            >
              <Text style={styles.openPillText}>Open</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (openStory) {
    return (
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <TopBar title={hero === 'poseidon' ? 'Poseidon' : 'Mermaid'} />

        <View style={styles.storyCardWrap}>
          <View style={[styles.storyCard, { height: storyCardHeight }]}>
            <Text style={styles.storyTitle}>{openStory.title}</Text>
            <Text style={styles.storyBody}>{openStory.body}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.92 }]}
            onPress={onShare}
          >
            <Text style={styles.shareText}>Share</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.backToListBtn, pressed && { opacity: 0.92 }]}
            onPress={() => setOpenStory(null)}
          >
            <Text style={styles.backToListText}>Back to list</Text>
          </Pressable>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <TopBar title={listTitle} />

      <View style={styles.pointsRow}>
        <Text style={styles.pointsText}>Points: {points}</Text>
        <Text style={styles.pointsText}>Unlock cost: {unlockCost}</Text>
      </View>

      <View style={styles.listWrap}>
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 40,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item, index }) => {
            const unlocked = index < unlockedCount;
            const nextToUnlock = index === unlockedCount;

            return (
              <Pressable
                onPress={() => {
                  if (unlocked) {
                    setOpenStory(item);
                    return;
                  }
                  if (nextToUnlock) {
                    setUnlockModalVisible(true);
                  }
                }}
                style={({ pressed }) => [
                  styles.storyRow,
                  !unlocked && !nextToUnlock && { opacity: 0.75 },
                  (unlocked || nextToUnlock) && pressed && { opacity: 0.92 },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  {!unlocked && nextToUnlock ? (
                    <Text style={styles.rowSub}>Unlock next for {unlockCost} points</Text>
                  ) : null}
                </View>

                <Image
                  source={unlocked ? LOCK_OPEN : LOCK_CLOSED}
                  style={styles.lockIcon}
                  resizeMode="contain"
                />
              </Pressable>
            );
          }}
        />
      </View>

      <Modal
        visible={unlockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnlockModalVisible(false)}
      >
        <View style={styles.modalDim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Unlock next story?</Text>

            <Text style={styles.modalText}>
              Cost: <Text style={styles.bold}>{unlockCost}</Text> points
            </Text>

            <Text style={styles.modalText}>
              Your points: <Text style={styles.bold}>{points}</Text>
            </Text>

            <Pressable
              onPress={onTryUnlockNext}
              disabled={points < unlockCost}
              style={({ pressed }) => [
                styles.modalBtnGold,
                points < unlockCost && { opacity: 0.45 },
                pressed && points >= unlockCost && { opacity: 0.92 },
              ]}
            >
              <Text style={styles.modalBtnGoldText}>
                {points < unlockCost ? 'Not enough points' : 'Unlock'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setUnlockModalVisible(false)}
              style={({ pressed }) => [styles.modalBtnDark, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.modalBtnDarkText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  topTitle: { color: GOLD, fontSize: 14, fontWeight: '900' },

  sectionWrap: { paddingHorizontal: 18, paddingTop: 18 },

  bigCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.92)',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 14,
    alignItems: 'center',
  },
  bigCardImg: { width: Math.min(260, W - 120), height: IS_TINY ? 150 : 170 },
  bigCardTitle: { marginTop: 8, color: GOLD, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  openPill: {
    marginTop: 10,
    height: 30,
    minWidth: 86,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  openPillText: { color: '#0B1730', fontSize: 12, fontWeight: '900' },

  pointsRow: {
    paddingHorizontal: 18,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointsText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800' },

  listWrap: { flex: 1, paddingTop: 10 },

  storyRow: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 45, 92, 0.92)',
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowLeft: { flex: 1, paddingRight: 10 },
  rowTitle: { color: GOLD, fontSize: 13, fontWeight: '900' },
  rowSub: { marginTop: 4, color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: '700' },
  lockIcon: { width: 20, height: 20, opacity: 0.98 },

  storyCardWrap: { flex: 1, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24 },

  storyCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.92)',
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  storyTitle: { color: GOLD, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  storyBody: { color: 'rgba(255,255,255,0.96)', fontSize: 16, fontWeight: '600', lineHeight: 22, textAlign: 'center' },

  shareBtn: {
    marginTop: 14,
    height: 54,
    borderRadius: 28,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: 30 }],
  },
  shareText: { color: '#0B1730', fontSize: 16, fontWeight: '900' },

  backToListBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: 30 }],
  },
  backToListText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  modalDim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: Math.min(380, W - 40),
    borderRadius: 18,
    backgroundColor: 'rgba(14, 45, 92, 0.98)',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: { color: GOLD, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  modalText: { marginTop: 8, color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: '700' },
  bold: { fontWeight: '900', color: '#fff' },

  modalBtnGold: {
    marginTop: 14,
    width: '100%',
    height: 50,
    borderRadius: 26,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnGoldText: { color: '#0B1730', fontSize: 15, fontWeight: '900' },

  modalBtnDark: {
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
  modalBtnDarkText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
