const currentTimeEl = document.querySelector(".current-time");
const durationEl = document.querySelector(".duration");
const progressEl = document.querySelector(".progress");
progressEl.style.display = "block";
let mouseDownOnProgressEl = false;
progressEl.addEventListener("change", event => {
  const pct = event.target.value / 100;
  audio.currentTime = (audio.duration || 0) * pct;
});
progressEl.addEventListener("mousedown", () => {
  mouseDownOnProgressEl = true;
});
progressEl.addEventListener("mouseup", () => {
  mouseDownOnProgressEl = false;
});

const playAllEl = document.querySelector('input[name="play-all"]');
let playAll = playAllEl.checked;
playAllEl.addEventListener("click", event => {
  playAll = event.target.checked;
});
const repeatEl = document.querySelector('input[name="repeat"]');
let repeat = repeatEl.checked;
repeatEl.addEventListener("click", event => {
  repeat = event.target.checked;
});
const audio = document.createElement("audio");
const controlsEl = document.querySelector(".controls");
controlsEl.style.display = "block";
const tracks = [...document.querySelectorAll("a[href$=ogg]")];
let currentTrack = 0;
audio.src = tracks[currentTrack].href;

const play = () => {
  audio.src = tracks[currentTrack].href;
  audio.play();
};

const padTime = n => (~~(n) + "").padStart(2, "0");
const fmtTime = s =>
  s < 1 ? "00:00" : `${padTime(s / 60)}:${padTime(s % 60)}`
;

audio.addEventListener("loadeddata", event => {
  progressEl.value = 0;
  currentTimeEl.textContent = fmtTime(audio.currentTime);
  durationEl.textContent = fmtTime(audio.duration);
  // TODO hide buffering spinner here
});
audio.addEventListener("timeupdate", event => {
  currentTimeEl.innerText = fmtTime(audio.currentTime);
  durationEl.innerText = fmtTime(audio.duration);

  if (!mouseDownOnProgressEl) {
    progressEl.value = audio.currentTime / audio.duration * 100;
  }
});
audio.addEventListener("error", event => {
  console.error("something went wrong"); // TODO
});
audio.addEventListener("play", e => {
  // TODO show buffering spinner here
  if (audio.currentTime < 1) { // FIXME Meh
    progressEl.value = 0;
  }

  tracks.forEach(e => e.classList.remove("playing", "paused"));
  tracks[currentTrack].classList.add("playing");
});
audio.addEventListener("pause", e => {
  tracks.forEach(e => e.classList.remove("playing", "paused"));
  tracks[currentTrack].classList.add("paused");
});
audio.addEventListener("stop", e => {
  tracks.forEach(e => e.classList.remove("playing", "paused"));
});
audio.addEventListener("ended", e => {
  tracks[currentTrack].classList.remove("playing", "paused");

  if (playAll) {
    currentTrack = ++currentTrack;

    if (currentTrack >= tracks.length) {
      currentTrack = tracks.length - 1;

      if (repeat) {
        currentTrack = 0;
        play();
      }
    }
    else if (currentTrack !== 0) {
      play();
    }
  }
  else if (repeat) {
    audio.currentTime = 0;
    audio.play();
  }
});

tracks.forEach(track => {
  track.addEventListener("click", event => {
    event.preventDefault();
    
    if (audio.src === track.href) {
      audio.paused ? audio.play() : audio.pause();
    }
    else {
      currentTrack = tracks.findIndex(e => e.href === track.href);
    console.log(currentTrack)
      play();
    }
  });
});

const sortable = new Sortable(document.querySelector("section ul"), {
  animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
  easing: "cubic-bezier(1, 0, 0, 1)", // Easing for animation. Defaults to null. See https://easings.net/ for examples.

  // Called by any change to the list (add / update / remove)
  onSort: evt => {
    const {newIndex, oldIndex} = evt;
    tracks.splice(newIndex, 0, tracks.splice(oldIndex, 1)[0]);
    currentTrack = tracks.findIndex(e => e.href === audio.src);
  },
});

