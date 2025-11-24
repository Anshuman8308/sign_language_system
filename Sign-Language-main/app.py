from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import cv2
import mediapipe as mp
import numpy as np
import os
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Check if model exists
if not os.path.exists('./model.p'):
    print("❌ Error: model.p not found. Run train_classifier.py first.")
    exit()

# Load trained model
print("📂 Loading trained model...")
model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']
print("✅ Model loaded successfully!")

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.5, 
                       min_tracking_confidence=0.5)

# Gesture labels (A-Z)
labels_dict = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'hello', 6: 'G', 7: 'H', 8: 'I',
    9: 'J', 10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q',
    17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z'
}

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Sign Language Detection API is running'})

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict sign language from image frame"""
    try:
        # Get image data from request
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Convert PIL image to OpenCV format
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = hands.process(frame_rgb)
        
        if not results.multi_hand_landmarks:
            return jsonify({
                'detected': False,
                'prediction': None,
                'confidence': None,
                'message': 'No hand detected'
            })
        
        # Process first detected hand
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # Collect landmark data
        data_aux = []
        x_ = []
        y_ = []

        for landmark in hand_landmarks.landmark:
            x_.append(landmark.x)
            y_.append(landmark.y)

        for landmark in hand_landmarks.landmark:
            data_aux.append(landmark.x - min(x_))
            data_aux.append(landmark.y - min(y_))

        # Only predict if we have the correct number of features
        if len(data_aux) != 42:
            return jsonify({
                'detected': False,
                'prediction': None,
                'confidence': None,
                'message': f'Invalid feature count: {len(data_aux)}'
            })
        
        # Get bounding box
        H, W, _ = frame.shape
        x1 = int(min(x_) * W) - 10
        y1 = int(min(y_) * H) - 10
        x2 = int(max(x_) * W) + 10
        y2 = int(max(y_) * H) + 10
        
        # Ensure bounding box is within frame
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(W, x2)
        y2 = min(H, y2)
        
        # Make prediction
        prediction = model.predict([np.asarray(data_aux)])[0]
        predicted_character = labels_dict[int(prediction)]
        
        # Get prediction probabilities for confidence
        probabilities = model.predict_proba([np.asarray(data_aux)])[0]
        confidence = float(max(probabilities))
        
        return jsonify({
            'detected': True,
            'prediction': predicted_character,
            'confidence': confidence,
            'bbox': {
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labels', methods=['GET'])
def get_labels():
    """Get all available labels"""
    return jsonify({
        'labels': list(labels_dict.values()),
        'label_map': labels_dict
    })

if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    print("   API will be available at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)

