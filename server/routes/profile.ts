import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    let profile = db.getHealthProfile(userId);

    if (!profile) {
      profile = db.createHealthProfile({
        userId,
        allergies: [],
        chronicConditions: [],
        updatedAt: new Date().toISOString(),
      });
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve health profile.' });
  }
});

// PUT /api/profile
router.put('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const {
      dateOfBirth,
      sex,
      bloodType,
      heightCm,
      weightKg,
      allergies,
      chronicConditions,
      medicalHistory,
      familyHistory,
      emergencyContact,
    } = req.body;

    const updatedProfile = db.updateHealthProfile(userId, {
      dateOfBirth,
      sex,
      bloodType,
      heightCm: heightCm ? Number(heightCm) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      allergies: Array.isArray(allergies) ? allergies : [],
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : [],
      medicalHistory,
      familyHistory,
      emergencyContact,
    });

    db.addHistoryItem(userId, {
      type: 'profile',
      title: 'Health Profile Updated',
      description: 'Personal metrics, conditions, and allergy records updated.',
    });

    res.json(updatedProfile);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update health profile.' });
  }
});

export default router;
