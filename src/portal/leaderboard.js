/**
 * Leaderboard & Player stats tracking.
 */
export class LeaderboardManager {
  static getPlayerName() {
    return localStorage.getItem('suika_player_name') || 'MemeLabMaster';
  }

  static setPlayerName(name) {
    localStorage.setItem('suika_player_name', name.trim().slice(0, 16));
  }

  static getHighScore(gameId) {
    return parseInt(localStorage.getItem(`suika_highscore_${gameId}`) || '0', 10);
  }

  static getLeaderboardData(gameId) {
    const userBest = this.getHighScore(gameId);
    const userName = this.getPlayerName();

    const mockGlobal = [
      { name: 'GigaChadMeow', score: 142580, badge: '🥇' },
      { name: 'DrFlaskPhysics', score: 98400, badge: '🥈' },
      { name: 'CyberCat99', score: 81220, badge: '🥉' },
      { name: 'TabbyCommander', score: 64900, badge: '4' },
      { name: 'VoidSmiler', score: 52100, badge: '5' }
    ];

    // Insert user into ranking
    const combined = [...mockGlobal];
    if (userBest > 0) {
      combined.push({ name: `${userName} (You)`, score: userBest, badge: '⭐', isUser: true });
    }
    combined.sort((a, b) => b.score - a.score);

    return combined.slice(0, 8);
  }
}
