import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// PUT /api/settings/profile
router.put('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, email } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Name is required.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ message: 'Valid email is required.' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing && existing.id !== userId) {
      res.status(400).json({ message: 'Email is already in use by another account.' });
      return;
    }

    const updated = db.updateUser(userId, { name: name.trim(), email: email.trim().toLowerCase() });
    if (!updated) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile settings.' });
  }
});

// PUT /api/settings/password
router.put('/password', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    db.updateUser(userId, { passwordHash: newHash });

    db.addHistoryItem(userId, {
      type: 'profile',
      title: 'Security: Password Changed',
      description: 'Account password was successfully updated.',
    });

    res.json({ message: 'Password updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

// GET /api/settings/export
router.get('/export', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const exportData = db.exportUserData(userId);

    if (!exportData) {
      res.status(404).json({ message: 'User data not found.' });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="medimate_health_archive_${userId}.json"`);
    res.json(exportData);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to export user health records.' });
  }
});

// DELETE /api/settings/conversations (clear chat history)
router.delete('/conversations', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const count = db.clearUserConversations(userId);

    db.addHistoryItem(userId, {
      type: 'profile',
      title: 'Consultations Cleared',
      description: `User cleared ${count} conversation record(s).`,
    });

    res.json({ message: `Successfully deleted ${count} conversation(s).` });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to clear conversations.' });
  }
});

// DELETE /api/settings/account
router.delete('/account', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const success = db.deleteUser(userId);

    if (!success) {
      res.status(404).json({ message: 'Account not found.' });
      return;
    }

    res.json({ message: 'Account and all associated health data permanently removed.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete account.' });
  }
});

export default router;
