import { trackCrossLink } from '../utils/analytics-helper.js';

/**
 * Cross-link tracking
 * Attaches event listeners to all elements with [data-cross-link] attribute
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get origin slug from a meta tag or data attribute on the body if possible, 
    // or fall back to parsing the URL or expecting a global variable if set.
    // However, the original script used a variable `originSlug` injected by Astro.
    // To make this generic, we can look for a data attribute on the body or a specific element.

    const originElement = document.querySelector('[data-origin-slug]');
    const originSlug = originElement ? originElement.getAttribute('data-origin-slug') : window.location.pathname.substring(1);

    document.querySelectorAll('[data-cross-link]').forEach((anchor) => {
        anchor.addEventListener('click', () => {
            const slot = anchor.getAttribute('data-slot') ?? 'related_block';
            const target = anchor.getAttribute('data-target') ?? '';
            const type = (anchor.getAttribute('data-type') ?? 'guide');
            const positionAttr = Number(anchor.getAttribute('data-position') ?? '1');
            const position = Number.isNaN(positionAttr) ? 1 : positionAttr;

            trackCrossLink({
                slot,
                originSlug,
                targetSlug: target,
                linkType: type,
                position
            });
        });
    });
});
