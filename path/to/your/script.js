let currentCamera = 'user'; // 默认使用前置摄像头

document.getElementById('switch-camera-button').addEventListener('click', function() {
    currentCamera = currentCamera === 'user' ? 'environment' : 'user';
    startCamera(currentCamera);
});

function startCamera(facingMode) {
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
    })
    .then(function(stream) {
        // 将视频流传递给视频元素或其他处理逻辑
        const videoElement = document.querySelector('video');
        videoElement.srcObject = stream;
    })
    .catch(function(error) {
        console.error('Error accessing media devices.', error);
    });
} 