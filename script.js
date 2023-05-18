let API_KEY;

const recordButton = document.getElementById('recordButton');
const transcriptionElement = document.getElementById('transcription');
const outputTextArea = document.getElementById('output-text');
let recordRTC;

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const options = {
            type: 'audio',
            mimeType: 'audio/webm',
            numberOfAudioChannels: 1,
            recorderType: RecordRTC.StereoAudioRecorder,
            checkForInactiveTracks: true
        };

        recordRTC = new RecordRTC(stream, options);
        recordRTC.startRecording();

        recordButton.textContent = 'Stop';
    } catch (err) {
        console.error('Error:', err);
    }
};

const stopRecording = () => {
    if (recordRTC) {
        recordRTC.stopRecording(() => {
            const audioBlob = recordRTC.getBlob();
            sendToWhisperAPI(audioBlob);
        });

        recordButton.textContent = 'Record';
    }
};

const sendToWhisperAPI = async (audioBlob) => {
  const SERVER_URL = '/whisper/asr';

  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Server response:', JSON.stringify(response));

    if (data.transcription) {
      transcriptionElement.textContent = `Transcription: ${data.transcription}`;
      sendToChatGPT(data.transcription);
    } else {
      transcriptionElement.textContent = 'Transcription not available.';
    }
  } catch (error) {
    console.error('Error:', error);
    transcriptionElement.textContent = 'Error while transcribing.';
  }
};

const sendToChatGPT = async (transcription) => {
  const SERVER_URL = '/chatgpt';

  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: transcription }),
    });

    const data = await response.json();
    console.log('Server response:', JSON.stringify(response));

    if (data.reply) {
      outputTextArea.value = `Reply: ${data.reply}`;
    } else {
      outputTextArea.value = 'Reply not available.';
    }
  } catch (error) {
    console.error('Error:', error);
    outputTextArea.value = 'Error while getting reply.';
  }
};


recordButton.addEventListener('click', () => {
  if (recordRTC && recordRTC.getState() === 'recording') {
    stopRecording();
  } else {
    startRecording();
  }
});

const downloadButton = document.getElementById('downloadButton');

const downloadTextFile = () => {
  const text = document.getElementById('output-text').value;
  const filename = 'output.txt';
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

downloadButton.addEventListener('click', downloadTextFile);
