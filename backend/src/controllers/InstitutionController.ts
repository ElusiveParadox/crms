import { Request, Response, NextFunction } from "express";
import { InstitutionService } from "../services/InstitutionService";

const service = new InstitutionService();

/**
 * @swagger
 * tags:
 *   name: Institutions
 *   description: Institution management APIs
 */

export class InstitutionController {
  
  /**
   * @swagger
   * /institutions:
   *   get:
   *     summary: Search institutions
   *     tags: [Institutions]
   *     parameters:
   *       - in: query
   *         name: query
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query for institution name
   *     responses:
   *       200:
   *         description: List of institutions
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.query as string;
      const result = await service.search(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /institutions:
   *   post:
   *     summary: Create a new institution
   *     tags: [Institutions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: Institution created successfully
   *       400:
   *         description: Validation error
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = (req as any).user;

      const institution = await service.create(name, user.id);

      res.status(201).json(institution);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /institutions/join:
   *   post:
   *     summary: Join an institution
   *     tags: [Institutions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [institutionId]
   *             properties:
   *               institutionId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Joined successfully
   *       400:
   *         description: Invalid request
   *       404:
   *         description: Institution not found
   */
  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const { institutionId } = req.body;
      const user = (req as any).user;

      const result = await service.joinInstitution(user.id, institutionId);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}