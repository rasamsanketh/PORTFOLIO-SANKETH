// Memory OS Simulation logic for Sanketh Portfolio

const MEMORY_SIZE = 128;
let memoryGrid = Array(MEMORY_SIZE).fill(null); // holds process IDs or 'OS' or null
let activeProcesses = [];
let processIdCounter = 1;

// Pre-fill some memory blocks for the OS
for (let i = 0; i < 16; i++) {
  memoryGrid[i] = 'OS';
}

document.addEventListener('DOMContentLoaded', () => {
  const spawnBtn = document.getElementById('mos-spawn-btn');
  const defragBtn = document.getElementById('mos-defrag-btn');
  const resetBtn = document.getElementById('mos-reset-btn');
  
  if (spawnBtn) spawnBtn.addEventListener('click', handleSpawnProcess);
  if (defragBtn) defragBtn.addEventListener('click', runDefragmentation);
  if (resetBtn) resetBtn.addEventListener('click', resetMemoryOS);
  
  drawMemoryGrid();
  startMOSInterval();
});

function drawMemoryGrid() {
  const gridEl = document.getElementById('mos-grid');
  if (!gridEl) return;
  gridEl.innerHTML = '';
  
  let allocatedCount = 0;
  
  memoryGrid.forEach((block, index) => {
    const blockEl = document.createElement('div');
    blockEl.className = 'mos-block';
    
    if (block === 'OS') {
      blockEl.classList.add('os');
      blockEl.setAttribute('data-tooltip', `Block ${index}: OS Kernel`);
      allocatedCount++;
    } else if (block === null) {
      blockEl.classList.add('free');
      blockEl.setAttribute('data-tooltip', `Block ${index}: Free`);
    } else {
      // It's a process, assign a visual class based on PID
      const visualClass = `p-active-${(block % 5) + 1}`;
      blockEl.classList.add(visualClass);
      allocatedCount++;
      
      const proc = activeProcesses.find(p => p.pid === block);
      const name = proc ? proc.name : 'Unknown';
      blockEl.setAttribute('data-tooltip', `Block ${index}: ${name} (PID: ${block})`);
    }
    
    gridEl.appendChild(blockEl);
  });
  
  // Update stats
  const countEl = document.getElementById('mos-allocated-count');
  if (countEl) countEl.textContent = allocatedCount;
  
  const fragEl = document.getElementById('mos-fragmentation');
  if (fragEl) {
    fragEl.textContent = `${calculateFragmentation()}%`;
  }
  
  // Update PCB Table
  updatePCBTable();
}

function updatePCBTable() {
  const pcbEl = document.getElementById('mos-pcb-list');
  if (!pcbEl) return;
  pcbEl.innerHTML = '';
  
  if (activeProcesses.length === 0) {
    pcbEl.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-dark);">No active threads.</td></tr>';
    return;
  }
  
  activeProcesses.forEach(proc => {
    const tr = document.createElement('tr');
    
    // Find address range
    let start = -1;
    let end = -1;
    for (let i = 0; i < MEMORY_SIZE; i++) {
      if (memoryGrid[i] === proc.pid) {
        if (start === -1) start = i;
        end = i;
      }
    }
    
    tr.innerHTML = `
      <td style="color:var(--accent-cyan)">#${proc.pid}</td>
      <td>${proc.name}</td>
      <td>${proc.size}</td>
      <td>0x${start.toString(16).padStart(2, '0')} - 0x${end.toString(16).padStart(2, '0')}</td>
      <td style="font-family:var(--font-mono)">${proc.ttl}s</td>
      <td><span style="color:#10b981; border: 1px solid #10b981; padding:1px 4px; border-radius:3px; font-size:9px;">RUNNING</span></td>
    `;
    pcbEl.appendChild(tr);
  });
}

function calculateFragmentation() {
  // Fragmentation can be simplified as (number of free holes) / (total free blocks)
  let freeBlocks = 0;
  let holes = 0;
  let inHole = false;
  
  for (let i = 0; i < MEMORY_SIZE; i++) {
    if (memoryGrid[i] === null) {
      freeBlocks++;
      if (!inHole) {
        holes++;
        inHole = true;
      }
    } else {
      inHole = false;
    }
  }
  
  if (freeBlocks === 0) return 0;
  return Math.round((holes / freeBlocks) * 100);
}

function handleSpawnProcess() {
  const nameEl = document.getElementById('mos-proc-name');
  const sizeEl = document.getElementById('mos-proc-size');
  const timeEl = document.getElementById('mos-proc-time');
  const strategyEl = document.getElementById('mos-strategy');
  
  if (!nameEl || !sizeEl || !timeEl || !strategyEl) return;
  
  const name = nameEl.value.trim() || 'Proc';
  const size = parseInt(sizeEl.value);
  const ttl = parseInt(timeEl.value);
  const strategy = strategyEl.value;
  
  if (size < 1 || size > 16) {
    alert("Process size must be between 1 and 16 blocks.");
    return;
  }
  if (ttl < 1 || ttl > 60) {
    alert("TTL duration must be between 1 and 60 seconds.");
    return;
  }
  
  allocateMemory(name, size, ttl, strategy);
}

function allocateMemory(name, size, ttl, strategy) {
  let startIndex = -1;
  
  if (strategy === 'first-fit') {
    startIndex = findFirstFit(size);
  } else if (strategy === 'best-fit') {
    startIndex = findBestFit(size);
  } else if (strategy === 'worst-fit') {
    startIndex = findWorstFit(size);
  }
  
  if (startIndex === -1) {
    alert(`Allocation Failed: Contiguous blocks of size ${size} not available. Run defragmentation (compaction) to free space!`);
    return;
  }
  
  // Allocate
  const pid = processIdCounter++;
  for (let i = startIndex; i < startIndex + size; i++) {
    memoryGrid[i] = pid;
  }
  
  activeProcesses.push({
    pid: pid,
    name: name,
    size: size,
    ttl: ttl
  });
  
  drawMemoryGrid();
}

// ALGORITHMS
function findFirstFit(size) {
  let consecutiveFree = 0;
  let startIdx = -1;
  
  for (let i = 0; i < MEMORY_SIZE; i++) {
    if (memoryGrid[i] === null) {
      if (consecutiveFree === 0) startIdx = i;
      consecutiveFree++;
      if (consecutiveFree === size) return startIdx;
    } else {
      consecutiveFree = 0;
      startIdx = -1;
    }
  }
  return -1;
}

function findBestFit(size) {
  let bestStartIdx = -1;
  let smallestHoleSize = Infinity;
  
  let consecutiveFree = 0;
  let startIdx = -1;
  
  for (let i = 0; i <= MEMORY_SIZE; i++) {
    if (i < MEMORY_SIZE && memoryGrid[i] === null) {
      if (consecutiveFree === 0) startIdx = i;
      consecutiveFree++;
    } else {
      if (consecutiveFree >= size) {
        if (consecutiveFree < smallestHoleSize) {
          smallestHoleSize = consecutiveFree;
          bestStartIdx = startIdx;
        }
      }
      consecutiveFree = 0;
      startIdx = -1;
    }
  }
  return bestStartIdx;
}

function findWorstFit(size) {
  let worstStartIdx = -1;
  let largestHoleSize = -1;
  
  let consecutiveFree = 0;
  let startIdx = -1;
  
  for (let i = 0; i <= MEMORY_SIZE; i++) {
    if (i < MEMORY_SIZE && memoryGrid[i] === null) {
      if (consecutiveFree === 0) startIdx = i;
      consecutiveFree++;
    } else {
      if (consecutiveFree >= size) {
        if (consecutiveFree > largestHoleSize) {
          largestHoleSize = consecutiveFree;
          worstStartIdx = startIdx;
        }
      }
      consecutiveFree = 0;
      startIdx = -1;
    }
  }
  return worstStartIdx;
}

// DEFRAGMENTATION
function runDefragmentation() {
  // Compaction: Move all non-null blocks to the front, preserving their order,
  // then fill the rest with null. Re-calculate addresses for activeProcesses.
  const tempOS = [];
  const tempProcs = {};
  
  // Extract all occupied blocks
  memoryGrid.forEach(block => {
    if (block === 'OS') {
      tempOS.push('OS');
    } else if (block !== null) {
      if (!tempProcs[block]) tempProcs[block] = [];
      tempProcs[block].push(block);
    }
  });
  
  // Reconstruct memory grid
  const newGrid = [];
  
  // 1. Put OS first
  tempOS.forEach(item => newGrid.push(item));
  
  // 2. Put processes
  Object.keys(tempProcs).forEach(pidStr => {
    tempProcs[pidStr].forEach(item => newGrid.push(item));
  });
  
  // 3. Pad the rest with null
  while (newGrid.length < MEMORY_SIZE) {
    newGrid.push(null);
  }
  
  memoryGrid = newGrid;
  drawMemoryGrid();
}

function resetMemoryOS() {
  memoryGrid = Array(MEMORY_SIZE).fill(null);
  for (let i = 0; i < 16; i++) {
    memoryGrid[i] = 'OS';
  }
  activeProcesses = [];
  processIdCounter = 1;
  drawMemoryGrid();
}

// INTERVAL THREAD
function startMOSInterval() {
  setInterval(() => {
    let updated = false;
    
    // Decrement TTL
    activeProcesses.forEach(proc => {
      proc.ttl--;
      if (proc.ttl <= 0) {
        // Free memory blocks for this process
        for (let i = 0; i < MEMORY_SIZE; i++) {
          if (memoryGrid[i] === proc.pid) {
            memoryGrid[i] = null;
          }
        }
        updated = true;
      }
    });
    
    // Filter out finished processes
    const beforeLength = activeProcesses.length;
    activeProcesses = activeProcesses.filter(proc => proc.ttl > 0);
    if (activeProcesses.length !== beforeLength) {
      updated = true;
    }
    
    if (updated || document.getElementById('win-memory-os').style.display === 'flex') {
      drawMemoryGrid();
    }
  }, 1000);
}
