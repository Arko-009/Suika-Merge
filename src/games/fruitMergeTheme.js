/**
 * Suika Classic: Fruit Merge Theme configuration.
 */
export const FruitMergeTheme = {
  id: 'fruit-merge',
  title: 'Suika Classic: Fruit Lab',
  subtitle: 'CLASSIC WATERMELON EVOLUTION',
  description: 'The iconic Japanese fruit merge puzzle. Fuse humble cherries, strawberries, and pineapples into the ultimate giant Watermelon!',
  maxLevel: 10,
  badge: 'POPULAR',
  category: 'classic',
  rating: '★ 4.8',

  names: [
    'Level 0: Cherry',
    'Level 1: Strawberry',
    'Level 2: Grape',
    'Level 3: Dekopon Orange',
    'Level 4: Persimmon',
    'Level 5: Crisp Apple',
    'Level 6: Sweet Pear',
    'Level 7: Juicy Peach',
    'Level 8: Golden Pineapple',
    'Level 9: Cantaloupe Melon',
    'Level 10: GIANT WATERMELON'
  ],

  emojis: ['🍒', '🍓', '🍇', '🍊', '🍎', '🍏', '🍐', '🍑', '🍍', '🍈', '🍉'],
  colors: ['#D62246', '#FF3366', '#8F3985', '#FF8811', '#FF5714', '#E63946', '#A7C957', '#F4A261', '#E9C46A', '#2A9D8F', '#264653'],

  getImageUrl(level) {
    // Generate data URL with crisp vector circular fruit canvas
    const idx = Math.max(0, Math.min(level, this.emojis.length - 1));
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Outer glow
    ctx.beginPath();
    ctx.arc(80, 80, 72, 0, Math.PI * 2);
    ctx.fillStyle = this.colors[idx];
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Emoji icon
    ctx.font = '72px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emojis[idx], 80, 84);

    return canvas.toDataURL();
  },

  getSoundUrl(level) {
    return `./assets/sounds/level_${Math.min(level, 13)}.mp3`;
  }
};
