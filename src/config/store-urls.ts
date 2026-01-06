/**
 * App Store Configuration
 * Central place for all app store URLs to avoid duplication
 */

// iOS App Store ID (without 'id' prefix)
export const IOS_APP_ID = '6749782053';

// Android Package Name
export const ANDROID_PACKAGE = 'com.walkingbad.aurorame';

// Base Store URLs (without UTM parameters)
export const IOS_STORE_URL = `https://apps.apple.com/app/${IOS_APP_ID}`;
export const ANDROID_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

// Fallback search URL for iOS (if app ID is not available)
export const IOS_SEARCH_URL = 'https://apps.apple.com/search?term=AuroraMe';
