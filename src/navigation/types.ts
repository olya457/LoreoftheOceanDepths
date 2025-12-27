export type LordKey = 'mermaid' | 'poseidon';

export type RootStackParamList = {
  Loader: undefined;
  Onboarding: undefined;
  Menu: undefined;

  StartAdventure: undefined;
  Overlords: undefined;

  Exchanger: { lord: LordKey };
  SavedStories: { lord?: LordKey } | undefined;

  Statistics: undefined;

  WhatsInside: { lord: LordKey };
};
