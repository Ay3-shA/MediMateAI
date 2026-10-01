import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

// GET /api/conversations
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const conversations = db.getConversations(userId);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve conversations.' });
  }
});

// POST /api/conversations
router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { title } = req.body;

    const conv = db.createConversation(userId, title || 'New Health Conversation');
    res.status(201).json(conv);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create conversation.' });
  }
});

// GET /api/conversations/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const convId = req.params.id;

    const conv = db.getConversationById(userId, convId);
    if (!conv) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    res.json(conv);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load conversation.' });
  }
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const convId = req.params.id;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ message: 'Message content is required.' });
      return;
    }

    const conv = db.getConversationById(userId, convId);
    if (!conv) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    // 1. Add user message
    const userMsgResult = db.addMessageToConversation(userId, convId, {
      role: 'user',
      content: content.trim(),
    });

    if (!userMsgResult) {
      res.status(500).json({ message: 'Failed to store user message.' });
      return;
    }

    // 2. Fetch context (profile and active meds)
    const profile = db.getHealthProfile(userId);
    const medications = db.getMedications(userId);

    // 3. Generate AI response with guardrails
    const history = conv.messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const aiResult = await aiService.generateMedicalResponse({
      userMessage: content.trim(),
      history,
      userProfile: profile,
      userMedications: medications,
    });

    // 4. Store assistant message
    const assistantMsgResult = db.addMessageToConversation(userId, convId, {
      role: 'assistant',
      content: aiResult.content,
      isUrgent: aiResult.isUrgent,
      suggestedQuestions: aiResult.suggestedQuestions,
    });

    // 5. Record activity in health history if conversation is significant
    if (conv.messages.length === 2) {
      db.addHistoryItem(userId, {
        type: 'consultation',
        title: conv.title,
        description: `Started new health consultation: "${content.slice(0, 60)}..."`,
        metadata: { conversationId: conv.id },
      });
    }

    res.json({
      conversation: assistantMsgResult?.conversation || conv,
      userMessage: userMsgResult.message,
      assistantMessage: assistantMsgResult?.message,
    });
  } catch (error: any) {
    console.error('Chat message processing error:', error);
    res.status(500).json({ message: 'Error communicating with health assistant. Please try again.' });
  }
});

// PATCH /api/conversations/:id
router.patch('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const convId = req.params.id;
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      res.status(400).json({ message: 'Conversation title is required.' });
      return;
    }

    const updated = db.updateConversationTitle(userId, convId, title.trim());
    if (!updated) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update conversation title.' });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const convId = req.params.id;

    const success = db.deleteConversation(userId, convId);
    if (!success) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    res.json({ message: 'Conversation deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete conversation.' });
  }
});

export default router;
