// Interactive Developer Terminal Shell for Sanketh Portfolio

const terminalHistory = document.getElementById('term-history');
const terminalInput = document.getElementById('term-input');

const COMMANDS = {
  help: 'Display all available system commands.',
  about: 'Read professional developer profile summary.',
  skills: 'Enumerate technical competencies & framework expertise.',
  projects: 'List primary software project engineering items.',
  experience: 'Print chronological employment timeline & schooling.',
  contact: 'Show channels of transmission & social configurations.',
  neofetch: 'Generate system statistics and retro ASCII configuration card.',
  clear: 'Flush screen buffer.',
  matrix: 'Initiate digital rain visual anomaly.',
  sudo: 'Run command with administrative privileges.'
};

document.addEventListener('DOMContentLoaded', () => {
  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value.trim();
        if (val) {
          executeCommand(val);
        }
        terminalInput.value = '';
      }
    });
    
    // Focus terminal input when clicking terminal window content
    const termWin = document.getElementById('win-terminal');
    if (termWin) {
      termWin.addEventListener('click', () => {
        terminalInput.focus();
      });
    }
  }
  
  printWelcome();
});

function printWelcome() {
  printLine('SANKETH_SHELL v1.0.0 (tty/1)', 'system');
  printLine('Type "help" for a list of available command transmissions.', 'output');
  printLine('', 'output');
}

function printLine(text, type = 'output') {
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  line.innerHTML = text;
  terminalHistory.appendChild(line);
  terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function executeCommand(inputVal) {
  const parts = inputVal.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  printLine(`sanketh@sys:~$ ${inputVal}`, 'input');
  
  if (cmd === 'clear') {
    terminalHistory.innerHTML = '';
    return;
  }
  
  if (!COMMANDS.hasOwnProperty(cmd)) {
    printLine(`sanketh-sh: command not found: ${cmd}. Try typing "help" for assistance.`, 'error');
    return;
  }
  
  switch (cmd) {
    case 'help':
      printLine('System Command Index:', 'system');
      for (const [c, desc] of Object.entries(COMMANDS)) {
        const pad = c.padEnd(12, ' ');
        printLine(`  <span style="color:#00f2fe">${pad}</span> - ${desc}`);
      }
      break;
      
    case 'about':
      printLine('About Rasam Sanketh:', 'system');
      printLine('Computer Science Engineering Student @ Sreyas Institute (B.Tech 2026, CGPA: 8.4/10).');
      printLine('Full Stack Web Developer specialized in React.js, Node.js, Express, MongoDB, and SQL.');
      printLine('Dedicated systems simulator programmer interested in Operating Systems and lightweight AI.');
      break;
      
    case 'skills':
      printLine('Technical Competency Spectrum:', 'system');
      printLine('  <span style="color:#7f00ff">Languages:</span>    JavaScript (ES6+), Python, Java, PHP, HTML5, CSS3');
      printLine('  <span style="color:#7f00ff">Front-End:</span>    React.js, Responsive UI, Bootstrap, DOM Manipulation');
      printLine('  <span style="color:#7f00ff">Back-End:</span>     Node.js, Express.js, RESTful APIs, System Architecture');
      printLine('  <span style="color:#7f00ff">Databases:</span>    MongoDB, MySQL, Relational schemas');
      printLine('  <span style="color:#7f00ff">Developer:</span>    Git, GitHub, Visual Studio Code, agile sprints');
      break;
      
    case 'projects':
      printLine('Engineering Portfolio Items:', 'system');
      printLine('  <span style="color:#00f2fe">Memory OS Simulator</span> - In-browser memory allocator grid visualization. Run "open memory-os" to launch.');
      printLine('  <span style="color:#00f2fe">AI Simulator Engine</span> - Interactive MLP neural backpropagation trainer. Run "open ai-simulator" to launch.');
      printLine('  <span style="color:#00f2fe">IPL Score Predictor</span> - Machine learning full-stack scorer app using Python and Scikit-learn.');
      printLine('  <span style="color:#00f2fe">Eventzy Board</span>       - Responsive node event manager API scheduler.');
      printLine('  <span style="color:#00f2fe">Airline Reservations</span>- Simulated ticket CRUD console matching MySQL transactions.');
      break;
      
    case 'experience':
      printLine('Career History Timeline:', 'system');
      printLine('  <span style="color:#00f2fe">Software Development Intern @ NeuroInkX</span> (Aug 2025 - Nov 2025)');
      printLine('    - Built dynamic UI modules using HTML, CSS, JavaScript, and React.');
      printLine('    - Refactored components, decreasing DOM load indices by 18%.');
      printLine('  <span style="color:#00f2fe">Web Development Intern @ Cognifyz</span> (2024)');
      printLine('    - Finished full-stack curriculum modules, securing internship certificate.');
      break;
      
    case 'contact':
      printLine('Communication & Networking Vectors:', 'system');
      printLine('  <span style="color:#ff007f">Email:</span>     rasamsanketh126@gmail.com');
      printLine('  <span style="color:#ff007f">GitHub:</span>    github.com/rasamsanketh');
      printLine('  <span style="color:#ff007f">LinkedIn:</span>  linkedin.com/in/rasam-sanketh-53722381/');
      printLine('  <span style="color:#ff007f">Mobile:</span>    +91-9063612385');
      break;
      
    case 'neofetch':
      printNeofetch();
      break;
      
    case 'matrix':
      triggerMatrixRain();
      break;
      
    case 'sudo':
      if (args.length === 0) {
        printLine('sudo: command arguments required. Try "sudo rm -rf /" at your own risk.', 'error');
      } else {
        printLine('sanketh is not in the sudoers file. This incident will be reported to Santa.', 'error');
      }
      break;
  }
}

function printNeofetch() {
  const asciiArt = `
  <span style="color:#00f2fe">        /\\_\\_\\_\\_\\_\\ </span>    <span style="color:#7f00ff">sanketh@sanketh-hud-system</span>
  <span style="color:#00f2fe">       /\\_\\_\\_\\_\\_\\_\\ </span>   --------------------------
  <span style="color:#00f2fe">      /\\_\\       /\\_\\ </span>   OS: SankethHUD WebEngine v1.0.0
  <span style="color:#00f2fe">     /\\_\\       /\\_\\_\\</span>   Uptime: ${Math.floor(performance.now()/1000)}s
  <span style="color:#00f2fe">    /\\_\\       /\\_\\_\\_\\</span>  Shell: SANKETH_SH 1.0
  <span style="color:#00f2fe">   /\\_\\_\\_\\_\\_\\_\\_\\_\\_\\</span> Resolution: ${window.innerWidth}x${window.innerHeight}
  <span style="color:#00f2fe">  /\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\</span> CPU: Intel Core i9-Simulated
  <span style="color:#00f2fe">  \\/_/_/_/_/_/_/_/_/_/ </span>  Memory: 4102MB / 16384MB
  `;
  printLine(asciiArt, 'output');
}

function triggerMatrixRain() {
  printLine('Matrix visualizer initiated... Check the canvas backdrop!', 'system');
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // temporarily hijack canvas draw
  const cols = Math.floor(canvas.width / 15) + 1;
  const ypos = Array(cols).fill(0);
  
  let rainActive = true;
  
  function drawMatrix() {
    if (!rainActive) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = '14px monospace';
    
    ypos.forEach((y, ind) => {
      const text = String.fromCharCode(Math.random() * 128);
      const x = ind * 15;
      ctx.fillText(text, x, y);
      if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
      else ypos[ind] = y + 15;
    });
  }
  
  const interval = setInterval(drawMatrix, 50);
  
  // Terminate after 10 seconds to restore normal grid
  setTimeout(() => {
    clearInterval(interval);
    rainActive = false;
    printLine('Digital anomaly corrected. Restoration complete.', 'system');
  }, 10000);
}
