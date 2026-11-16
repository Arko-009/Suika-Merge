export class Chapter01Problem {
  constructor() {
    this.el = null;
    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-problem';
    this.el.className = 'valk-section ch-problem';
    this.el.setAttribute('aria-label', 'Chapter 01: About Problem');
    this.el.innerHTML = `
      <!-- Colontitle Bar -->
      <div class="colontitle-bar">
        <div class="colontitle-tag">
          <span class="colon-dot"></span>
          <span>ABOUT PROBLEM</span>
        </div>
        <span class="colon-num">CHAPTER 01</span>
      </div>

      <!-- Section 2 Content Inner Container -->
      <div class="grail-s2-inner">
        <!-- Grail Exact Staggered Editorial Headline with Words Rising -->
        <div class="grail-s2-head" aria-label="Everyone's out living. You're watching them do it on a screen.">
          <div class="grail-s2-line" style="margin-left: 42.4vw;">EVERYONE'S OUT</div>
          <div class="grail-s2-line" style="margin-left: 25.1vw;">LIVING. YOU'RE</div>
          <div class="grail-s2-line" style="margin-left: 17vw;">WATCHING THEM DO IT</div>
          <div class="grail-s2-line" style="margin-left: 42.4vw;">ON A SCREEN.</div>
        </div>

        <p class="grail-s2-body">
          Same week, over and over, until you can't tell them apart. You keep meaning to do the thing, go to the place, become the person, and somehow it’s always next week. The loop is comfortable, which is the problem, because comfortable is how a whole year slips by with nothing in it worth remembering.
        </p>
      </div>
    `;

    this.setupScrollReveal();
  }

  setupScrollReveal() {
    const lines = this.el.querySelectorAll('.grail-s2-line');
    const body = this.el.querySelector('.grail-s2-body');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.el.classList.add('in-view');
            lines.forEach((l) => l.classList.add('in-view'));
            if (body) body.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(this.el);
  }
}
