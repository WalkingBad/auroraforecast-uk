/**
 * Tracks cross-link clicks to Google Analytics
 * @param {Object} event - The event data
 * @param {string} event.slot - The slot where the link is located
 * @param {string} event.originSlug - The slug of the current page
 * @param {string} event.targetSlug - The slug of the target page
 * @param {string} event.linkType - The type of link (live, guide, compare, premium)
 * @param {number} event.position - The position of the link in the list
 */
export function trackCrossLink(event) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
        return;
    }

    window.gtag('event', 'web_crosslink_click', {
        slot: event.slot,
        origin_city: event.originSlug,
        target_slug: event.targetSlug,
        link_type: event.linkType,
        position: event.position
    });
}
