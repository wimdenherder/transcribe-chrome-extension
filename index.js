let activeNotes = [];
let durationShowNote = 0.1; // na zoveel seconden verdwijnt de noot uit beeld
let thresholdNote = 190; // drempelwaarde voor het detecteren van een noot
let maxFrequency = 2000;

// Globale variabelen voor start- en eindtijd
let startTime = null;
let endTime = null;

// Verkrijg het video-element
const video = document.querySelector("video");

// Functie om de huidige tijd van de video te controleren
function checkVideoTime() {
  if (endTime !== null && video.currentTime >= endTime) {
    video.currentTime = startTime;
    video.play();
  }
  requestAnimationFrame(checkVideoTime);
}

// Start het controleren van de tijd
checkVideoTime();

// Event listener voor toetsaanslagen
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "a":
      // Zet startTime op de huidige tijd van de video
      startTime = video.currentTime;
      // console.log(`Start time set to: ${startTime}`);
      break;
    case "b":
      // Zet endTime op de huidige tijd van de video en spring naar startTime
      endTime = video.currentTime;
      video.currentTime = startTime;
      // console.log(`End time set to: ${endTime}`);
      break;
    case "s":
      // Reset startTime en endTime
      startTime = null;
      endTime = null;
      // console.log('Start and end times reset');
      break;
    case "-":
      // Verlaag de afspeelsnelheid van de video
      video.playbackRate *= 1 / 1.15;
      // console.log(`Playback rate set to: ${video.playbackRate}`);
      break;
    case "=":
    case "+":
      // Verhoog de afspeelsnelheid van de video
      video.playbackRate *= 1.15;
      // console.log(`Playback rate set to: ${video.playbackRate}`);
      break;
    case "[":
      // ga klein stukje terug in video
      video.currentTime -= 0.5;
      break;
    case "]":
      // ga klein stukje vooruit in video
      video.currentTime += 0.5;
      break;
    default:
      // Doe niets voor andere toetsen
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

addKeyboardAndCanvasToBody();
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
  return Math.round(noteNum) + 49;
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

draw();
