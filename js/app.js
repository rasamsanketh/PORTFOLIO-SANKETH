// Core Window System & App Manager for Sanketh Portfolio

const openWindows = {};
let activeWindow = null;
let zIndexCounter = 100;

document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initWindowSystem();
  bindDesktopEvents();
  
  // Open terminal and profile by default on desktop loads
  if (window.innerWidth > 768) {
    setTimeout(() => {
      openApp('profile');
    }, 500);
    setTimeout(() => {
      openApp('terminal');
    }, 1200);
  }
});

// CANVAS PARTICLE SYSTEM
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const particleCount = 80;
  const connectionDistance = 110;
  
  let mouse = { x: null, y: null };
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(127, 0, 255, 0.3)';
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid lines faintly
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const gridStep = 50;
    for (let x = 0; x < canvas.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.15;
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      
      // Connect to mouse
      if (mouse.x !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistance * 1.5) {
          const alpha = (1 - dist / (connectionDistance * 1.5)) * 0.25;
          ctx.strokeStyle = `rgba(127, 0, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// WINDOW SYSTEM
function initWindowSystem() {
  const windows = document.querySelectorAll('.window');
  
  windows.forEach(win => {
    const titlebar = win.querySelector('.window-titlebar');
    const minBtn = win.querySelector('.win-min');
    const maxBtn = win.querySelector('.win-max');
    const closeBtn = win.querySelector('.win-close');
    
    // Dragging
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let winStartX = 0;
    let winStartY = 0;
    
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('win-btn')) return;
      isDragging = true;
      focusWindow(win);
      
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      winStartX = parseInt(win.style.left);
      winStartY = parseInt(win.style.top);
      
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    });
    
    function onDrag(e) {
      if (!isDragging || win.classList.contains('maximized')) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      
      // Clamp values so window top bar is accessible
      let newX = winStartX + dx;
      let newY = Math.max(35, winStartY + dy); // Don't drag above the system top-bar
      
      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
    }
    
    function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    }
    
    // Resizing
    const resizers = win.querySelectorAll('.resizer');
    resizers.forEach(resizer => {
      let isResizing = false;
      let resizeStartX = 0;
      let resizeStartY = 0;
      let winStartW = 0;
      let winStartH = 0;
      
      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        focusWindow(win);
        
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        winStartW = win.offsetWidth;
        winStartH = win.offsetHeight;
        
        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', stopResize);
        e.stopPropagation();
      });
      
      function onResize(e) {
        if (!isResizing || win.classList.contains('maximized')) return;
        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;
        
        if (resizer.classList.contains('r') || resizer.classList.contains('se')) {
          win.style.width = `${Math.max(320, winStartW + dx)}px`;
        }
        if (resizer.classList.contains('b') || resizer.classList.contains('se')) {
          win.style.height = `${Math.max(200, winStartH + dy)}px`;
        }
        
        // Trigger redrawing of canvases inside window if resized
        const appId = win.id.replace('win-', '');
        if (appId === 'ai-simulator' && typeof drawNeuralNet === 'function') {
          drawNeuralNet();
        }
      }
      
      function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
      }
    });
    
    // Focus when clicking inside window
    win.addEventListener('mousedown', () => {
      focusWindow(win);
    });
    
    // Control buttons
    minBtn.addEventListener('click', () => {
      minimizeWindow(win);
    });
    
    maxBtn.addEventListener('click', () => {
      toggleMaximize(win);
    });
    
    closeBtn.addEventListener('click', () => {
      closeWindow(win);
    });
  });
}

function focusWindow(win) {
  if (activeWindow === win) return;
  
  if (activeWindow) {
    activeWindow.classList.remove('active');
  }
  
  activeWindow = win;
  win.classList.remove('minimized');
  win.classList.add('active');
  
  zIndexCounter += 1;
  win.style.zIndex = zIndexCounter;
}

function openApp(appId) {
  const win = document.getElementById(`win-${appId}`);
  if (!win) return;
  
  win.style.display = 'flex';
  win.classList.remove('minimized');
  focusWindow(win);
  
  // Mark dock/shortcut running
  const dockItem = document.querySelector(`.dock-item[data-app="${appId}"]`);
  if (dockItem) dockItem.classList.add('running');
  
  // App-specific trigger initializations
  if (appId === 'terminal') {
    const input = document.getElementById('term-input');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  } else if (appId === 'memory-os') {
    if (typeof drawMemoryGrid === 'function') {
      drawMemoryGrid();
    }
  } else if (appId === 'ai-simulator') {
    if (typeof initAISimulator === 'function') {
      initAISimulator();
    }
  }
}

function minimizeWindow(win) {
  win.classList.add('minimized');
  win.classList.remove('active');
  
  // Find next window to focus
  const openWins = Array.from(document.querySelectorAll('.window'))
    .filter(w => w.style.display === 'flex' && !w.classList.contains('minimized'))
    .sort((a, b) => parseInt(a.style.zIndex) - parseInt(b.style.zIndex));
    
  if (openWins.length > 0) {
    focusWindow(openWins[openWins.length - 1]);
  } else {
    activeWindow = null;
  }
}

function toggleMaximize(win) {
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.top = win.dataset.prevTop || '100px';
    win.style.left = win.dataset.prevLeft || '100px';
    win.style.width = win.dataset.prevWidth || '600px';
    win.style.height = win.dataset.prevHeight || '400px';
  } else {
    // Save previous dimensions
    win.dataset.prevTop = win.style.top;
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevWidth = `${win.offsetWidth}px`;
    win.dataset.prevHeight = `${win.offsetHeight}px`;
    
    win.classList.add('maximized');
  }
  
  const appId = win.id.replace('win-', '');
  if (appId === 'ai-simulator' && typeof drawNeuralNet === 'function') {
    setTimeout(drawNeuralNet, 250);
  }
}

function closeWindow(win) {
  win.style.display = 'none';
  win.classList.remove('active');
  
  const appId = win.id.replace('win-', '');
  const dockItem = document.querySelector(`.dock-item[data-app="${appId}"]`);
  if (dockItem) dockItem.classList.remove('running');
  
  // Stop simulator loops if closed
  if (appId === 'ai-simulator' && typeof stopTraining === 'function') {
    stopTraining();
  }
}

// SHORTCUTS & DOCK EVENT BINDING
function bindDesktopEvents() {
  const shortcuts = document.querySelectorAll('.desktop-shortcut');
  shortcuts.forEach(shortcut => {
    shortcut.addEventListener('click', () => {
      const appId = shortcut.dataset.app;
      openApp(appId);
    });
  });
  
  const dockItems = document.querySelectorAll('.dock-item');
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.dataset.app;
      const win = document.getElementById(`win-${appId}`);
      
      if (win && win.style.display === 'flex' && !win.classList.contains('minimized') && win.classList.contains('active')) {
        minimizeWindow(win);
      } else {
        openApp(appId);
      }
    });
  });
}
