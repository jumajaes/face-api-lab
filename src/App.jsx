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

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.ageGenderNet.loadFromUri('/models')
    ]).then(() => {
      faceMyDetect();
    });
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors().withAgeAndGender();

      // if (detections.length > 0 & detections[0].expressions.happy > 0.9) {
        if (detections.length > 0 ) {
        videoDescriptor = detections[0].descriptor;
        console.log(detections[0].descriptor, "dentro")

      }
     
      console.log(detections[0], "sdddddd")
      
    

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
      compareImages()
    }, 500);
  };

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
    document.getElementById('result').innerText =`Eres la misma persona: ${distance < 0.4}`;
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
// 
//import {useRef,useEffect} from 'react'
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