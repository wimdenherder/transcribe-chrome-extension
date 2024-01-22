let activeNotes = [];
let durationShowNote = 0.1; // na zoveel seconden verdwijnt de noot uit beeld
let defaultThresholdNote = 180; // drempelwaarde voor het detecteren van een noot
let thresholdNote = defaultThresholdNote; // drempelwaarde voor het detecteren van een noot
let maxFrequency = 2000;

// Globale variabelen voor start- en eindtijd
let startTime = null;
let endTime = null;

// Verkrijg het video-element
const video = document.querySelector("video");

// Functie om de huidige tijd van de video te controleren
function checkLoop() {
  const playerIsOutsideLoop = (endTime !== null && video.currentTime >= endTime)
  || (startTime !== null && video.currentTime < startTime);

  if (playerIsOutsideLoop) {
    video.currentTime = startTime;
    video.play();
  }
  requestAnimationFrame(checkLoop);
}

// Start het controleren van de tijd
checkLoop();

const startLoop = () => { startTime = video.currentTime; console.log(document.querySelector("#startButton")); addBorderToButton("#startButton") }
const endLoop = () => { endTime = video.currentTime;video.currentTime = startTime; addBorderToButton("#endButton")  }
const deleteLoop = () => { startTime = null; endTime = null; normalBorderButton("#startButton"); normalBorderButton("#endButton");}
const videoSlower = () => {
  video.playbackRate *= 1/1.15;
  updateSliderSpeed();
}
const videoFaster = () => {
  video.playbackRate *= 1.15;
  updateSliderSpeed();
}
const moveBack = () => video.currentTime -= 0.5;
const moveForward = () => video.currentTime += 0.5;

function addBorderToButton(buttonId) {
  const button = document.querySelector(buttonId);
  if(!button) return;
  button.style.border = '3px solid blue';
}

function normalBorderButton(buttonId) {
  const button = document.querySelector(buttonId);
  if(!button) return;
  button.style.border = '1px solid #ccc';
}


// Event listener voor toetsaanslagen
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "a":
      startLoop();
      break;
    case "b":
      endLoop();
      break;
    case "s":
      deleteLoop();
      break;
    case "-":
      videoSlower()
      break;
    case "=":
    case "+":
      videoFaster()
      break;
    case "[":
      moveBack();
      break;
    case "]":
      moveForward();
      break;
    default:
      // doe niets voor andere toetsen
      break;
  }
});

function addKeyboardAndCanvasToBody() {
  // Maak een nieuwe div container
  var container = document.createElement("div");
  container.style.position = "absolute";
  container.style.zIndex = 999;
  container.style.bottom = "0";
  container.style.left = "0";
  container.style.width = 1200 + "px"; // Stel de breedte in op 1200
  container.style.height = "200px"; // Stel een vaste hoogte in

  // Maak een nieuw img element
  var imgElement = document.createElement("img");
  imgElement.id = "pianoKeyboard";
  imgElement.src = "https://wimdenherder.com/keyboard.jpg"; // 88 notes keyboard
  imgElement.style.width = "100%"; // Maak de breedte flexibel
  imgElement.style.height = "200px"; // Stel een vaste hoogte in

  // Maak een nieuw canvas element
  var canvasElement = document.createElement("canvas");
  canvasElement.id = "noteVisualizer";
  canvasElement.width = 1200;
  canvasElement.height = 200;
  canvasElement.style.position = "absolute";
  canvasElement.style.zIndex = 1000;
  canvasElement.style.bottom = "0";
  canvasElement.style.left = "0";

  // Voeg de img en canvas elementen toe aan de container
  container.appendChild(imgElement);
  container.appendChild(canvasElement);

  // Voeg de container toe aan de body van de pagina
  document.body.appendChild(container);
}

// run after addKeyboardAndCanvasToBody
function addSlider() {

    // Maak de container voor de controls
    var controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.borderRadius = '10px';
    controlsContainer.style.gap = '10px';
    controlsContainer.style.padding = '7px';
    controlsContainer.style.border = '2px black solid';
    controlsContainer.style.background = 'white';
    controlsContainer.style.marginTop = '20px';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.top = '140px';
    controlsContainer.style.left = '10px';
    controlsContainer.style.zIndex = '1000000000';
  
    // Maak het label voor de slider
    var label = document.createElement('label');
    label.htmlFor = 'thresholdSlider';
    label.textContent = 'Sensitivity: ';
  
    // Maak de slider
    var thresholdSlider = document.createElement('input');
    thresholdSlider.type = 'range';
    thresholdSlider.id = 'thresholdSlider';
    thresholdSlider.min = '80';
    thresholdSlider.max = '150';
    thresholdSlider.value = '100';
    thresholdSlider.step = '1';
    thresholdSlider.style.width = '300px';
  
    // Maak de span voor de waarde
    var thresholdValueDisplay = document.createElement('span');
    thresholdValueDisplay.id = 'thresholdValue';
    thresholdValueDisplay.textContent = '100';
  
    // Voeg de elementen toe aan de controls container
    controlsContainer.appendChild(label);
    controlsContainer.appendChild(thresholdSlider);
    controlsContainer.appendChild(thresholdValueDisplay);
  
    // Voeg de controls container toe net boven het canvas
    var canvasElement = document.getElementById('noteVisualizer');
    canvasElement.parentNode.insertBefore(controlsContainer, canvasElement);
  
    // Voeg event listener toe aan de slider
    thresholdSlider.addEventListener('input', function() {
      sensitivity = this.value; // % notation
      thresholdNote = defaultThresholdNote / (parseInt(sensitivity) / 100);
      thresholdValueDisplay.textContent = this.value;
    });
  }
  
addKeyboardAndCanvasToBody();
addSlider(); // run addSlider after addKeyboardAndCanvasToBody

const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValueDisplay = document.getElementById('thresholdValue');

var canvas = document.getElementById("noteVisualizer");
var canvasCtx = canvas.getContext("2d");


var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var source = audioContext.createMediaElementSource(video);
var analyser = audioContext.createAnalyser();

source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 2048 * 2 * 2;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

function noteFromFrequency(frequency) {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 49 - 1; // - 1, because strangely it was 4 notes off
}

function draw() {
  requestAnimationFrame(draw);
  console.log(activeNotes.length);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  analyser.getByteFrequencyData(dataArray);

  // Verwijder eerst noten die langer dan durationShowNote seconden getoond zijn
  let currentTime = Date.now();
  activeNotes = activeNotes.filter((note) => {
    // console.log({note: note.note, dur: currentTime - note.time});
    return currentTime - note.time < durationShowNote * 1000;
  });

  // Clear het canvas eenmaal in plaats van in drawNoteOnKeyboard
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  // Bepaal welke frequentiebanden overeenkomen met pieken
  for (let i = 0; i < bufferLength; i++) {
    if (dataArray[i] > thresholdNote) {
      // drempelwaarde
      const frequency = (i * audioContext.sampleRate) / analyser.fftSize;
      const note = noteFromFrequency(frequency);

      if (frequency >= maxFrequency) continue;

      indexNote = activeNotes.findIndex((n) => n.note === note);
      if (indexNote === -1) {
        activeNotes.push({ note, time: currentTime });
      } else {
        activeNotes[indexNote].time = currentTime;
      }
    }
  }

  // Teken alle actieve noten
  activeNotes.forEach((n) => drawNoteOnKeyboard(n.note, canvasCtx));
}

function drawNoteOnKeyboard(note, canvasCtx) {
  // note 0 = a
  // Bepaal de positie van de noot op het keyboard
  // Dit hangt af van de afbeelding van je keyboard en hoe de noten erop zijn uitgelijnd

  if (note < 36 || note > 111) return; // buiten bereik van keyboard

  let correctionKeyboardImageStretch = -1;
  let correctionKeyboadBase = 15;
  let xPosition =
    correctionKeyboadBase +
    (note - 24) * (canvas.width / (88 - correctionKeyboardImageStretch)); // voorbeeld voor een 88 toetsen piano
  let yPosition = 13 + canvas.height / 2; // midden op de y-as

  //   console.log({note})

  blackNotes = [1, 4, 6, 9, 11];
  noteNames = ["a", "a#", "b", "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#"];
  noteColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "brown",
    "black",
    "lightgreen",
    "grey",
    "cyan",
  ];

  if (blackNotes.includes(note % 12)) {
    // console.log("black note " + noteNames[note % 12]);
    yPosition -= 60;
  }

  // Teken de cirkel voor de noot
  canvasCtx.beginPath();
  canvasCtx.arc(xPosition, yPosition, 20, 0, 2 * Math.PI, false);
  canvasCtx.fillStyle = noteColors[note % 12];
  canvasCtx.fill();
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "#550000";
  canvasCtx.stroke();

  // Zet de naam van de noot in het midden van de cirkel
  canvasCtx.font = "16px Arial";
  canvasCtx.fillStyle = "white";
  canvasCtx.textAlign = "center";
  canvasCtx.textBaseline = "middle";
  canvasCtx.fillText(noteNames[note % 12], xPosition, yPosition);
}

// Functie om de menu container en knoppen te creëren
function createMenu() {
  // Maak de container div
  const menuContainer = document.createElement('div');
  menuContainer.id = 'menuContainer';
  document.body.appendChild(menuContainer);

  // Stijl de container
  menuContainer.style.position = 'fixed';
  menuContainer.style.top = '100px';
  menuContainer.style.right = '10px';
  menuContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
  menuContainer.style.border = '4px solid darkblue';
  menuContainer.style.borderRadius = '10px';
  menuContainer.style.padding = '10px';
  menuContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  menuContainer.style.display = 'flex';
  menuContainer.style.flexDirection = 'column'; // Maakt de knoppen onder elkaar
  menuContainer.style.gap = '10px';

  // Maak de knoppen en voeg ze toe aan de container
  const buttons = [
    { id: 'startButton', text: 'Start (a)', onClick: startLoop },
    { id: 'endButton', text: 'End (b)', onClick: endLoop },
    { id: 'stopButton', text: 'Stop Loop (s)', onClick: deleteLoop },
    { id: 'slowerButton', text: 'Slower -', onClick: videoSlower },
    { id: 'fasterButton', text: 'Faster +', onClick: videoFaster },
    { id: 'backButton', text: 'Back [', onClick: moveBack },
    { id: 'forwardButton', text: 'Forward ]', onClick: moveForward }
  ];
  

  buttons.forEach(buttonInfo => {
    const button = document.createElement('button');
    button.innerText = buttonInfo.text;
    button.onclick = buttonInfo.onClick;
    button.id = buttonInfo.id;
    button.style.cursor = 'pointer';
    button.style.backgroundColor = '#f0f0f0';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '5px';
    button.style.padding = '5px 10px';
    button.style.fontSize = '14px';
    button.style.transition = 'background-color 0.3s';
    button.onmouseover = () => button.style.backgroundColor = '#e0e0e0';
    button.onmouseleave = () => button.style.backgroundColor = '#f0f0f0';
    menuContainer.appendChild(button);
  });

  // Maak de snelheidstekst
  const speedDisplay = document.createElement('div');
  speedDisplay.id = 'speedDisplay';
  speedDisplay.innerText = (video.playbackRate * 100).toFixed(0) + '%'; // Standaardtekst gelijk aan huidige video snelheid
  menuContainer.appendChild(speedDisplay);

  // Stijl de snelheidstekst
  speedDisplay.style.textAlign = 'center';
  speedDisplay.style.marginBottom = '10px';

  // Maak de slider
  const slider = document.createElement('input');
  slider.id = "speedSlider"
  slider.type = 'range';
  slider.min = '0.1';
  slider.max = '2';
  slider.step = '0.1';
  slider.value = video.playbackRate; // Standaardwaarde gelijk aan huidige video snelheid
  slider.id = 'speedSlider';
  
  // Stijl de slider
  slider.style.width = '100%';
  slider.style.marginTop = '10px';

  // Voeg de slider toe aan de container
  menuContainer.appendChild(slider);

  // Functie om video snelheid aan te passen wanneer de slider beweegt
  slider.oninput = function() {
    video.playbackRate = this.value;
    speedDisplay.innerText = (this.value * 100).toFixed(0) + '%'; // Update de snelheidstekst
  };

  // Synchroniseer de slider met de video snelheid als deze elders wordt gewijzigd
  video.onratechange = updateSliderSpeed;
}

function updateSliderSpeed() {
  const slider = document.getElementById('speedSlider');
  slider.value = video.playbackRate;
  const speedDisplay = document.getElementById('speedDisplay');
  speedDisplay.innerText = (video.playbackRate * 100).toFixed(0) + '%'; // Update de snelheidstekst
}

// Roep de functie aan om het menu te creëren
createMenu();
draw();