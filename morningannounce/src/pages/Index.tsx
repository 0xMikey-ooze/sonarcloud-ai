import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Send, Phone, Loader2, CheckCircle } from "lucide-react";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processingStep, setProcessingStep] = useState('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const MAX_RECORDING_TIME = 240; // 4 minutes in seconds

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      toast({
        title: "Recording Started",
        description: "You can record for up to 4 minutes.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      toast({
        title: "Recording Stopped",
        description: "Your recording is ready for processing.",
      });
    }
  };

  const sendAnnouncement = async () => {
    if (!audioBlob) {
      toast({
        title: "Missing Audio",
        description: "Please record audio first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Step 1: Uploading audio
      setProcessingStep('Uploading audio...');
      setProcessingProgress(20);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      // Step 2: Processing with AI
      setProcessingStep('Processing speech with AI...');
      setProcessingProgress(50);
      
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();

      if (data.success) {
        // Step 3: Displaying results
        setProcessingStep('Generating morning announcement...');
        setProcessingProgress(75);
        setTranscript(data.transcript);
        setGeneratedAudioUrl(data.audioUrl);
        console.log('Generated audio URL:', data.audioUrl);

        // Step 4: Complete
        setProcessingStep('Complete!');
        setProcessingProgress(100);

        toast({
          title: "Success!",
          description: "Your Morning MiniPod is ready to play!",
        });

        // Reset form after success (but keep generated audio)
        setTimeout(() => {
          setAudioBlob(null);
          setRecordingTime(0);
          setProcessingStep('');
          setProcessingProgress(0);
        }, 3000);
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: `Failed to process recording: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (recordingTime / MAX_RECORDING_TIME) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Morning MiniPod Creator</h1>
          <p className="text-lg text-gray-600">Record your school announcements and generate a parent-focused audio summary</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Recording
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Controls */}
            <div className="text-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  disabled={isProcessing}
                >
                  <Mic className="h-8 w-8" />
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="h-20 w-20 rounded-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <Square className="h-8 w-8" />
                </Button>
              )}
            </div>

            {/* Recording Timer and Progress */}
            {(isRecording || recordingTime > 0) && (
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-2xl font-mono font-bold text-gray-800">
                    {formatTime(recordingTime)} / 4:00
                  </span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording...</span>
                  </div>
                )}
              </div>
            )}

            {/* Audio Preview */}
            {audioBlob && !isRecording && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <audio
                  controls
                  src={URL.createObjectURL(audioBlob)}
                  className="w-full max-w-md mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Recording duration: {formatTime(recordingTime)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Generate MiniPod Button */}
        <div className="text-center mb-6">
          <Button
            onClick={sendAnnouncement}
            disabled={!audioBlob || isProcessing}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Generate Morning MiniPod
              </>
            )}
          </Button>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{processingStep}</span>
                <span className="text-sm text-gray-500">{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
              <div className="text-xs text-gray-500 text-center">
                This may take a few moments...
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated MiniPod Player */}
        {generatedAudioUrl && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Your Morning MiniPod is Ready!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <audio
                  controls
                  src={generatedAudioUrl}
                  className="w-full"
                  preload="auto"
                  onError={(e) => console.error('Audio error:', e)}
                  onLoadStart={() => console.log('Audio loading started')}
                  onCanPlay={() => console.log('Audio can play')}
                >
                  Your browser does not support the audio element.
                </audio>
                <div className="mt-2 text-center">
                  <a 
                    href={generatedAudioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Download Audio File
                  </a>
                </div>
              </div>
              <p className="text-sm text-green-600 text-center">
                ✨ Complete with intro, your summarized announcement, and outro
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transcript Preview */}
        {transcript && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{transcript}</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default Index;
