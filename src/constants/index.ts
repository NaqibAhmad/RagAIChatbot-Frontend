import { ModelOption, SearchTypeOption } from '@/types';

export const OPENAI_MODELS: ModelOption[] = [
  {
    value: 'gpt-5',
    label: 'GPT-5',
    description: 'Latest and most capable model, best for complex reasoning and analysis',
  },
  {
    value: 'gpt-5-mini',
    label: 'GPT-5 Mini',
    description: 'Fast and efficient, great for most tasks',
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Most capable model, best for complex reasoning and analysis',
  },
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    description: 'Fast and efficient, great for most tasks',
  },
  {
    value: 'gpt-4.1',
    label: 'GPT-4.1',
    description: 'Advanced model with enhanced reasoning capabilities',
  },
  {
    value: 'gpt-4.1-mini',
    label: 'GPT-4.1 Mini',
    description: 'Balanced performance and speed for everyday use',
  },
];

export const SEARCH_TYPES: SearchTypeOption[] = [
  {
    value: 'hybrid',
    label: 'Hybrid Search',
    description: 'Combines semantic and keyword search for best results',
  },
  {
    value: 'semantic',
    label: 'Semantic Search',
    description: 'Uses vector similarity for context-aware results',
  },
  {
    value: 'keyword',
    label: 'Keyword Search',
    description: 'Uses BM25 algorithm for exact keyword matching',
  },
];

export const DEFAULT_SETTINGS = {
  model: 'gpt-4o-mini',
  temperature: 0.0,
  search_type: 'hybrid' as const,
};

export const TEMPERATURE_PRESETS = [
  { value: 0.0, label: 'Deterministic', description: 'Most focused and consistent' },
  { value: 0.3, label: 'Creative', description: 'Balanced creativity and focus' },
  { value: 0.7, label: 'Very Creative', description: 'More varied and imaginative' },
  { value: 1.0, label: 'Maximum Creativity', description: 'Most diverse and creative' },
];

export const FILE_TYPES = {
  PDF: '.pdf',
  DOCX: '.docx',
  TXT: '.txt',
  MD: '.md',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

export const CHAT_UI = {
  MAX_MESSAGE_LENGTH: 4000,
  TYPING_INDICATOR_DELAY: 1000,
  MESSAGE_ANIMATION_DURATION: 300,
  SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,
};

export const NOTIFICATIONS = {
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  INFO_DURATION: 4000,
};
