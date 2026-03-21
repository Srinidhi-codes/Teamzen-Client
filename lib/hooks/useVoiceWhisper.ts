"use client";

import { useState, useRef, useCallback } from "react";

export function useVoiceWhisper(options?: { onTranscript?: (text: string) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const onTranscriptRef = useRef(options?.onTranscript);
    onTranscriptRef.current = options?.onTranscript;

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // --- Silence Detection Setup ---
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            // --- MediaRecorder Setup ---
            const options = { mimeType: 'audio/webm;codecs=opus' };
            const mediaRecorder = MediaRecorder.isTypeSupported(options.mimeType)
                ? new MediaRecorder(stream, options)
                : new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start monitoring silence
            monitorSilence();

            return stream;
        } catch (err: any) {
            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError("device-not-found");
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("permission-denied");
            } else {
                setError("Could not access microphone");
            }
            return null;
        }
    }, []);

    const monitorSilence = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const check = () => {
            if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

            analyserRef.current.getByteFrequencyData(dataArray);
            const volume = dataArray.reduce((a, b) => a + b) / bufferLength;

            // Threshold for "silence" - can be adjusted
            if (volume < 15) {
                if (!silenceTimerRef.current) {
                    silenceTimerRef.current = setTimeout(() => {
                        stopRecording();
                    }, 2000); // 2 seconds of silence
                }
            } else {
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = null;
                }
            }

            requestAnimationFrame(check);
        };

        check();
    };

    const transcribeAudio = async (blob: Blob): Promise<string | null> => {
        const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        if (!apiKey) {
            setError("Groq API key is missing");
            return null;
        }

        const formData = new FormData();
        formData.append("file", blob, "recording.webm");
        formData.append("model", "whisper-large-v3");

        try {
            const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}` },
                body: formData,
            });

            if (!response.ok) throw new Error("Transcription failed");
            const data = await response.json();
            return data.text || null;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const stopRecording = useCallback(async (): Promise<string | null> => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        return new Promise((resolve) => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                    setIsProcessing(true);
                    const text = await transcribeAudio(audioBlob);
                    setIsProcessing(false);
                    if (text) onTranscriptRef.current?.(text);

                    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
                    if (audioContextRef.current) audioContextRef.current.close();

                    resolve(text);
                };

                mediaRecorderRef.current.stop();
                setIsRecording(false);
            } else {
                resolve(null);
            }
        });
    }, []);

    return {
        isRecording,
        isProcessing,
        error,
        startRecording,
        stopRecording,
    };
}
