# Morpho — Atelier d'analyse linguistique

Outil web d'analyse linguistique de texte, **entièrement local** : aucun texte
n'est envoyé sur un serveur, tout est calculé dans le navigateur et le corpus
est persisté dans le `localStorage`.

Interface **responsive** : utilisable sur mobile (barre de corpus en tiroir
coulissant) comme sur desktop.

Construit avec **Vue 3** (`<script setup>`) + **Vite** + **Pinia**.

## Déployer en un clic

Depuis un téléphone ou un ordinateur, sans rien installer — connecte-toi à
Heroku, choisis un nom d'app, valide :

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/maxlestage/test-mo)

## Fonctionnalités

- **Gestion de corpus** : import glisser-déposer (`.txt`, `.md`, `.csv`),
  collage de texte, textes d'exemple (FR/EN), persistance locale.
- **Vue d'ensemble** : nombre de mots / phrases / paragraphes / caractères,
  longueur moyenne des mots et des phrases, temps de lecture estimé,
  distribution de la longueur des mots.
- **Fréquences lexicales** : table et histogramme, filtre, top N,
  exclusion optionnelle des mots vides (FR/EN).
- **Richesse lexicale** : TTR, indice de Guiraud, CTTR, constante C de
  Herdan, indice a² de Maas, hapax legomena.
- **Lisibilité** : Flesch Reading Ease & Flesch–Kincaid (EN),
  adaptation Kandel & Moles (FR), indice LIX (indépendant de la langue).
- **Émotions & sensibilité** : détection des huit émotions de base
  (roue de Plutchik — joie, tristesse, colère, peur, surprise, dégoût,
  confiance, anticipation) et indice de sensibilité émotionnelle
  (densité, couverture, intensité), avec négation et intensifieurs.
- **N-grammes & collocations** : bi/tri/quadri-grammes, cooccurrences
  notées par information mutuelle ponctuelle (PMI).
- **Concordance (KWIC)** : occurrences d'un mot-clé en contexte.
- **Détection de langue** automatique (français / anglais).

## Architecture

```
src/
  libs/           logique d'analyse pure (testable, sans framework)
    text.js         tokenisation mots/phrases/paragraphes, syllabes
    stopwords.js    listes de mots vides FR/EN + détection de langue
    linguistics.js  fréquences, diversité, n-grammes, collocations, KWIC
    readability.js  indices de lisibilité
    sentiment.js    sentiment lexical FR/EN (polarité)
    emotions.js     émotions (Plutchik) + sensibilité émotionnelle
  stores/
    corpus.js       store Pinia (documents, document actif, réglages)
  composables/
    useAnalysis.js  analyses réactives mémoïsées du document actif
  components/       UI Vue (gestionnaire de corpus + panneaux à onglets)
```

## Démarrage

Prérequis : [Bun](https://bun.sh) (ou Node 18+).

```bash
bun install
bun run dev       # serveur de développement
bun run build     # build de production
bun run preview   # prévisualisation du build
```

## Application iOS / Android (PWA)

Morpho est une **Progressive Web App** installable : manifest, icônes,
mode plein écran et service worker de cache (`public/sw.js`) qui rend
l'application **utilisable hors ligne** — cohérent avec son
fonctionnement 100 % local.

Installation sur iPhone : ouvrir l'app dans Safari → bouton
**Partager** → **« Sur l'écran d'accueil »**. L'icône Morpho apparaît
comme une app native, en plein écran, et fonctionne sans connexion.

## Déploiement sur Heroku

L'application est servie par un petit serveur Node sans dépendance
(`server.js`) qui expose le build Vite (`dist/`) avec repli SPA.
Heroku détecte le buildpack **Node.js**, exécute `heroku-postbuild`
(= `vite build`) puis lance le `Procfile` (`web: node server.js`).

```bash
# une seule fois
heroku login
heroku create mon-app-morpho

# déployer (depuis la branche à publier)
git push heroku master        # ou : git push heroku ma-branche:main
heroku open
```

Fichiers concernés : `Procfile`, `server.js`, `app.json`,
scripts `start` / `heroku-postbuild` dans `package.json`.
Aucune variable d'environnement n'est requise (`PORT` est fourni par
Heroku). Le déploiement GitHub Pages a été retiré.

## IDE recommandé

[VS Code](https://code.visualstudio.com/) +
[Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
(désactiver Vetur).
