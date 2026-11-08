import { CatMergeTheme } from '../games/catMergeTheme.js';
import { FruitMergeTheme } from '../games/fruitMergeTheme.js';

export const GAME_CATALOG = [
  {
    id: 'cat-merge',
    title: 'Cat Merge: Laboratory',
    tagline: '14 Viral Meme Cat Evolutions',
    description: 'Merge humorous progressive meme cats in reactive glowing neon containers! From tiny Bonnet Kitten to the ultimate Ultra Buff Chad Cat.',
    category: 'memes',
    badge: 'PLAYABLE NOW',
    isPlayable: true,
    theme: CatMergeTheme,
    coverImage: './assets/covers/cat-merge.svg',
    rating: '★ 4.9',
    players: '42.8k plays',
    features: ['14 Progressive Cat Memes', '3 Physics Containers (Flask, Box, Hexagon)', 'Authentic Sound Effects', 'Position-Based Dynamics']
  },
  {
    id: 'fruit-merge',
    title: 'Suika Classic: Fruit Lab',
    tagline: 'The Legendary Watermelon Puzzle',
    description: 'The authentic Japanese fruit fusion puzzle. Stack and merge cherries, grapes, oranges, and pineapples into giant Watermelons.',
    category: 'classic',
    badge: 'PLAYABLE NOW',
    isPlayable: true,
    theme: FruitMergeTheme,
    coverImage: './assets/covers/fruit-merge.svg',
    rating: '★ 4.8',
    players: '28.1k plays',
    features: ['11 Fruit Tiers', 'Smooth Rolling Physics', 'Juicy Splat Feedback', 'Zen Mode']
  },
  {
    id: 'cosmic-merge',
    title: 'Cosmic Merge: Solar Odyssey',
    tagline: 'Stellar Fusion from Dust to Black Holes',
    description: 'Merge asteroids, moons, terrestrial worlds, gas giants, and radiant stars until you trigger a cosmic Supermassive Black Hole!',
    category: 'sci-fi',
    badge: 'COMING SOON',
    isPlayable: false,
    coverImage: './assets/covers/cosmic-merge.svg',
    rating: '★ 4.9',
    players: 'Pre-register',
    features: ['Realistic Orbital Gravity', 'Supernova Particle FX', 'Synthwave Soundtrack']
  },
  {
    id: 'capybara-merge',
    title: 'Capybara Merge: Zen Water Lab',
    tagline: 'Wholesome Hot Spring Wildlife',
    description: 'Chill capybaras with yuzu fruits on their heads, merging alongside wholesome river critters in a warm thermal onsen spring.',
    category: 'chill',
    badge: 'COMING SOON',
    isPlayable: false,
    coverImage: './assets/covers/capybara-merge.svg',
    rating: '★ 4.7',
    players: 'Pre-register',
    features: ['Water Buoyancy Physics', 'Lo-Fi Chill Beats', 'Ultra Cozy Vibes']
  },
  {
    id: 'doge-merge',
    title: 'Doge & Memes: To The Moon',
    tagline: 'Much Wow, Very Merge, Such Physics',
    description: 'Shibas, Doges, Cheems, and moon rockets in an zero-gravity volatile merge arena. Can you reach the Golden Diamond Hands Doge?',
    category: 'memes',
    badge: 'COMING SOON',
    isPlayable: false,
    coverImage: './assets/covers/doge-merge.svg',
    rating: '★ 4.8',
    players: 'Pre-register',
    features: ['Meme Soundboard', 'Zero-G Chaos Mode', 'Rocket Thrusters']
  }
];

