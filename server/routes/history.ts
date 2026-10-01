import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/history
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as string | undefined;

    const items = db.getHistory(userId, type);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve health history.' });
  }
});

// POST /api/history/notes
router.post('/notes', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ message: 'Note title is required.' });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(400).json({ message: 'Note description is required.' });
      return;
    }

    const noteItem = db.addHistoryItem(userId, {
      type: 'note',
      title: title.trim(),
      description: description.trim(),
    });

    res.status(201).json(noteItem);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create health note.' });
  }
});

// DELETE /api/history/:id
router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;

    const success = db.deleteHistoryItem(userId, id);
    if (!success) {
      res.status(404).json({ message: 'History entry not found.' });
      return;
    }

    res.json({ message: 'Entry removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete history entry.' });
  }
});

export default router;
