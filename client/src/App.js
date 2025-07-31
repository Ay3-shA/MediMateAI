import React, { useState } from "react";
import { Container, Form, Button, Card, Spinner } from "react-bootstrap";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { message });
      setResponse(res.data.reply);
    } catch (error) {
      console.error("❌ Axios Error:", error);
      setResponse("⚠️ Backend not responding or misconfigured.");
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <Container className="mt-5">
      <Card className="p-4 shadow-sm">
        <h2 className="mb-3">🩺 MediMateAI</h2>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Describe your symptoms..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
        </Form.Group>
        <Button className="mt-2" onClick={handleSend} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Send"}
        </Button>
        {response && (
          <Card className="mt-3 p-3 bg-light">
            <strong>Bot:</strong> {response}
          </Card>
        )}
      </Card>
    </Container>
  );
}

export default App;
