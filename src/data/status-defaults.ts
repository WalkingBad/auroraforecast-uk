export const DEFAULT_STATUS_COLORS: Record<string, string> = {
  very_low: '#FF4747',
  low: '#FF9800',
  medium: '#FFEB3B',
  high: '#34C97B',
};

export const DEFAULT_STATUS_TEXTS: Record<string, string> = {
  very_low: 'Unlikely',
  low: 'Might be Visible',
  medium: 'Likely Visible',
  high: 'Visible',
};

export const ALL_STATUSES = [
  { label: DEFAULT_STATUS_TEXTS.very_low, colorType: 'danger', description: 'Aurora is unlikely to be visible.' },
  { label: DEFAULT_STATUS_TEXTS.low, colorType: 'orange', description: 'Aurora might be visible on the horizon.' },
  { label: DEFAULT_STATUS_TEXTS.medium, colorType: 'yellow', description: 'Aurora likely visible, possibly overhead.' },
  { label: DEFAULT_STATUS_TEXTS.high, colorType: 'success', description: 'Aurora visible overhead and very bright.' },
];

