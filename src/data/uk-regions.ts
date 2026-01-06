export const UK_REGIONS = [
  {
    id: 'shetland',
    name: 'Shetland Islands',
    tier: 'best',
    tierLabel: 'Best odds',
    summary: 'Highest UK latitude with dark horizons and frequent activity.',
    cities: ['lerwick', 'scalloway']
  },
  {
    id: 'orkney',
    name: 'Orkney Islands',
    tier: 'best',
    tierLabel: 'Best odds',
    summary: 'Open skies and low light pollution on the islands.',
    cities: ['kirkwall', 'stromness']
  },
  {
    id: 'caithness',
    name: 'Caithness and North Coast',
    tier: 'best',
    tierLabel: 'Best odds',
    summary: 'Northern mainland coast with clear northern horizons.',
    cities: ['thurso', 'wick']
  },
  {
    id: 'highlands',
    name: 'Highlands and Skye',
    tier: 'good',
    tierLabel: 'Good odds',
    summary: 'Dark glens and coastal viewpoints with strong aurora chances.',
    cities: ['ullapool', 'portree', 'inverness', 'fort-william']
  },
  {
    id: 'north-east-scotland',
    name: 'North East Scotland',
    tier: 'good',
    tierLabel: 'Good odds',
    summary: 'Coastal skies improve visibility during active nights.',
    cities: ['aberdeen']
  },
  {
    id: 'central-scotland',
    name: 'Central Scotland',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Works best during stronger activity and clear skies.',
    cities: ['edinburgh', 'glasgow']
  },
  {
    id: 'northern-ireland',
    name: 'Northern Ireland',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Best chances along dark coastlines and rural areas.',
    cities: ['belfast', 'londonderry', 'coleraine']
  },
  {
    id: 'north-england',
    name: 'Northumberland and Borders',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Dark skies help when Kp rises above local thresholds.',
    cities: ['berwick-upon-tweed', 'newcastle', 'hexham', 'carlisle']
  },
  {
    id: 'north-west',
    name: 'North West England',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Look north during stronger storms and clear skies.',
    cities: ['manchester']
  },
  {
    id: 'midlands-south',
    name: 'Midlands and South England',
    tier: 'rare',
    tierLabel: 'Rare',
    summary: 'Requires stronger geomagnetic storms and very dark skies.',
    cities: ['birmingham', 'london']
  }
] as const;
