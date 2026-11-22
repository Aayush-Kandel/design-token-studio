class TokenStudio extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.data = {
      primary: '#3b82f6',
      bg: '#111827',
      text: '#f3f4f6',
      radius: '10',
      gap: '14'
    };
  }

  connectedCallback() {
    const s = this.shadowRoot;
    s.innerHTML = `
      <style>
        :host {
          --primary: #3b82f6;
          --bg: #111827;
          --text: #f3f4f6;
          --radius: 10px;
          --gap: 14px;
          display: block;
          max-width: 760px;
          margin: 40px auto;
          padding: 24px;
          font-family: sans-serif;
          background: var(--bg);
          color: var(--text);
          border-radius: var(--radius);
        }
        nav { display: flex; gap: 8px; margin-bottom: 20px; }
        button {
          padding: 8px 14px;
          border: 1px solid var(--primary);
          background: none;
          color: inherit;
          border-radius: 6px;
          cursor: pointer;
        }
        button.active, #copy-btn { background: var(--primary); color: #fff; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--gap); }
        .card {
          padding: 14px;
          border: 1px solid #ffffff30;
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        pre { background: #00000055; padding: 12px; border-radius: 6px; overflow-x: auto; }
      </style>

      <h2>Design Token Studio</h2>
      <nav>
        <button id="b-palette" class="active">Palette</button>
        <button id="b-layout">Layout</button>
        <button id="b-export">Export</button>
      </nav>

      <div id="p-palette" class="grid">
        <label class="card">Primary <input type="color" id="primary" value="#3b82f6"></label>
        <label class="card">Background <input type="color" id="bg" value="#111827"></label>
        <label class="card">Text <input type="color" id="text" value="#f3f4f6"></label>
      </div>

      <div id="p-layout" class="grid" hidden>
        <label class="card">Radius (<span id="rad-num">10</span>px)
          <input type="range" id="radius" min="0" max="32" value="10">
        </label>
        <label class="card">Gap (<span id="gap-num">14</span>px)
          <input type="range" id="gap" min="4" max="48" value="14">
        </label>
      </div>

      <div id="p-export" class="card" hidden>
        <pre id="css-out"></pre>
        <button id="copy-btn">Copy CSS</button>
      </div>
    `;

    const panels = [s.getElementById('p-palette'), s.getElementById('p-layout'), s.getElementById('p-export')];
    const buttons = [s.getElementById('b-palette'), s.getElementById('b-layout'), s.getElementById('b-export')];

    buttons.forEach((btn, idx) => {
      btn.onclick = () => {
        panels.forEach((p, i) => { p.hidden = i !== idx; });
        buttons.forEach((b, i) => { b.className = ['', 'active'][Number(i === idx)]; });
      };
    });

    ['primary', 'bg', 'text', 'radius', 'gap'].forEach((id) => {
      s.getElementById(id).oninput = (e) => {
        this.data[id] = e.target.value;
        this.updateUI();
      };
    });

    const copyBtn = s.getElementById('copy-btn');
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(s.getElementById('css-out').textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy CSS'; }, 1000);
    };

    this.updateUI();
  }

  updateUI() {
    const d = this.data;
    this.style.setProperty('--primary', d.primary);
    this.style.setProperty('--bg', d.bg);
    this.style.setProperty('--text', d.text);
    this.style.setProperty('--radius', d.radius + 'px');
    this.style.setProperty('--gap', d.gap + 'px');

    this.shadowRoot.getElementById('rad-num').textContent = d.radius;
    this.shadowRoot.getElementById('gap-num').textContent = d.gap;
    this.shadowRoot.getElementById('css-out').textContent =
`:root {
  --primary: ${d.primary};
  --bg: ${d.bg};
  --text: ${d.text};
  --radius: ${d.radius}px;
  --gap: ${d.gap}px;
}`;
  }
}

customElements.define('token-studio', TokenStudio);
document.body.append(document.createElement('token-studio'));