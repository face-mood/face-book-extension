const platform = window.location.href.includes("meet") ? "meet" : "llp";

const defaultValue = {
  neutral: 0,
  happy: 0,
  sad: 0,
  angry: 0,
  fearful: 0,
  disgusted: 0,
  surprised: 0,
};

let currentEmotionElement = null;

const getVideoInGoogleMeet = () => {
  const videos = [...document.querySelectorAll("video")];

  if (videos.length === 1) {
    return;
  }

  const video = videos.find((video) => video.classList.length === 1);

  return video;
};

const getVideoInLLP = () => document.querySelector(".OT_subscriber video");

const getVideoPlatforms = {
  meet: getVideoInGoogleMeet,
  llp: getVideoInLLP,
};

const showEmotion = (video, expressions = defaultValue) => {
  const { parentNode: videoParent } = video;

  const emotionText = document.createElement("p");

  Object.assign(emotionText.style, {
    fontSize: "2rem",
    fontWeight: "bold",
    position: "absolute",
    top: "20px",
    left: "0",
    width: "100%",
    textAlign: "center",
  });

  const emotion = Object.entries(expressions).reduce(
    (acc, [key, value]) => {
      if (value > acc.value) {
        return { key, value };
      }

      return acc;
    },
    { key: "", value: 0 }
  );

  emotionText.innerText = emotion.key;

  if (currentEmotionElement) {
    if (currentEmotionElement.innerText === emotionText.innerText) {
      return;
    }

    currentEmotionElement.remove();
  }

  currentEmotionElement = emotionText;

  if (emotion.value > 0) {
    videoParent.appendChild(emotionText);
  }
};

const startScript = (video) => {
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const { expressions } = detections?.[0] ?? {};

    showEmotion(video, expressions);
  }, 50);
};

const getVideo = () => {
  const interval = setInterval(() => {
    const video = getVideoPlatforms[platform]();

    if (video) {
      clearInterval(interval);
      startScript(video);
    }
  }, 1000);
};

const main = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(chrome.runtime.getURL("/models")),
    faceapi.nets.faceLandmark68Net.loadFromUri(
      chrome.runtime.getURL("/models")
    ),
    faceapi.nets.faceRecognitionNet.loadFromUri(
      chrome.runtime.getURL("/models")
    ),
    faceapi.nets.faceExpressionNet.loadFromUri(
      chrome.runtime.getURL("/models")
    ),
  ]);

  getVideo();
};

main();
