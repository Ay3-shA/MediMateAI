import React, { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { message });
      setResponse(res.data.reply);
    } catch (error) {
      setResponse("Server not responding. Is Flask running?");
    }
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
          />
        </Form.Group>
        <Button className="mt-2" onClick={handleSend}>
          Send
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
