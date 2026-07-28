import { describe, it, expect, vi, beforeEach } from 'vitest';
import pool from '../config/db.js';
import { createInterview } from './interviewRepository.js';

// Mock the db module
vi.mock('../config/db.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('interviewRepository', () => {
  describe('createInterview', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should successfully create an interview and return the result', async () => {
      const mockParams = {
        userId: 'user123',
        role: 'Software Engineer',
        techStack: 'React, Node',
        difficulty: 'Medium',
      };

      const mockResult = {
        id: 1,
        user_id: mockParams.userId,
        role: mockParams.role,
        tech_stack: mockParams.techStack,
        difficulty: mockParams.difficulty,
        status: 'pending',
        created_at: new Date(),
      };

      pool.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await createInterview(mockParams);

      expect(result).toEqual(mockResult);
      expect(pool.query).toHaveBeenCalledTimes(1);

      const expectedQuery = `
      INSERT INTO interviews (
        user_id,
        role,
        tech_stack,
        difficulty
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

      // Need to clean up whitespaces in comparison, or just check values
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO interviews'),
        [mockParams.userId, mockParams.role, mockParams.techStack, mockParams.difficulty]
      );
    });

    it('should throw an error if the database query fails', async () => {
      const mockParams = {
        userId: 'user123',
        role: 'Software Engineer',
        techStack: 'React, Node',
        difficulty: 'Medium',
      };

      const mockError = new Error('Database error');
      pool.query.mockRejectedValueOnce(mockError);

      await expect(createInterview(mockParams)).rejects.toThrow('Database error');

      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});
