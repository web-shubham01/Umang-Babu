/* ==========================================================================
   UMANG WORLD CALCULATION LAB - APPLICATION LOGIC & INTERACTIVE SUITE
   ========================================================================== */

class NexusApp {
  constructor() {
    this.history = JSON.parse(localStorage.getItem('umang_calc_history') || '[]');
    this.initCanvas();
    this.initEventListeners();
    this.initTabs();
    this.initThemes();
    this.initSearchAndFilter();
    
    // Auto-run initial tool calculations to populate UI & Python code blocks
    this.generateProfile();
    this.generatePattern();
    this.calcPower();
    this.calcSumSuite();
    this.convertLength();
    this.generateTable();
    this.calcInterest();
    this.calcRectangle();
    this.calcTriangle();
    this.calcGrades();
    this.calcDiscount();
    this.calcCuboid();
  }

  /* ------------------------------------------------------------------------
     1. Background Canvas Animation (Futuristic Glowing Grid)
     ------------------------------------------------------------------------ */
  initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(Math.floor(width / 25), 65);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 140)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };

    animate();
  }

  /* ------------------------------------------------------------------------
     2. Event Listeners & UI Controls
     ------------------------------------------------------------------------ */
  initEventListeners() {
    // History Drawer Modal Toggle
    const btnOpenHistory = document.getElementById('btn-open-history');
    const btnCloseHistory = document.getElementById('btn-close-history');
    const backdrop = document.getElementById('history-backdrop');

    if (btnOpenHistory && backdrop) {
      btnOpenHistory.addEventListener('click', () => {
        this.renderHistory();
        backdrop.classList.add('active');
      });
    }

    if (btnCloseHistory && backdrop) {
      btnCloseHistory.addEventListener('click', () => {
        backdrop.classList.remove('active');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.remove('active');
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. Card Tabs (Tool vs Python Code)
     ------------------------------------------------------------------------ */
  initTabs() {
    document.querySelectorAll('.tool-card').forEach(card => {
      const tabBtns = card.querySelectorAll('.tab-btn');
      const calcTab = card.querySelector('.calc-tab');
      const codeTab = card.querySelector('.code-tab');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const tabType = btn.dataset.tab;
          if (tabType === 'calc') {
            calcTab.classList.remove('hidden');
            codeTab.classList.add('hidden');
          } else {
            calcTab.classList.add('hidden');
            codeTab.classList.remove('hidden');
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Aesthetic Theme Selector
     ------------------------------------------------------------------------ */
  initThemes() {
    const dots = document.querySelectorAll('.theme-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        
        document.body.className = '';
        const theme = dot.dataset.theme;
        if (theme !== 'theme-cyber') {
          document.body.classList.add(theme);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Search & Category Filters
     ------------------------------------------------------------------------ */
  initSearchAndFilter() {
    const searchInput = document.getElementById('global-search');
    const categoryBtns = document.querySelectorAll('.pill-btn');
    const cards = document.querySelectorAll('.tool-card');

    let currentCategory = 'all';
    let searchQuery = '';

    const filterTools = () => {
      cards.forEach(card => {
        const title = card.querySelector('.tool-name').textContent.toLowerCase();
        const category = card.dataset.category;
        const matchesCategory = (currentCategory === 'all' || category === currentCategory);
        const matchesSearch = title.includes(searchQuery.toLowerCase());

        if (matchesCategory && matchesSearch) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterTools();
      });
    }

    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        filterTools();
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. History Logging Helper
     ------------------------------------------------------------------------ */
  logHistory(toolName, summary) {
    const record = {
      tool: toolName,
      summary: summary,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.history.unshift(record);
    if (this.history.length > 25) this.history.pop();
    localStorage.setItem('nexus_calc_history', JSON.stringify(this.history));
  }

  renderHistory() {
    const listContainer = document.getElementById('history-list');
    if (!listContainer) return;

    if (this.history.length === 0) {
      listContainer.innerHTML = '<div class="result-detail" style="text-align:center; padding:2rem 0;">No saved calculations yet. Perform any tool action to log results here.</div>';
      return;
    }

    listContainer.innerHTML = this.history.map(item => `
      <div class="history-item">
        <div class="history-item-tool">${item.tool}</div>
        <div class="history-item-calc">${item.summary}</div>
        <div class="history-item-time">${item.timestamp}</div>
      </div>
    `).join('');
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('nexus_calc_history');
    this.renderHistory();
  }

  copyCode(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent);
    
    // Show visual feedback
    const btn = el.previousElementSibling ? el.previousElementSibling.querySelector('button') : null;
    if (btn) {
      const origText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.color = 'var(--accent-green)';
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.color = '';
      }, 1500);
    }
  }

  /* ------------------------------------------------------------------------
     TOOL 1: Profile Studio Generator
     ------------------------------------------------------------------------ */
  generateProfile() {
    const name = document.getElementById('prof-name').value || 'Student';
    const role = document.getElementById('prof-role').value || 'Developer';
    const age = document.getElementById('prof-age').value || '20';
    const stack = document.getElementById('prof-stack').value || 'Python';

    const resultBox = document.getElementById('prof-result');
    resultBox.innerHTML = `
      <div style="display:flex; align-items:center; gap:1rem;">
        <div style="width:48px; height:48px; border-radius:50%; background:var(--primary-gradient); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; color:#fff;">
          ${name.charAt(0)}
        </div>
        <div>
          <div style="font-weight:800; font-size:1.1rem; color:var(--text-main);">${name}</div>
          <div style="font-size:0.85rem; color:var(--accent-cyan);">${role} &bull; Age ${age}</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Stack: ${stack}</div>
        </div>
      </div>
    `;

    document.getElementById('prof-code').textContent = 
`# Identity Profile Generator
profile = {
    "name": "${name}",
    "role": "${role}",
    "age": ${age},
    "tech_stack": "${stack}"
}

print(f"Developer Badge: {profile['name']} ({profile['role']})")
print(f"Primary Stack: {profile['tech_stack']}")`;

    this.logHistory('Identity Profile', `Created badge for ${name} (${role})`);
  }

  /* ------------------------------------------------------------------------
     TOOL 2: Visual ASCII Pattern Lab
     ------------------------------------------------------------------------ */
  generatePattern() {
    const type = document.getElementById('pat-type').value;
    const rows = parseInt(document.getElementById('pat-rows').value) || 5;
    let patternStr = '';
    let pyCode = '';

    if (type === 'increasing') {
      for (let i = 1; i <= rows; i++) {
        patternStr += '*'.repeat(i) + '\n';
      }
      pyCode = `# Increasing Star Pyramid
rows = ${rows}
for i in range(1, rows + 1):
    print("*" * i)`;
    } else if (type === 'decreasing') {
      for (let i = rows; i >= 1; i--) {
        patternStr += '*'.repeat(i) + '\n';
      }
      pyCode = `# Decreasing Star Inverted
rows = ${rows}
for i in range(rows, 0, -1):
    print("*" * i)`;
    } else if (type === 'diamond') {
      for (let i = 1; i <= rows; i++) {
        patternStr += ' '.repeat(rows - i) + '*'.repeat(2 * i - 1) + '\n';
      }
      for (let i = rows - 1; i >= 1; i--) {
        patternStr += ' '.repeat(rows - i) + '*'.repeat(2 * i - 1) + '\n';
      }
      pyCode = `# Symmetrical Diamond Pattern
rows = ${rows}
for i in range(1, rows + 1):
    print(" " * (rows - i) + "*" * (2 * i - 1))
for i in range(rows - 1, 0, -1):
    print(" " * (rows - i) + "*" * (2 * i - 1))`;
    } else {
      for (let i = 1; i <= rows; i++) {
        let line = '';
        for (let j = 1; j <= i; j++) line += j + ' ';
        patternStr += line.trim() + '\n';
      }
      pyCode = `# Sequential Number Pyramid
rows = ${rows}
for i in range(1, rows + 1):
    for j in range(1, i + 1):
        print(j, end=" ")
    print()`;
    }

    document.getElementById('pat-result').textContent = patternStr;
    document.getElementById('pat-code').textContent = pyCode;
    this.logHistory('Pattern Lab', `Generated ${type} pattern (${rows} rows)`);
  }

  /* ------------------------------------------------------------------------
     TOOL 3: Exponent & Power Matrix
     ------------------------------------------------------------------------ */
  calcPower() {
    const base = parseFloat(document.getElementById('pow-base').value) || 0;
    const exp = parseFloat(document.getElementById('pow-exp').value) || 0;

    const resultVal = Math.pow(base, exp);
    const squareVal = Math.pow(base, 2);
    const cubeVal = Math.pow(base, 3);
    const sqrtVal = Math.sqrt(Math.abs(base)).toFixed(2);

    const resultBox = document.getElementById('pow-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">${base}<sup>${exp}</sup> = ${resultVal.toLocaleString()}</div>
      <div class="result-detail">Square: ${squareVal.toLocaleString()} | Cube: ${cubeVal.toLocaleString()} | √${base}: ${sqrtVal}</div>
    `;

    document.getElementById('pow-code').textContent = 
`# Power & Exponent Matrix Engine
import math

base = ${base}
exp = ${exp}

power_result = math.pow(base, exp)
square = base ** 2
cube = base ** 3
sqrt_val = math.sqrt(base)

print(f"{base}^{exp} = {power_result}")
print(f"Square: {square}, Cube: {cube}, Sqrt: {sqrt_val:.2f}")`;

    this.logHistory('Power Matrix', `${base}^${exp} = ${resultVal.toLocaleString()}`);
  }

  /* ------------------------------------------------------------------------
     TOOL 4: Multi-Operand Math Suite
     ------------------------------------------------------------------------ */
  calcSumSuite() {
    const a = parseFloat(document.getElementById('sum-a').value) || 0;
    const b = parseFloat(document.getElementById('sum-b').value) || 0;

    const sum = a + b;
    const diff = a - b;
    const prod = a * b;
    const quot = b !== 0 ? (a / b).toFixed(2) : 'Undefined (Div by 0)';
    const avg = (sum / 2).toFixed(2);

    const resultBox = document.getElementById('sum-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">Sum: ${sum.toLocaleString()}</div>
      <div class="result-detail">Diff: ${diff.toLocaleString()} | Product: ${prod.toLocaleString()} | Ratio: ${quot} | Avg: ${avg}</div>
    `;

    document.getElementById('sum-code').textContent = 
`# Multi-Operand Math Suite
a = ${a}
b = ${b}

sum_val = a + b
diff_val = a - b
prod_val = a * b
quot_val = a / b if b != 0 else "Undefined"

print(f"Sum: {sum_val}")
print(f"Difference: {diff_val}")
print(f"Product: {prod_val}")
print(f"Quotient: {quot_val}")`;

    this.logHistory('Math Suite', `${a} + ${b} = ${sum}`);
  }

  /* ------------------------------------------------------------------------
     TOOL 5: Spatial Length Converter
     ------------------------------------------------------------------------ */
  convertLength() {
    const val = parseFloat(document.getElementById('len-val').value) || 0;
    const unit = document.getElementById('len-from').value;

    let meters = 0;
    if (unit === 'km') meters = val * 1000;
    else if (unit === 'm') meters = val;
    else if (unit === 'cm') meters = val / 100;
    else if (unit === 'miles') meters = val * 1609.34;
    else if (unit === 'feet') meters = val * 0.3048;

    const km = (meters / 1000).toFixed(3);
    const cm = (meters * 100).toLocaleString();
    const miles = (meters / 1609.34).toFixed(3);
    const feet = (meters / 0.3048).toFixed(1);

    const resultBox = document.getElementById('len-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">${meters.toLocaleString()} Meters</div>
      <div class="result-detail">${km} Km | ${miles} Miles | ${feet} Feet | ${cm} cm</div>
    `;

    document.getElementById('len-code').textContent = 
`# Spatial Length Converter Engine
val = ${val}
unit = "${unit}"

# Convert everything to base meters
unit_to_meters = {
    "km": 1000,
    "m": 1,
    "cm": 0.01,
    "miles": 1609.34,
    "feet": 0.3048
}

base_meters = val * unit_to_meters.get(unit, 1)

print(f"Base Meters: {base_meters} m")
print(f"Kilometers: {base_meters / 1000} km")
print(f"Miles: {base_meters / 1609.34:.3f} mi")
print(f"Feet: {base_meters / 0.3048:.1f} ft")`;

    this.logHistory('Length Converter', `${val} ${unit} = ${meters.toLocaleString()} m`);
  }

  /* ------------------------------------------------------------------------
     TOOL 6: Multiplication Matrix Studio
     ------------------------------------------------------------------------ */
  generateTable() {
    const num = parseInt(document.getElementById('tbl-num').value) || 1;
    const limit = Math.min(parseInt(document.getElementById('tbl-limit').value) || 10, 20);

    let resStr = '';
    for (let i = 1; i <= limit; i++) {
      resStr += `${num} x ${i} = ${num * i}\n`;
    }

    document.getElementById('tbl-result').textContent = resStr;
    document.getElementById('tbl-code').textContent = 
`# Multiplication Matrix Generator
base_num = ${num}
limit = ${limit}

print(f"--- Multiplication Table of {base_num} ---")
for i in range(1, limit + 1):
    print(f"{base_num} x {i} = {base_num * i}")`;

    this.logHistory('Multiplication Table', `Generated table for ${num} (up to ${limit})`);
  }

  /* ------------------------------------------------------------------------
     TOOL 7: Financial Growth Engine (Simple Interest)
     ------------------------------------------------------------------------ */
  calcInterest() {
    const p = parseFloat(document.getElementById('si-p').value) || 0;
    const r = parseFloat(document.getElementById('si-r').value) || 0;
    const t = parseFloat(document.getElementById('si-t').value) || 0;

    const interest = (p * r * t) / 100;
    const total = p + interest;

    const resultBox = document.getElementById('si-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">Interest: $${interest.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
      <div class="result-detail">Total Payback Amount: $${total.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
    `;

    document.getElementById('si-code').textContent = 
`# Financial Growth Engine (Simple Interest)
principal = ${p}
rate = ${r}
time_years = ${t}

# Formula: SI = (P * R * T) / 100
interest = (principal * rate * time_years) / 100
total_payback = principal + interest

print(f"Principal: \${principal}")
print(f"Interest Earned: \${interest:.2f}")
print(f"Total Payback: \${total_payback:.2f}")`;

    this.logHistory('Financial Interest', `P: $${p}, SI: $${interest.toFixed(2)}`);
  }

  /* ------------------------------------------------------------------------
     TOOL 8: 2D Geometry: Rectangle Workbench
     ------------------------------------------------------------------------ */
  calcRectangle() {
    const l = Math.abs(parseFloat(document.getElementById('rect-l').value)) || 1;
    const w = Math.abs(parseFloat(document.getElementById('rect-w').value)) || 1;

    const area = l * w;
    const perimeter = 2 * (l + w);
    const diagonal = Math.sqrt(l * l + w * w).toFixed(2);

    // Update SVG Canvas
    const svgRect = document.getElementById('svg-rect-shape');
    const svgText = document.getElementById('svg-rect-text');
    if (svgRect && svgText) {
      const maxDim = 140;
      const ratio = l / w;
      let drawWidth = maxDim;
      let drawHeight = maxDim / ratio;

      if (drawHeight > 80) {
        drawHeight = 80;
        drawWidth = 80 * ratio;
      }
      drawWidth = Math.min(Math.max(drawWidth, 30), 160);
      drawHeight = Math.min(Math.max(drawHeight, 20), 90);

      const x = (200 - drawWidth) / 2;
      const y = (120 - drawHeight) / 2;

      svgRect.setAttribute('x', x);
      svgRect.setAttribute('y', y);
      svgRect.setAttribute('width', drawWidth);
      svgRect.setAttribute('height', drawHeight);
      svgText.textContent = `${l} x ${w}`;
      svgText.setAttribute('x', 100);
      svgText.setAttribute('y', y + drawHeight / 2 + 4);
    }

    const resultBox = document.getElementById('rect-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">Area: ${area.toLocaleString()} sq units</div>
      <div class="result-detail">Perimeter: ${perimeter.toLocaleString()} units | Diagonal: ${diagonal}</div>
    `;

    document.getElementById('rect-code').textContent = 
`# 2D Geometry: Rectangle Workbench
import math

length = ${l}
width = ${w}

area = length * width
perimeter = 2 * (length + width)
diagonal = math.sqrt(length**2 + width**2)

print(f"Area: {area} sq units")
print(f"Perimeter: {perimeter} units")
print(f"Diagonal: {diagonal:.2f} units")`;

    this.logHistory('Rectangle Workbench', `L:${l}, W:${w} -> Area:${area}`);
  }

  /* ------------------------------------------------------------------------
     TOOL 9: 2D Geometry: Triangle Workbench
     ------------------------------------------------------------------------ */
  calcTriangle() {
    const b = Math.abs(parseFloat(document.getElementById('tri-b').value)) || 1;
    const h = Math.abs(parseFloat(document.getElementById('tri-h').value)) || 1;

    const area = 0.5 * b * h;

    const resultBox = document.getElementById('tri-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">Area: ${area.toLocaleString()} sq units</div>
      <div class="result-detail">Formula: ½ × Base (${b}) × Height (${h})</div>
    `;

    document.getElementById('tri-code').textContent = 
`# 2D Geometry: Triangle Area Workbench
base = ${b}
height = ${h}

# Formula: Area = 0.5 * base * height
area = 0.5 * base * height

print(f"Base: {base}")
print(f"Height: {height}")
print(f"Triangle Area: {area} sq units")`;

    this.logHistory('Triangle Workbench', `Base:${b}, Height:${h} -> Area:${area}`);
  }

  /* ------------------------------------------------------------------------
     TOOL 10: Academic Grade & GPA Analytics
     ------------------------------------------------------------------------ */
  addSubjectRow() {
    const container = document.getElementById('subject-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'subject-row';
    div.innerHTML = `
      <input type="text" class="form-input sub-name" value="Elective Subject">
      <input type="number" class="form-input sub-marks" value="85" placeholder="Marks">
      <button class="btn-danger-sm" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;
    container.appendChild(div);
  }

  calcGrades() {
    const markInputs = document.querySelectorAll('.sub-marks');
    let totalMarks = 0;
    let count = 0;

    markInputs.forEach(input => {
      const val = parseFloat(input.value) || 0;
      totalMarks += val;
      count++;
    });

    const avg = count > 0 ? (totalMarks / count) : 0;
    let grade = 'F';
    let gpa = 0.0;
    let status = 'FAILED';

    if (avg >= 90) { grade = 'A+'; gpa = 4.0; status = 'PASSED (DISTINCTION)'; }
    else if (avg >= 80) { grade = 'A'; gpa = 3.8; status = 'PASSED (EXCELLENT)'; }
    else if (avg >= 70) { grade = 'B'; gpa = 3.2; status = 'PASSED (GOOD)'; }
    else if (avg >= 60) { grade = 'C'; gpa = 2.5; status = 'PASSED'; }
    else if (avg >= 50) { grade = 'D'; gpa = 2.0; status = 'PASSED'; }

    const resultBox = document.getElementById('grade-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">${avg.toFixed(2)}% (Grade: ${grade})</div>
      <div class="result-detail">Status: ${status} | Estimated GPA: ${gpa.toFixed(1)} / 4.0</div>
    `;

    document.getElementById('grade-code').textContent = 
`# Academic Grade Analytics Engine
marks = [${Array.from(markInputs).map(i => i.value || 0).join(', ')}]

total_marks = sum(marks)
average = total_marks / len(marks) if len(marks) > 0 else 0

if average >= 90: grade = "A+"
elif average >= 80: grade = "A"
elif average >= 70: grade = "B"
elif average >= 60: grade = "C"
else: grade = "F"

print(f"Total Subjects: {len(marks)}")
print(f"Average Percentage: {average:.2f}%")
print(f"Final Grade: {grade}")`;

    this.logHistory('Academic Analytics', `Average: ${avg.toFixed(2)}% (Grade ${grade})`);
  }

  /* ------------------------------------------------------------------------
     TOOL 11: Commercial Savings Engine (Discount)
     ------------------------------------------------------------------------ */
  calcDiscount() {
    const price = parseFloat(document.getElementById('disc-price').value) || 0;
    const rate = parseFloat(document.getElementById('disc-rate').value) || 0;

    const savings = (price * rate) / 100;
    const finalPrice = price - savings;

    const resultBox = document.getElementById('disc-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">Final Price: $${finalPrice.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
      <div class="result-detail">You Save: $${savings.toLocaleString(undefined, {minimumFractionDigits:2})} (${rate}% Discount)</div>
    `;

    document.getElementById('disc-code').textContent = 
`# Commercial Savings & Discount Calculator
original_price = ${price}
discount_percentage = ${rate}

savings = (original_price * discount_percentage) / 100
final_price = original_price - savings

print(f"Original Price: \${original_price}")
print(f"Discount ({discount_percentage}%): -\${savings:.2f}")
print(f"Final Price to Pay: \${final_price:.2f}")`;

    this.logHistory('Discount Engine', `Price: $${price}, Saved: $${savings.toFixed(2)}`);
  }

  /* ------------------------------------------------------------------------
     TOOL 12: 3D Spatial Geometry: Cuboid Engine
     ------------------------------------------------------------------------ */
  calcCuboid() {
    const l = Math.abs(parseFloat(document.getElementById('cub-l').value)) || 1;
    const w = Math.abs(parseFloat(document.getElementById('cub-w').value)) || 1;
    const h = Math.abs(parseFloat(document.getElementById('cub-h').value)) || 1;

    const volume = l * w * h;
    const surfaceArea = 2 * (l * w + w * h + h * l);
    const diagonal = Math.sqrt(l * l + w * w + h * h).toFixed(2);

    // Dynamic 3D model scale update
    const model = document.getElementById('cuboid-model');
    if (model) {
      const maxVal = Math.max(l, w, h);
      const scaleX = (l / maxVal).toFixed(2);
      const scaleY = (h / maxVal).toFixed(2);
      const scaleZ = (w / maxVal).toFixed(2);
      model.style.transform = `scale3d(${scaleX}, ${scaleY}, ${scaleZ}) rotateX(-20deg) rotateY(30deg)`;
    }

    const resultBox = document.getElementById('cub-result');
    resultBox.innerHTML = `
      <div class="result-value-badge">Volume: ${volume.toLocaleString()} cu units</div>
      <div class="result-detail">Surface Area: ${surfaceArea.toLocaleString()} sq units | Diagonal: ${diagonal}</div>
    `;

    document.getElementById('cub-code').textContent = 
`# 3D Cuboid Spatial Engine
import math

length = ${l}
width = ${w}
height = ${h}

volume = length * width * height
surface_area = 2 * (length*width + width*height + height*length)
diagonal = math.sqrt(length**2 + width**2 + height**2)

print(f"Volume: {volume} cubic units")
print(f"Surface Area: {surface_area} sq units")
print(f"Space Diagonal: {diagonal:.2f} units")`;

    this.logHistory('3D Cuboid Engine', `L:${l}, W:${w}, H:${h} -> Vol:${volume}`);
  }
}

// Initialize Application once DOM Content is Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NexusApp();
});
