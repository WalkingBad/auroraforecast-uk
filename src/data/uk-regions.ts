// Regional hubs for SEO landing pages
export const REGIONAL_HUBS = [
  {
    slug: 'scotland',
    name: 'Scotland',
    description: 'Aurora forecast for Scotland with live visibility predictions for Shetland, Orkney, Highlands, and Central Belt.',
    metaDescription: 'Aurora borealis forecast for Scotland tonight. Live northern lights visibility for 26 Scottish locations including Shetland, Orkney, Highlands. Free aurora alerts.',
    regions: ['shetland', 'outer-hebrides', 'orkney', 'caithness', 'highlands', 'west-coast-isles', 'cairngorms', 'east-scotland', 'central-scotland']
  },
  {
    slug: 'england',
    name: 'England',
    description: 'Aurora forecast for England covering Northern, Central and Southern regions with storm alerts.',
    metaDescription: 'Aurora borealis forecast for England tonight. Northern lights visibility for Newcastle, Manchester, London and 20+ cities. Get alerts for strong geomagnetic storms.',
    regions: ['northumberland-borders', 'yorkshire-humber', 'north-west', 'midlands', 'south-west-england', 'south-east-east']
  },
  {
    slug: 'wales',
    name: 'Wales',
    description: 'Aurora forecast for Wales with visibility predictions for coastal and mountain viewpoints.',
    metaDescription: 'Aurora borealis forecast for Wales tonight. Northern lights visibility for Cardiff, Swansea, Aberystwyth. Best viewing from dark sky reserves.',
    regions: ['wales']
  },
  {
    slug: 'northern-ireland',
    name: 'Northern Ireland',
    description: 'Aurora forecast for Northern Ireland with dark coastline and rural viewing locations.',
    metaDescription: 'Aurora borealis forecast for Northern Ireland tonight. Northern lights visibility for Belfast, Derry, Portrush. Dark coastlines offer best chances.',
    regions: ['northern-ireland']
  }
] as const;

export type RegionalHub = typeof REGIONAL_HUBS[number];

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
    id: 'outer-hebrides',
    name: 'Outer Hebrides',
    tier: 'best',
    tierLabel: 'Best odds',
    summary: 'Remote Atlantic skies with very dark horizons.',
    cities: ['stornoway']
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
    id: 'west-coast-isles',
    name: 'West Coast and Isles',
    tier: 'good',
    tierLabel: 'Good odds',
    summary: 'Sea horizons and island viewpoints boost visibility.',
    cities: ['oban']
  },
  {
    id: 'cairngorms',
    name: 'Cairngorms and Perthshire',
    tier: 'good',
    tierLabel: 'Good odds',
    summary: 'Mountain skies with darker inland conditions.',
    cities: ['aviemore', 'pitlochry']
  },
  {
    id: 'east-scotland',
    name: 'East Scotland',
    tier: 'good',
    tierLabel: 'Good odds',
    summary: 'Coastal skies improve visibility during active nights.',
    cities: ['aberdeen', 'dundee']
  },
  {
    id: 'central-scotland',
    name: 'Central Scotland',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Works best during stronger activity and clear skies.',
    cities: ['edinburgh', 'glasgow', 'stirling', 'perth']
  },
  {
    id: 'northern-ireland',
    name: 'Northern Ireland',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Best chances along dark coastlines and rural areas.',
    cities: ['belfast', 'londonderry', 'coleraine', 'portrush', 'enniskillen']
  },
  {
    id: 'northumberland-borders',
    name: 'Northumberland and Borders',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Dark skies help when Kp rises above local thresholds.',
    cities: ['berwick-upon-tweed', 'newcastle', 'hexham', 'carlisle', 'durham']
  },
  {
    id: 'yorkshire-humber',
    name: 'Yorkshire and Humber',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Moorland escapes improve visibility during storms.',
    cities: ['york', 'leeds', 'sheffield', 'hull']
  },
  {
    id: 'north-west',
    name: 'North West England',
    tier: 'occasional',
    tierLabel: 'Occasional',
    summary: 'Look north during stronger storms and clear skies.',
    cities: ['manchester', 'liverpool']
  },
  {
    id: 'midlands',
    name: 'Midlands',
    tier: 'rare',
    tierLabel: 'Rare',
    summary: 'Requires stronger geomagnetic storms and very dark skies.',
    cities: ['birmingham', 'nottingham', 'leicester']
  },
  {
    id: 'wales',
    name: 'Wales',
    tier: 'rare',
    tierLabel: 'Rare',
    summary: 'Best from the west coast and mountain viewpoints.',
    cities: ['cardiff', 'swansea', 'aberystwyth', 'llandudno', 'caernarfon']
  },
  {
    id: 'south-west-england',
    name: 'South West England',
    tier: 'rare',
    tierLabel: 'Rare',
    summary: 'Coastal horizons help during strong storms.',
    cities: ['bristol', 'exeter', 'plymouth']
  },
  {
    id: 'south-east-east',
    name: 'South East and East England',
    tier: 'rare',
    tierLabel: 'Rare',
    summary: 'Needs the strongest storms and the darkest skies you can reach.',
    cities: ['london', 'norwich', 'cambridge', 'oxford', 'brighton', 'southampton', 'portsmouth']
  }
] as const;
