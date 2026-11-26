const DEFAULTS = {
  primary: '#3774d6',
  bg: '#050608',
  surface: '#111827',
  text: '#e2e4e8',
  radius: '10',
  gap: '14'
};

const lum = (hex) => [1, 3, 5]
  .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  .reduce((sum, c) => sum + c, 0) / 3;

const randHex = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6,'0');

class TokenStudio extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.data = { ...DEFAULTS };
  }

  connectedCallback() {
    const s = this.shadowRoot;
    s.innerHTML = `
      <style>
        :host {
          --primary: #3b82f6;
          --primary-fg: #ffffff;
          --bg: #111827;
          --surface: #111827;
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

        [hidden]{
          display:none !important;
        }

        nav { 
          display: flex; 
          gap: 8px; 
          margin-bottom: 20px;
        }

        #random-btn {
          margin-left: auto;
        }

        #random-btn, #reset-btn{
          border-color: color-mix(in srgb, var(--text) 30%, transparent);
        }

        button {
          padding: 8px 14px;
          border: 1px solid var(--primary);
          background: none;
          color: inherit;
          border-radius: var(--radius);
          cursor: pointer;
        }

        button.active, #copy-btn { background: var(--primary); color: var(--primary-fg); }

        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--gap); }

        .card {
          padding: 14px;
          background: var(--surface);
          border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        pre { 
          background: color-mix(in srgb, var(--text) 8%, var(--bg)); 
          padding: 12px; 
          border-radius: 6px; 
          overflow-x: auto; 
        }

        hr { 
          border: 0; 
          border-top: 1px solid color-mix(in srgb, var(--text) 20%, transparent); 
          margin: 20px 0; 
        }

        .row { 
          display:flex;
          gap: var(--gap);
          margin-gap: var(--gap);
        }
        
        .tag 
        { 
          background: var(--primary); 
          color: var(--primary-fg); 
          padding: 2px 8px; 
          border-radius: 99px; 
          font-size: 12px; 
          width: fit-content; 
        }

        .ghost { border-color: transparent; }

        input[type = "text"] {
          flex:1;
          padding:8px ;
          border-radius: var(--radius);
          border: 1px solid color-mix(in srgb, var(--text) 25%, transparent);
          background: var(--surface);
          color: inherit;
        }

        .contrast {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--gap);
        }

      </style>

      <h2>Design Token Studio</h2>
      <nav>
        <button id="b-palette" class="active">Palette</button>
        <button id="b-layout">Layout</button>
        <button id="b-export">Export</button>
        <button id="random-btn">Randomize</button>
        <button id="reset-btn">Reset</button>
      </nav>

      <div id="p-palette">
        <div class="grid">
          <label class="card">Primary <input type="color" id="primary"></label>
          <label class="card">Background <input type="color" id="bg"></label>
          <label class="card">Surface <input type="color" id="surface"></label>
          <label class="card">Text <input type="color" id="text"></label>
        </div>

        <div class = "card contrast">
          <span>Contrast (Text/Bg)</span>
          <span id = "contrast-badge" class = "tag"></span>
        </div>
      </div>

      <div id="p-layout" class="grid" hidden>
        <label class="card"><span>Radius (<span id="rad-num">10</span>px)</span>
          <input type="range" id="radius" min="0" max="32" value="10">
        </label>

        <label class="card"><span>Gap (<span id="gap-num">14</span>px)</span>
          <input type="range" id="gap" min="4" max="48" value="14">
        </label>
      </div>

      <div id="p-export" class="card" hidden>
        <pre id="css-out"></pre>
        <button id="copy-btn">Copy CSS</button>
      </div>
      <hr>
        <div class = "card">
          <span class = "tag">Badge</span>
          <strong>Card Title</strong>
          <span>Preview updates live!</span>
        </div>

        <div class = "row">
          <button class = "active">Primary</button>
          <button>Secondary</button>
          <button class = "ghost">Ghost</button>
        </div>

        <div class = "row">
          <input type = "text" placeholder="Typing..?">
          <button class = "active">Send</button>
        </div>

        <div class = "row card">Alert: Check border and contrast.
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

    Object.keys(DEFAULTS).forEach((id) => {
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

    s.getElementById('random-btn').onclick = () => {
      Object.assign(this.data, {primary: randHex(), bg: randHex(), surface: randHex(), text: randHex()});
      this.syncInputs();
    };

    s.getElementById('reset-btn').onclick = () => {
      this.data = {  ...DEFAULTS };
      this.syncInputs();
    };

    this.syncInputs();
  }

  syncInputs(){
    Object.entries(this.data).forEach(([id, val]) => {
      s.getElementById(id).value = val;
    });
  this.updateUI();
  }

  updateUI() {
    const d = this.data;
    const s = this.shadowRoot;
    const fg = ['#000000', '#ffffff'][Number(lum(d.primary) < 0.5)];

    ['primary', 'bg', 'surface', 'text'].forEach((k) => this.style.setProperty(`--${k}`, d[k]));
    this.style.setProperty('--primary-fg', fg);
    this.style.setProperty('--radius', d.radius + 'px');
    this.style.setProperty('--gap', d.gap + 'px');

    const [l1, l2] = [lum(d.text), lum(d.bg)];
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const score = Number(ratio >= 3) + Number(ratio >= 4.5) + Number(ratio >= 7);

    const badge = s.getElementById('contrast-badge');
    badge.textContent = `${ratio.toFixed(2)}:1 ${['Fail', 'AA Large', 'AA', 'AAA'][score]}`;
    badge.style.background = ['#dc2626', '#ca8a04', '#16a34a', '#16a34a'][score];
    badge.style.color = '#fff';

    s.getElementById('rad-num').textContent = d.radius;
    s.getElementById('gap-num').textContent = d.gap;
    s.getElementById('css-out').textContent =
`:root {
  --primary: ${d.primary};
  --primary-fg: ${fg};
  --bg: ${d.bg};
  --surface: ${d.surface};
  --text: ${d.text};
  --radius: ${d.radius}px;
  --gap: ${d.gap}px;
}`;
  }
}

customElements.define('token-studio', TokenStudio);
document.body.append(document.createElement('token-studio'));