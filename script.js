const playPauseBtn = document.querySelector(".play-pause-btn")
const theaterBtn = document.querySelector(".theater-btn")
const fullScreenBtn = document.querySelector(".full-screen-btn")
const miniPlayerBtn = document.querySelector(".mini-player-btn")
const muteBtn = document.querySelector(".mute-btn")
const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")
const currentTimeElem = document.querySelector(".current-time")
const totalTimeElem = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const volumeSlider = document.querySelector(".volume-slider")
const videoContainer = document.querySelector(".video-container")
const timelineContainer = document.querySelector(".timeline-container")
const video = document.querySelector("video")

document.addEventListener("keydown", e => {
  const tagName = document.activeElement.tagName.toLowerCase()

  if (tagName === "input") return

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return
    case "k":
      togglePlay()
      break
    case "i":
      toggleMiniPlayerMode()
      break
    case "m":
      toggleMute()
      break
    case "arrowleft":
    case "j":
      skip(-5)
      break
    case "arrowright":
    case "l":
      skip(5)
      break
    case "c":
      toggleCaptions()
      break
  }
})

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  )
  const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`
  previewImg.src = previewImgSrc
  timelineContainer.style.setProperty("--preview-position", percent)

  if (isScrubbing) {
    e.preventDefault()
    thumbnailImg.src = previewImgSrc
    timelineContainer.style.setProperty("--progress-position", percent)
  }
}

// Playback Speed
// speedBtn.addEventListener("click", changePlaybackSpeed)

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25
  if (newPlaybackRate > 2) newPlaybackRate = 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
}

// Captions
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)

function toggleCaptions() {
  const isHidden = captions.mode === "hidden"
  captions.mode = isHidden ? "showing" : "hidden"
  videoContainer.classList.toggle("captions", isHidden)
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration)
})

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime)
  const percent = video.currentTime / video.duration
  timelineContainer.style.setProperty("--progress-position", percent)
})

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
})
function formatDuration(time) {
  const seconds = Math.floor(time % 60)
  const minutes = Math.floor(time / 60) % 60
  const hours = Math.floor(time / 3600)
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`
  }
}

function skip(duration) {
  video.currentTime += duration
}

// Volume
muteBtn.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value
  video.muted = e.target.value === 0
})

function toggleMute() {
  video.muted = !video.muted
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume
  let volumeLevel
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    volumeLevel = "muted"
  } else if (video.volume >= 0.5) {
    volumeLevel = "high"
  } else {
    volumeLevel = "low"
  }

  videoContainer.dataset.volumeLevel = volumeLevel
})

// View Modes
// theaterBtn.addEventListener("click", toggleTheaterMode)
// fullScreenBtn.addEventListener("click", toggleFullScreenMode)
// miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater")
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)

function togglePlay() {
  video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused")
})

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused")
})


// Sidebar js

let closed = false;
const tableContainer = document.querySelector('#table-container');
const sideBarButton = document.getElementById('side-bar-button');

sideBarButton.addEventListener('click', () => {
  console.log('Button clicked!');

  if(closed){
    document.getElementById("side-bar").style.display = "inline";
    tableContainer.style.gridTemplateColumns = '70% 30%';
    closed = false;
    document.getElementById("side-bar-icon").src = "assets/icons/sidebar.png"
    console.log('open')
  }
  else{
    document.getElementById("side-bar").style.display = "none";
    tableContainer.style.gridTemplateColumns = '100% 40%';
    closed = true;
    document.getElementById("side-bar-icon").src = "assets/icons/sidebarFlipped.png"
    console.log('closed')
  }
});

// ============================================
//          Sidebar List Functions
// ============================================


// ============================================ 
//          SERVER STUFF
// ============================================



var server = ""

function word(input){
  var deleteButton = "";
  var deleteButton = "<input type = 'Button' onClick='removeWord(\"" + input.id + "\")' value='delete'/>";
  var word = "<li id = '" + input.id + "' onclick='enableDefinitionView(\"" + input.word + "\")'/>" + input.word +"</li>";
  return word + deleteButton;
}

function getWords(){
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", server + "/api/words");
  xhttp.setRequestHeader("Content-Type", "application/json");

  xhttp.onload = function(){
    if (xhttp.status == 200){
      var words = JSON.parse(xhttp.responseText);
      var list = document.getElementById("side-bar-list");
      list.innerHTML = "";

      for(let i in words){
        list.innerHTML += word(words[i]);
      }
    }
  };

  xhttp.send();
}

function addWord(word){
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", server + "/api/words");
  xhttp.setRequestHeader("Content-Type", "application/json");

  xhttp.onload = function() {
    if (xhttp.status == 200){
      var returnedData = this.responseText;
      console.log(returnedData);
      getWords();
    }
  };
const data = JSON.stringify({words: word});
xhttp.send(data);
}

function removeWord(id){
  const xhttp = new XMLHttpRequest();
  xhttp.open("DELETE", server + "/api/words/" + id);

  xhttp.onload = function() {
    if (xhttp.status == 200){
      var returnedData = this.responseText;
      console.log(returnedData);
      getWords();
    }
  };
  xhttp.send();
}

// ============================================

function initializeWordList() {
  getWords();
}

/* function getSidebarList() {
  let elementList = []
  getSavedWords().forEach((word) => {
    let element = document.createElement("li");
    element.innerHTML = word;
    element.setAttribute("onclick",`enableDefinitionView("${word}")`)
    elementList.push(element);
  });
  return elementList;
}

function updateSidebarList() {
  const list = document.getElementById("side-bar-list")
  list.innerHTML = "";
  getSidebarList().forEach((element) => list.appendChild(element));
} */




// Functions for Definition "Page"
// ===============================

function setSidebarTitle(title){
  document.getElementById("side-bar-title").innerHTML = title;
}

function enableDefinitionView(word){
  setSidebarTitle(word);
  document.getElementById("side-bar-list").innerHTML = "";
  document.getElementById("back-arrow").style.visibility = "visible"
}

function enableListView(){
  document.getElementById("side-bar-title").innerHTML = "Saved Words/Phrases"
  getWords();
  document.getElementById("back-arrow").style.visibility = "hidden"
}



// ============================================

// language bar js

// language bar icon 
const settingsButton = document.querySelector('#settings-button');
const settingsPopup = document.querySelector('#settings-popup');

// language buttons
const englishButton = document.querySelector('#english-btn');
const frenchButton = document.querySelector('#french-btn');
const spanishButton = document.querySelector('#spanish-btn');

const englishCheckbox = document.querySelector('#english-checkbox');
const frenchCheckbox = document.querySelector('#french-checkbox');
const spanishCheckbox = document.querySelector('#spanish-checkbox');

settingsPopup.style.display = 'none';

let isOpen = false;


settingsButton.addEventListener('click', (e) => {
  console.log('Gear Button clicked!');
  
  e.stopPropagation();

  if(settingsPopup.style.display == 'none'){
    settingsPopup.style.display = 'block';
    isOpen = true;
  }
  else{
    settingsPopup.style.display = 'none';
    isOpen = false;
  } 
});

englishButton.addEventListener('click', () => {
  englishCheckbox.checked = !englishCheckbox.checked;
});

frenchButton.addEventListener('click', () => {
  frenchCheckbox.checked = !frenchCheckbox.checked;
});

spanishButton.addEventListener('click', () => {
  spanishCheckbox.checked = !spanishCheckbox.checked;
});

// subtitles j
const saveBtn = document.querySelector('#save-btn');
const subtitleContent = document.getElementById('subtitle-content');


window.addEventListener('click', function(e){   
  if (!(document.getElementById('settings-popup').contains(e.target))){
    if(isOpen){
      if(settingsPopup.style.display == 'block'){
        settingsPopup.style.display = 'none';
        console.log('clicked outside');
        isOpen = false;
      }
    } 
  } 
});

function getSelected(){
  if(document.getSelection){
    var text = document.getSelection().toString();
    console.log(text);
  }
  return text;
}

saveBtn.addEventListener('click', () => {
  console.log('save button clicked');
});

function changeSubtitles(text){
  subtitleContent.textContent = text;
}

