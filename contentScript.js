console.log("oie")
console.log(faceapi);
console.log("oi2");

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

const showEmotion = (video, expressions = defaultValue) => {
  const { parentNode: videoParent } = video;

  const emotionText = document.createElement('p');

  Object.assign(emotionText.style, {
    fontSize: '2rem',
    fontWeight: 'bold',
    position: 'absolute',
    top: '10px',
    left: '0',
    width: '100%',
    textAlign: 'center',
  });

  const emotion = Object.entries(expressions).reduce((acc, [key, value]) => {
    if (value > acc.value) {
      return { key, value };
    }

    return acc;
  }, { key: '', value: 0 });

  emotionText.innerText = emotion.key;

  if (currentEmotionElement) {
    currentEmotionElement.remove();
  }


  currentEmotionElement = emotionText;

  videoParent.appendChild(emotionText);
};

const startScript = (video) => {

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const { expressions } = detections?.[0] ?? {};

    showEmotion(video, expressions);
  }, 50)
};

const getVideo = () => {
  const interval = setInterval(() => {
    console.log('interval');
    const videos = document.querySelectorAll('video');
  
    const video = [...videos].find((video) => video.classList.length === 1);
  
    if (video) {
      clearInterval(interval);
      startScript(video);
    }
  }, 1000);
};


const main = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(chrome.runtime.getURL('/models')),
    faceapi.nets.faceLandmark68Net.loadFromUri(chrome.runtime.getURL('/models')),
    faceapi.nets.faceRecognitionNet.loadFromUri(chrome.runtime.getURL('/models')),
    faceapi.nets.faceExpressionNet.loadFromUri(chrome.runtime.getURL('/models'))
  ]);


  getVideo();
};

main();
