#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const translations = {
  "bt_stat_in": {"de": "In", "es": "En", "fr": "Dans", "no": "I"},
  "terms_intro_title": {"de": "1. Einleitung", "es": "1. Introducción", "fr": "1. Introduction", "no": "1. Innledning"},
  "terms_intro_body1": {"de": "Diese Nutzungs- und Verkaufsbedingungen (\\\"Bedingungen\\\") regeln Ihren Zugang zu auroraforecast.me und allen Premium-Aurora-Vorhersageprodukten (\\\"Premium-Zugang\\\"). Durch den Besuch der Website oder den Kauf von Premium-Zugang stimmen Sie diesen Bedingungen zu.", "es": "Estos Términos de Uso y Venta (\\\"Términos\\\") rigen su acceso a auroraforecast.me y cualquier producto de pronóstico aurora premium (\\\"Acceso Premium\\\"). Al visitar el sitio o comprar Acceso Premium, usted acepta estos Términos.", "fr": "Ces Conditions d'Utilisation et de Vente (« Conditions ») régissent votre accès à auroraforecast.me et à tous les produits de prévision d'aurores premium (« Accès Premium »). En visitant le site ou en achetant un Accès Premium, vous acceptez ces Conditions.", "no": "Disse bruksvilkårene og salgsvilkårene (\\\"Vilkår\\\") regulerer din tilgang til auroraforecast.me og alle premium nordlys-varslingsprodukter (\\\"Premium-tilgang\\\"). Ved å besøke nettstedet eller kjøpe Premium-tilgang godtar du disse Vilkårene."},
  "terms_intro_body2": {"de": "Wenn Sie mit diesen Bedingungen nicht einverstanden sind, verwenden Sie die Website nicht und geben Sie keine Bestellung auf.", "es": "Si no está de acuerdo con estos Términos, no use el sitio web ni realice un pedido.", "fr": "Si vous n'êtes pas d'accord avec ces Conditions, n'utilisez pas le site Web et ne passez pas de commande.", "no": "Hvis du er uenig i disse Vilkårene, skal du ikke bruke nettstedet eller legge inn en bestilling."}
};

for (const lang of ['de', 'es', 'fr', 'no']) {
  const filePath = path.join(__dirname, `../src/data/web-strings/${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  let updated = 0;
  for (const [key, trans] of Object.entries(translations)) {
    if (trans[lang]) {
      data[key] = trans[lang];
      updated++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ ${lang.toUpperCase()}: Updated ${updated} keys (Part 1/28)`);
}
