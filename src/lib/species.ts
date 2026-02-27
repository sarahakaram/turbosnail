export type SpeciesSlug =
  | 'baobab'
  | 'mangrove'
  | 'bamboo'
  | 'strangler-fig'
  | 'willow'
  | 'oak'
  | 'aspen-grove';

export interface Species {
  slug: SpeciesSlug;
  name: string;
  emoji: string;
  color: string;
  colorClass: string;
  bgClass: string;
  processingStyle: string;
  activation: string;
  stormResponse: string;
  coreDerailer: string;
  learningStyle: string;
  learningDescription: string;
  primaryDriver: string;
  secondaryDriver: string;
  morningPrompt: string;
  description: string;
}

export const SPECIES: Record<SpeciesSlug, Species> = {
  baobab: {
    slug: 'baobab',
    name: 'Baobab',
    emoji: '🌳',
    color: '#5B7553',
    colorClass: 'text-baobab',
    bgClass: 'bg-baobab',
    processingStyle: 'Internal & Deep',
    activation: 'Technical Truth',
    stormResponse: 'Goes quiet to analyze',
    coreDerailer: 'Analysis paralysis — bottleneck',
    learningStyle: 'Academic',
    learningDescription: 'Structured, research-first, must understand before acting',
    primaryDriver: 'Mastery',
    secondaryDriver: 'Security',
    morningPrompt: 'What single question do you need to think deeply on today?',
    description:
      'Deep thinkers who process internally. You need to fully understand before you act. Your strength is depth — your risk is getting stuck in analysis.',
  },
  mangrove: {
    slug: 'mangrove',
    name: 'Mangrove',
    emoji: '🌿',
    color: '#2A9D8F',
    colorClass: 'text-mangrove',
    bgClass: 'bg-mangrove',
    processingStyle: 'External & Visible',
    activation: 'Social Flux',
    stormResponse: 'Reaches out to tangle',
    coreDerailer: 'Over-communicates — chaos-maker',
    learningStyle: 'Social',
    learningDescription: 'Learns through conversation, relationships, live feedback',
    primaryDriver: 'Affiliation',
    secondaryDriver: 'Recognition',
    morningPrompt: 'Who do you most need to connect with today and why?',
    description:
      'Relational processors who think out loud. You learn and lead through connection. Your strength is weaving networks — your risk is creating noise.',
  },
  bamboo: {
    slug: 'bamboo',
    name: 'Bamboo',
    emoji: '🎋',
    color: '#E9C46A',
    colorClass: 'text-bamboo',
    bgClass: 'bg-bamboo',
    processingStyle: 'Hyper-Focused',
    activation: 'Urgent Interest',
    stormResponse: 'Snaps into hyper-drive',
    coreDerailer: 'Flash-in-the-pan — whiplash',
    learningStyle: 'Experiential',
    learningDescription: 'Learns by doing, fast cycles, trial and error',
    primaryDriver: 'Achievement',
    secondaryDriver: 'Commerce',
    morningPrompt: 'What one thing can you ship or finish by end of day?',
    description:
      'Fast movers who learn by doing. You thrive on urgency and tangible output. Your strength is momentum — your risk is burning out or changing direction too often.',
  },
  'strangler-fig': {
    slug: 'strangler-fig',
    name: 'Strangler Fig',
    emoji: '🪴',
    color: '#8B5E3C',
    colorClass: 'text-strangler',
    bgClass: 'bg-strangler',
    processingStyle: 'Scaffolded',
    activation: 'Systemic Gaps',
    stormResponse: 'Accelerates autonomy',
    coreDerailer: 'Outgrows host — usurper',
    learningStyle: 'Apprentice',
    learningDescription: 'Observes systems deeply, then surpasses them',
    primaryDriver: 'Power',
    secondaryDriver: 'Mastery',
    morningPrompt: 'What system or process can you improve or take ownership of today?',
    description:
      'Strategic builders who learn by scaffolding off existing structures. You see gaps others miss. Your strength is systemic thinking — your risk is moving too fast for the host.',
  },
  willow: {
    slug: 'willow',
    name: 'Willow',
    emoji: '🌾',
    color: '#A78BFA',
    colorClass: 'text-willow',
    bgClass: 'bg-willow',
    processingStyle: 'Adaptive',
    activation: 'Creative Variety',
    stormResponse: 'Bends with the wind',
    coreDerailer: 'No spine — chameleon',
    learningStyle: 'Exploratory',
    learningDescription: 'Learns across domains, synthesizes patterns',
    primaryDriver: 'Purpose',
    secondaryDriver: 'Aesthetics',
    morningPrompt: 'What unexpected connection can you explore or create today?',
    description:
      'Adaptive synthesizers who draw from many domains. You bend without breaking. Your strength is creative flexibility — your risk is losing your own center.',
  },
  oak: {
    slug: 'oak',
    name: 'Oak',
    emoji: '🌲',
    color: '#6B7280',
    colorClass: 'text-oak',
    bgClass: 'bg-oak',
    processingStyle: 'Structured',
    activation: 'Predictable Horizons',
    stormResponse: 'Doubles down on process',
    coreDerailer: 'Rigidity — bureaucrat',
    learningStyle: 'Structured',
    learningDescription: 'Learns through proven methods, documentation, process',
    primaryDriver: 'Security',
    secondaryDriver: 'Tradition',
    morningPrompt: 'What is the most important process to protect or strengthen today?',
    description:
      'Structured leaders who create stability. You thrive on proven methods and clear process. Your strength is reliability — your risk is resisting necessary change.',
  },
  'aspen-grove': {
    slug: 'aspen-grove',
    name: 'Aspen Grove',
    emoji: '🌱',
    color: '#F4A261',
    colorClass: 'text-aspen',
    bgClass: 'bg-aspen',
    processingStyle: 'Distributed',
    activation: 'Shared Purpose',
    stormResponse: 'Protects the group',
    coreDerailer: 'Consensus paralysis — can\'t decide',
    learningStyle: 'Collaborative',
    learningDescription: 'Learns through shared experience, collective sense-making',
    primaryDriver: 'Affiliation',
    secondaryDriver: 'Purpose',
    morningPrompt: 'What does your team need from you today to feel connected and aligned?',
    description:
      'Collective leaders who think in terms of the whole. You protect and nurture group cohesion. Your strength is shared purpose — your risk is avoiding hard solo decisions.',
  },
};

export const SPECIES_LIST = Object.values(SPECIES);

export function getSpecies(slug: string): Species | undefined {
  return SPECIES[slug as SpeciesSlug];
}

export function getSpeciesColor(slug: string): string {
  return getSpecies(slug)?.color ?? '#6B7280';
}
