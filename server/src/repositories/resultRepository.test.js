import test, { describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import pool from '../config/db.js';
import { saveInterviewResult, getInterviewResult } from './resultRepository.js';

describe('resultRepository', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  describe('saveInterviewResult', () => {
    test('should insert interview result and return the created record', async () => {
      const mockResult = {
        id: 1,
        interview_id: '123',
        overall_score: 85,
        strengths: 'Good communication',
        weaknesses: 'Needs more technical depth',
        feedback: 'Overall good',
      };

      const queryMock = mock.method(pool, 'query', async () => {
        return { rows: [mockResult] };
      });

      const input = {
        interviewId: '123',
        overallScore: 85,
        strengths: 'Good communication',
        weaknesses: 'Needs more technical depth',
        feedback: 'Overall good',
      };

      const result = await saveInterviewResult(input);

      assert.deepStrictEqual(result, mockResult);
      assert.strictEqual(queryMock.mock.callCount(), 1);

      const callArgs = queryMock.mock.calls[0].arguments;
      assert.ok(callArgs[0].includes('INSERT INTO interview_results'));
      assert.deepStrictEqual(callArgs[1], [
        '123',
        85,
        'Good communication',
        'Needs more technical depth',
        'Overall good',
      ]);
    });

    test('should bubble up database errors', async () => {
      const dbError = new Error('Database connection failed');
      mock.method(pool, 'query', async () => {
        throw dbError;
      });

      const input = {
        interviewId: '123',
        overallScore: 85,
        strengths: 'Good communication',
        weaknesses: 'Needs more technical depth',
        feedback: 'Overall good',
      };

      await assert.rejects(async () => {
        await saveInterviewResult(input);
      }, dbError);
    });
  });

  describe('getInterviewResult', () => {
    test('should retrieve an interview result by ID', async () => {
      const mockResult = {
        id: 1,
        interview_id: '456',
        overall_score: 90,
        strengths: 'Excellent',
        weaknesses: 'None',
        feedback: 'Great',
      };

      const queryMock = mock.method(pool, 'query', async () => {
        return { rows: [mockResult] };
      });

      const result = await getInterviewResult('456');

      assert.deepStrictEqual(result, mockResult);
      assert.strictEqual(queryMock.mock.callCount(), 1);

      const callArgs = queryMock.mock.calls[0].arguments;
      assert.ok(callArgs[0].includes('SELECT *'));
      assert.ok(callArgs[0].includes('FROM interview_results'));
      assert.ok(callArgs[0].includes('WHERE interview_id = $1'));
      assert.deepStrictEqual(callArgs[1], ['456']);
    });

    test('should return undefined if no result is found', async () => {
      mock.method(pool, 'query', async () => {
        return { rows: [] };
      });

      const result = await getInterviewResult('789');

      assert.strictEqual(result, undefined);
    });

    test('should bubble up database errors', async () => {
      const dbError = new Error('Database query failed');
      mock.method(pool, 'query', async () => {
        throw dbError;
      });

      await assert.rejects(async () => {
        await getInterviewResult('789');
      }, dbError);
    });
  });
});