import { Logger } from '../utils/logger.js';
import { ApplicationError, ErrorCodes } from '../utils/error-boundary.js';

export class VideoManager {
    constructor() {
        this.videoContainer = document.getElementById('video-container');
        this.previewVideo = document.getElementById('preview');
        this.isActive = false;
        this.stream = null; // Store the stream
    }

    async start(onFrame, facingMode = 'user') {
        if (this.isActive) {
            this.stop();
        }

        try {
            const constraints = {
                audio: false,
                video: { facingMode }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (!this.stream) {
                throw new ApplicationError('Failed to get camera stream', ErrorCodes.CAMERA_ACCESS_FAILED);
            }

            this.previewVideo.srcObject = this.stream;

            // Wait for video metadata to be loaded before capturing frames
            this.previewVideo.onloadedmetadata = () => {
                this.captureFrames(onFrame);
                this.videoContainer.style.display = 'block';
                this.isActive = true;
                Logger.info('Video started');
            };

            await this.previewVideo.play();

            // Call onFrame callback with initial frame
            const initialFrame = this.captureFrame();
            onFrame(initialFrame);

            // Start capturing frames
            this.captureFrames(onFrame);


            Logger.info('Video started');
        } catch (error) {
            this.isActive = false;
            this.videoContainer.style.display = 'none';
            Logger.error('Failed to start video:', error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    /**
     * Captures a single frame from the video.
     * @returns {string} Base64 encoded frame data.
     */
    captureFrame() {
        const canvas = document.createElement('canvas');
        canvas.width = this.previewVideo.videoWidth;
        canvas.height = this.previewVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.previewVideo, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg').split(',')[1];
    }

    captureFrames(onFrame) {
        const capture = () => {
            if (!this.isActive) {
                return;
            }
            const frame = this.captureFrame();
            onFrame(frame);
            requestAnimationFrame(capture);
        };
        requestAnimationFrame(capture);
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.previewVideo.srcObject = null;
            this.stream = null;
        }
        this.isActive = false;
        this.videoContainer.style.display = 'none';
        Logger.info('Video stopped');
    }
}