/**
 * Cat Merge: Laboratory Edition Theme configuration and asset bindings.
 */
export const CatMergeTheme = {
  id: 'cat-merge',
  title: 'Cat Merge: Laboratory',
  subtitle: 'MEME CAT PHYSICS SUITE',
  description: 'Drop and merge viral progressive meme cats in glowing RGB containers! From innocent Bonnet Kitten to the legendary Ultra Buff Chad Cat.',
  maxLevel: 13,
  badge: 'FEATURED',
  category: 'memes',
  rating: '★ 4.9',

  names: [
    'Level 0: Bonnet Kitten',
    'Level 1: Golden Kitten',
    'Level 2: Striped Tabby',
    'Level 3: Polite Tuxedo Cat',
    'Level 4: Smug White Cat',
    'Level 5: Squinty Grey Cat',
    'Level 6: Smiling Void Cat',
    'Level 7: Ginger Chad Cat',
    'Level 8: Tuxedo Chad Cat',
    'Level 9: White Chad Cat',
    'Level 10: Grey Chad Cat',
    'Level 11: Bearded Guru Cat',
    'Level 12: Tabby Chad Boss',
    'Level 13: ULTRA BUFF BODYBUILDER CAT'
  ],

  getImageUrl(level) {
    const idx = Math.max(0, Math.min(level, 13));
    return `./assets/cats/ball_${idx}.png`;
  },

  getSoundUrl(level) {
    const idx = Math.max(0, Math.min(level, 13));
    return `./assets/sounds/level_${idx}.mp3`;
  }
};
