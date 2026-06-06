// AI Neural Network Backpropagation Simulator for Sanketh Portfolio

let netCanvas = null;
let netCtx = null;
let boundCanvas = null;
let boundCtx = null;

let isTraining = false;
let trainInterval = null;
let epoch = 0;
let loss = 0;

// Neural Network configuration
// Architecture: 2 inputs -> 4 hidden -> 1 output
const network = {
  weights1: [], // 2x4 matrix
  bias1: [],    // 4 bias values
  weights2: [], // 4x1 matrix
  bias2: [0],   // 1 bias value
  
  // Cache for forward pass activations
  inputs: [0, 0],
  hidden: [0, 0, 0, 0],
  output: [0]
};

// Selected dataset training samples
let trainingData = [];

document.addEventListener('DOMContentLoaded', () => {
  netCanvas = document.getElementById('ai-net-canvas');
  boundCanvas = document.getElementById('ai-boundary-canvas');
  
  const trainBtn = document.getElementById('ai-train-btn');
  const stopBtn = document.getElementById('ai-stop-btn');
  const resetBtn = document.getElementById('ai-reset-btn');
  const datasetSelect = document.getElementById('ai-dataset');
  
  if (trainBtn) trainBtn.addEventListener('click', startTraining);
  if (stopBtn) stopBtn.addEventListener('click', stopTraining);
  if (resetBtn) resetBtn.addEventListener('click', resetNetwork);
  if (datasetSelect) datasetSelect.addEventListener('click', () => {
    generateDataset();
    resetNetwork();
  });
});

function initAISimulator() {
  if (!netCanvas || !boundCanvas) return;
  netCtx = netCanvas.getContext('2d');
  boundCtx = boundCanvas.getContext('2d');
  
  // Set sizes
  netCanvas.width = netCanvas.parentElement.clientWidth;
  netCanvas.height = netCanvas.parentElement.clientHeight;
  
  generateDataset();
  if (network.weights1.length === 0) {
    resetNetwork();
  }
  
  drawNeuralNet();
  drawDecisionBoundary();
}

function generateDataset() {
  const type = document.getElementById('ai-dataset').value;
  trainingData = [];
  
  if (type === 'xor') {
    trainingData = [
      { x: [-1, -1], y: 0 },
      { x: [1, -1], y: 1 },
      { x: [-1, 1], y: 1 },
      { x: [1, 1], y: 0 }
    ];
  } else if (type === 'circle') {
    for (let i = 0; i < 40; i++) {
      const rx = (Math.random() - 0.5) * 2.4;
      const ry = (Math.random() - 0.5) * 2.4;
      const dist = Math.sqrt(rx * rx + ry * ry);
      const label = dist < 0.8 ? 1 : 0;
      trainingData.push({ x: [rx, ry], y: label });
    }
  } else if (type === 'spiral') {
    // Two simple spirals
    for (let i = 0; i < 20; i++) {
      const r = i / 20 * 1.2;
      const t = i / 20 * Math.PI * 2.5;
      
      // Spiral 1 (Class 1)
      trainingData.push({
        x: [r * Math.cos(t), r * Math.sin(t)],
        y: 1
      });
      // Spiral 2 (Class 0)
      trainingData.push({
        x: [r * Math.cos(t + Math.PI), r * Math.sin(t + Math.PI)],
        y: 0
      });
    }
  }
}

function resetNetwork() {
  epoch = 0;
  loss = 0;
  
  // Initialize weights1 (2x4) randomly between -1 and 1
  network.weights1 = [];
  network.bias1 = [];
  for (let i = 0; i < 2; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      row.push(Math.random() * 2 - 1);
    }
    network.weights1.push(row);
  }
  for (let j = 0; j < 4; j++) {
    network.bias1.push(Math.random() * 2 - 1);
  }
  
  // Initialize weights2 (4x1)
  network.weights2 = [];
  for (let j = 0; j < 4; j++) {
    network.weights2.push([Math.random() * 2 - 1]);
  }
  network.bias2 = [Math.random() * 2 - 1];
  
  updateDashboardValues();
  drawNeuralNet();
  drawDecisionBoundary();
}

// ACTIVATIONS
function activate(x, type) {
  if (type === 'sigmoid') {
    return 1 / (1 + Math.exp(-x));
  } else if (type === 'relu') {
    return Math.max(0, x);
  } else { // tanh
    return Math.tanh(x);
  }
}

function activateDerivative(actVal, type) {
  if (type === 'sigmoid') {
    return actVal * (1 - actVal);
  } else if (type === 'relu') {
    return actVal > 0 ? 1 : 0;
  } else { // tanh
    return 1 - actVal * actVal;
  }
}

// FORWARD & BACKWARD PASSES
function forward(x) {
  const act = document.getElementById('ai-activation').value;
  network.inputs = [...x];
  
  // Layer 1
  for (let j = 0; j < 4; j++) {
    let sum = network.bias1[j];
    for (let i = 0; i < 2; i++) {
      sum += network.inputs[i] * network.weights1[i][j];
    }
    network.hidden[j] = activate(sum, act);
  }
  
  // Layer 2 (Output)
  let outSum = network.bias2[0];
  for (let j = 0; j < 4; j++) {
    outSum += network.hidden[j] * network.weights2[j][0];
  }
  // Clamp output to 0-1 for binary boundary coloring
  network.output[0] = activate(outSum, 'sigmoid'); 
  return network.output[0];
}

function trainStep(lrVal) {
  let totalLoss = 0;
  const act = document.getElementById('ai-activation').value;
  
  trainingData.forEach(sample => {
    // 1. Forward Pass
    const pred = forward(sample.x);
    const error = sample.y - pred;
    totalLoss += error * error;
    
    // 2. Backpropagation Output Layer -> Hidden Layer
    const deltaOutput = error * activateDerivative(pred, 'sigmoid');
    
    // Calculate Hidden Layer deltas
    const deltaHidden = Array(4).fill(0);
    for (let j = 0; j < 4; j++) {
      deltaHidden[j] = deltaOutput * network.weights2[j][0] * activateDerivative(network.hidden[j], act);
    }
    
    // 3. Update Weights & Biases
    // Layer 2
    for (let j = 0; j < 4; j++) {
      network.weights2[j][0] += lrVal * deltaOutput * network.hidden[j];
    }
    network.bias2[0] += lrVal * deltaOutput;
    
    // Layer 1
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 4; j++) {
        network.weights1[i][j] += lrVal * deltaHidden[j] * network.inputs[i];
      }
    }
    for (let j = 0; j < 4; j++) {
      network.bias1[j] += lrVal * deltaHidden[j];
    }
  });
  
  loss = totalLoss / trainingData.length;
}

// SIMULATION CONTROL
function startTraining() {
  if (isTraining) return;
  isTraining = true;
  
  const lrVal = parseFloat(document.getElementById('ai-lr').value);
  
  trainInterval = setInterval(() => {
    // Run multiple iterations per frame for speed
    for (let step = 0; step < 5; step++) {
      trainStep(lrVal);
      epoch++;
    }
    
    updateDashboardValues();
    drawNeuralNet();
    drawDecisionBoundary();
  }, 40);
  
  document.getElementById('ai-train-btn').classList.add('running');
}

function stopTraining() {
  if (!isTraining) return;
  isTraining = false;
  clearInterval(trainInterval);
  document.getElementById('ai-train-btn').classList.remove('running');
}

function updateDashboardValues() {
  const epEl = document.getElementById('ai-epoch-val');
  const lsEl = document.getElementById('ai-loss-val');
  
  if (epEl) epEl.textContent = epoch.toString().padStart(4, '0');
  if (lsEl) lsEl.textContent = loss.toFixed(4);
}

// CANVAS DRAWERS
function drawDecisionBoundary() {
  if (!boundCtx) return;
  
  const width = boundCanvas.width;
  const height = boundCanvas.height;
  
  const imgData = boundCtx.createImageData(width, height);
  const data = imgData.data;
  
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      // Map pixels to coordinate range [-1.5, 1.5]
      const nx = (px / width) * 3.0 - 1.5;
      const ny = (py / height) * 3.0 - 1.5;
      
      const pred = forward([nx, ny]);
      
      const idx = (py * width + px) * 4;
      
      // Pred 0 -> Red, Pred 1 -> Blue
      // Interpolate colors
      data[idx] = Math.round((1 - pred) * 255); // R
      data[idx+1] = 0;                         // G
      data[idx+2] = Math.round(pred * 255);       // B
      data[idx+3] = 90;                        // A (alpha opacity)
    }
  }
  
  boundCtx.putImageData(imgData, 0, 0);
  
  // Draw points on top
  trainingData.forEach(sample => {
    const px = Math.round(((sample.x[0] + 1.5) / 3.0) * width);
    const py = Math.round(((sample.y_coord !== undefined ? sample.y_coord : sample.x[1] + 1.5) / 3.0) * height);
    
    boundCtx.beginPath();
    boundCtx.arc(px, py, 3, 0, Math.PI * 2);
    boundCtx.fillStyle = sample.y === 1 ? '#00f2fe' : '#ff007f';
    boundCtx.strokeStyle = '#fff';
    boundCtx.lineWidth = 1;
    boundCtx.fill();
    boundCtx.stroke();
  });
}

function drawNeuralNet() {
  if (!netCtx) return;
  netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
  
  const width = netCanvas.width;
  const height = netCanvas.height;
  
  // Layer coordinates
  const layerX = [width * 0.15, width * 0.5, width * 0.85];
  const nodeY = [
    [height * 0.35, height * 0.65], // Input nodes
    [height * 0.2, height * 0.4, height * 0.6, height * 0.8], // Hidden nodes
    [height * 0.5] // Output node
  ];
  
  // Draw weights
  // Layer 1 weights (Input to Hidden)
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      const w = network.weights1[i][j];
      const strokeStyle = w > 0 ? `rgba(0, 242, 254, ${Math.min(1, Math.abs(w))})` : `rgba(255, 0, 127, ${Math.min(1, Math.abs(w))})`;
      
      netCtx.beginPath();
      netCtx.moveTo(layerX[0], nodeY[0][i]);
      netCtx.lineTo(layerX[1], nodeY[1][j]);
      netCtx.strokeStyle = strokeStyle;
      netCtx.lineWidth = Math.max(0.5, Math.abs(w) * 4);
      netCtx.stroke();
    }
  }
  
  // Layer 2 weights (Hidden to Output)
  for (let j = 0; j < 4; j++) {
    const w = network.weights2[j][0];
    const strokeStyle = w > 0 ? `rgba(0, 242, 254, ${Math.min(1, Math.abs(w))})` : `rgba(255, 0, 127, ${Math.min(1, Math.abs(w))})`;
    
    netCtx.beginPath();
    netCtx.moveTo(layerX[1], nodeY[1][j]);
    netCtx.lineTo(layerX[2], nodeY[2][0]);
    netCtx.strokeStyle = strokeStyle;
    netCtx.lineWidth = Math.max(0.5, Math.abs(w) * 4);
    netCtx.stroke();
  }
  
  // Draw nodes
  // 1. Inputs
  nodeY[0].forEach((y, i) => {
    drawNode(layerX[0], y, 'X' + (i+1), '#fff');
  });
  
  // 2. Hidden
  nodeY[1].forEach((y, j) => {
    const hAct = network.hidden[j];
    // Glow amount based on hidden neuron activation level
    const glowColor = hAct > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.05)';
    drawNode(layerX[1], y, 'H' + (j+1), '#7f00ff', glowColor);
  });
  
  // 3. Output
  const outVal = network.output[0];
  const glow = outVal > 0.5 ? 'rgba(0, 242, 254, 0.6)' : 'rgba(255, 0, 127, 0.6)';
  drawNode(layerX[2], y = nodeY[2][0], 'OUT', '#ff007f', glow);
}

function drawNode(x, y, label, borderStyle, glowColor = null) {
  netCtx.beginPath();
  netCtx.arc(x, y, 16, 0, Math.PI * 2);
  netCtx.fillStyle = '#070913';
  netCtx.strokeStyle = borderStyle;
  netCtx.lineWidth = 2;
  
  if (glowColor) {
    netCtx.shadowColor = glowColor;
    netCtx.shadowBlur = 10;
  }
  
  netCtx.fill();
  netCtx.stroke();
  
  // Reset shadow
  netCtx.shadowBlur = 0;
  
  netCtx.fillStyle = '#fff';
  netCtx.font = '10px Orbitron';
  netCtx.textAlign = 'center';
  netCtx.textBaseline = 'middle';
  netCtx.fillText(label, x, y);
}
