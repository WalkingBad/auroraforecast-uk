import cities from './cities.json';

const UK_COUNTRY_CODES = new Set(['GB']);

const siteCities = cities.filter((city) => UK_COUNTRY_CODES.has(city.countryCode));

export default siteCities;
