export type ChronicleCategory =
  | 'frontline'
  | 'politics'
  | 'diplomacy'
  | 'economy'
  | 'humanitarian';

export type ChronicleEventSource = {
  label: string;
  url: string;
};

export type ChronicleEventStatus = 'confirmed' | 'ongoing' | 'future';

export type ChronicleEvent = {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: ChronicleCategory;
  location?: string;
  tags?: string[];
  impact?: string;
  sources?: ChronicleEventSource[];
  status?: ChronicleEventStatus;
};
