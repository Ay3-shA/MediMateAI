from flask import Flask, request, jsonify
from flask_cors import CORS

# 🚀 Initialize Flask app
app = Flask(__name__)
CORS(app)

# 🧠 Dummy /chat endpoint (returns fixed message)
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")

    if not user_input:
        return jsonify({"reply": "Please provide a message."}), 400

    reply = "⚠️ AI temporarily disabled — API key removed. Chatbot logic will be added later."
    return jsonify({"reply": reply})

# 🌐 Home route
@app.route("/", methods=["GET"])
def home():
    return "MediMateAI Backend Running (no AI configured)"

# ▶️ Run the app
if __name__ == "__main__":
    app.run(debug=True)
