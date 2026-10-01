import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/medications
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const medications = db.getMedications(userId);
    res.json(medications);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch medications.' });
  }
});

// POST /api/medications
router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const {
      name,
      dosage,
      frequency,
      timeOfDay,
      instructions,
      prescribedFor,
      startDate,
      endDate,
      active,
      notes,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Medication name is required.' });
      return;
    }

    if (!dosage || typeof dosage !== 'string') {
      res.status(400).json({ message: 'Medication dosage is required.' });
      return;
    }

    if (!frequency || typeof frequency !== 'string') {
      res.status(400).json({ message: 'Frequency instructions are required.' });
      return;
    }

    const newMedication = db.createMedication(userId, {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      timeOfDay: Array.isArray(timeOfDay) ? timeOfDay : ['morning'],
      instructions: instructions?.trim(),
      prescribedFor: prescribedFor?.trim(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate,
      active: active !== undefined ? Boolean(active) : true,
      notes: notes?.trim(),
    });

    res.status(201).json(newMedication);
  } catch (error: any) {
    console.error('Add medication error:', error);
    res.status(500).json({ message: 'Failed to add medication.' });
  }
});

// PUT /api/medications/:id
router.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const medId = req.params.id;
    const updates = req.body;

    const updated = db.updateMedication(userId, medId, updates);
    if (!updated) {
      res.status(404).json({ message: 'Medication not found.' });
      return;
    }

    db.addHistoryItem(userId, {
      type: 'medication',
      title: `Updated Medication: ${updated.name}`,
      description: `Updated dosage/status (${updated.dosage} - ${updated.frequency}).`,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update medication.' });
  }
});

// PATCH /api/medications/:id/log (Log dosage taken/untaken)
router.patch('/:id/log', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const medId = req.params.id;
    const { date, taken } = req.body;

    const dateStr = date || new Date().toISOString().split('T')[0];
    const isTaken = taken !== undefined ? Boolean(taken) : true;

    const updated = db.logMedicationDose(userId, medId, dateStr, isTaken);
    if (!updated) {
      res.status(404).json({ message: 'Medication not found.' });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to log dose.' });
  }
});

// DELETE /api/medications/:id
router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const medId = req.params.id;

    const success = db.deleteMedication(userId, medId);
    if (!success) {
      res.status(404).json({ message: 'Medication not found.' });
      return;
    }

    res.json({ message: 'Medication removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete medication.' });
  }
});

export default router;
