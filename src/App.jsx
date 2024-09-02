import { useRef, useEffect } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const imageUploadRef = useRef();
  let videoDescriptor = null;

  useEffect(() => {
    startVideo();
    loadModels();
  }, []);

  // Inicia el video desde la cámara del usuario
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Carga los modelos necesarios para la detección facial
  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(() => {
      faceMyDetect();
    });
  };

  // Detecta rostros en el video en tiempo real
  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();

      if (detections.length > 0) {
        videoDescriptor = detections[0].descriptor;
      }

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650
      });

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650
      });

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }, 1000);
  };

  // Compara el rostro detectado en el video con una imagen cargada
  const compareImages = async () => {
    if (!videoDescriptor) {
      document.getElementById('result').innerText = 'No se ha detectado ningún rostro en el video.';
      return;
    }

    const img = await faceapi.bufferToImage(imageUploadRef.current.files[0]);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      document.getElementById('result').innerText = 'No se detectó ningún rostro en la imagen cargada.';
      return;
    }

    const distance = faceapi.euclideanDistance(videoDescriptor, detection.descriptor);
    document.getElementById('result').innerText = `Distancia de similitud: ${distance} < 0.5 = probablemente eres juan`;
  };

  return (
    <div className="myapp">
      <h1>Detección y Comparación Facial</h1>
      <div className="appvideo">
        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
        <canvas ref={canvasRef} width="940" height="650" className="appcanvas"/>
      </div>
     
      <input type="file" ref={imageUploadRef} accept="image/*" onChange={compareImages} />
      <div id="result"></div>
    </div>
  );
}

export default App;


// import {useRef,useEffect} from 'react'
// import './App.css'
// import * as faceapi from 'face-api.js'

// function App(){
//   const videoRef = useRef()
//   const canvasRef = useRef()

//   useEffect(()=>{
//     startVideo()
//     videoRef && loadModels()

//   },[])

//   const startVideo = ()=>{
//     navigator.mediaDevices.getUserMedia({video:true})
//     .then((currentStream)=>{
//       videoRef.current.srcObject = currentStream
//     })
//     .catch((err)=>{
//       console.log(err)
//     })
//   }

//   const loadModels = ()=>{
//     Promise.all([
//       faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
//       faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//       faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
//       faceapi.nets.faceExpressionNet.loadFromUri("/models")
//       ]).then(()=>{faceMyDetect()})
//   }

//   const faceMyDetect = ()=>{
//     setInterval(async()=>{
//       const detections = await faceapi.detectAllFaces(videoRef.current,
//         new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

//       canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)
//       faceapi.matchDimensions(canvasRef.current,{
//         width:940,
//         height:650
//       })

//       const resized = faceapi.resizeResults(detections,{
//          width:940,
//         height:650
//       })

//       faceapi.draw.drawDetections(canvasRef.current,resized)
//       faceapi.draw.drawFaceLandmarks(canvasRef.current,resized)
//       faceapi.draw.drawFaceExpressions(canvasRef.current,resized)

//     },1)
//   }

//   return (
//     <div className="myapp">
//     <h1>FAce Detection</h1>
//       <div className="appvide">
        
//       <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
//       <canvas ref={canvasRef} width="940" height="650"
//       className="appcanvas"/>
//       </div>
      
//     </div>
//     )

// }

// export default App;