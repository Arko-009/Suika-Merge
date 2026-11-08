import { sound } from '../sound/SoundEngine.js';

export class QuestModal {
  constructor(onAccept) {
    this.onAccept = onAccept || (() => {});
    this.el = null;
    this.activeQuest = null;
    this.init();
  }

  init() {
    this.el = document.createElement('div');
    this.el.className = 'valk-quest-modal';
    this.el.innerHTML = `
      <div class="modal-backdrop" id="modal-bg"></div>
      <div class="modal-card">
        <button class="modal-close" id="modal-close" data-cursor="CLOSE">✕</button>
        
        <div class="modal-header">
          <div class="modal-kicker-row">
            <span class="modal-badge" id="m-rank">S-RANK</span>
            <span class="modal-guild" id="m-guild">THE KEEPERS OF TIME</span>
          </div>
          <h2 class="modal-title" id="m-title">Walk Beyond the Compass</h2>
          <div class="modal-xp" id="m-xp">+350 XP</div>
        </div>

        <div class="modal-body">
          <div class="modal-desc-box">
            <p class="modal-body-text" id="m-desc"></p>
          </div>

          <div class="modal-rules-grid">
            <div class="rule-card">
              <span class="rule-num">01</span>
              <h4>REALITY ANCHOR</h4>
              <p>Must be executed in the physical world. No simulation substitutes.</p>
            </div>
            <div class="rule-card">
              <span class="rule-num">02</span>
              <h4>48-HR WINDOW</h4>
              <p>Once accepted, the clock runs. Delaying until tomorrow fails the quest.</p>
            </div>
            <div class="rule-card">
              <span class="rule-num">03</span>
              <h4>VOICE RECORD</h4>
              <p>Leave a 30-second audio log immediately upon completion to seal stats.</p>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="modal-accept-btn" id="m-accept" data-cursor="CONFIRM">
            <span>ACCEPT QUEST & START 48H CLOCK</span>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M6 3l5 5-5 5V3z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.el);

    const close = () => {
      sound.playClick();
      this.el.classList.remove('open');
    };

    this.el.querySelector('#modal-close').addEventListener('click', close);
    this.el.querySelector('#modal-bg').addEventListener('click', close);

    this.el.querySelector('#m-accept').addEventListener('click', () => {
      sound.playWarp();
      close();
      this.onAccept(this.activeQuest);
    });
  }

  open(quest) {
    this.activeQuest = quest;
    this.el.querySelector('#m-rank').textContent = `${quest.rank} // ${quest.category}`;
    this.el.querySelector('#m-rank').style.color = quest.statColor;
    this.el.querySelector('#m-guild').textContent = quest.guild.toUpperCase();
    this.el.querySelector('#m-title').textContent = quest.title;
    this.el.querySelector('#m-xp').textContent = quest.xp;
    this.el.querySelector('#m-desc').textContent = quest.desc;

    sound.playHover();
    this.el.classList.add('open');
  }
}

