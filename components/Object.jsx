"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {load as cocoSSDLoad} from "@tensorflow-models/coco-ssd"
import * as tf from "@tensorflow/tfjs"
import {  renderPredictions } from "@/utils/prediction";
import axios from "axios";

let detectInterval;
const Object = () => {
  const webcamRef = useRef(null);
  const canvasRef=useRef(null)
  const [isLoading, setIsLoding] = useState(true);
  const [loading,setLoading]=useState(false)
  const [classType,setClassType]=useState('')
  const [error,setError]=useState('')

  const runCoco = async () => {
    setIsLoding(true);
    let response = await cocoSSDLoad();
    setIsLoding(false);

    detectInterval = setInterval(() => {
      runObjectDetection(response);
    }, 3000);
  };

  async function runObjectDetection(response){
      if(canvasRef.current
      && webcamRef.current !==null 
      && webcamRef.current.video?.readyState === 4
      ){
        canvasRef.current.width = webcamRef.current.video.videoWidth;
        canvasRef.current.height = webcamRef.current.video.videoHeight;
      
        // find detectd obj 

        const obj=await response.detect(webcamRef.current.video,undefined,0.6);
        // console.log("oo",obj)
        for(let i=0;i<obj.length;i++){
          if(obj[i].class!=="person"){
            setClassType(obj[i].class);
          }
        }

        const context=canvasRef.current.getContext("2d")

        console.log("class name",obj)
       renderPredictions(obj,context)
      }
  }

const getResponse = async () => {
  if (!classType) {
    setError("Error: Please provide a topic");
    return;
  }
  try {
    setLoading(true);
    const message = `Give me article on the topic ${classType} .
  
    
    `;
    const options = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post("https://chat-api-913l.onrender.com/chat", { message }, options);
    console.log("response of ai chat",response)
   
  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};
  const showVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.videoWidth = myVideoWidth;
      webcamRef.current.video.videoHeight = myVideoHeight;
    }
  };

  useEffect(() => {
    runCoco();
    showVideo();
  }, []);
  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model</div>
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          {/* webcam  comp*/}
          <Webcam
            ref={webcamRef}
            className="rounded-md w-full lg:h-[720px]"
            muted
          />

          {/* canvas  comp*/}
          <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
          />
        </div>
      )}
      <button onClick={getResponse}>{classType}</button>
      {loading ? 
      <div>Loading</div>
      :
      <div>{error}</div> 
    }
    </div>
  );
};

export default Object;
