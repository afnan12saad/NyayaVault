import { Router, Request, Response } from 'express';
import {
  classifyDocument,
  extractMetadata,
  summarizeDocument,
  parseSearchQuery,
  summarizeCase,
  LegalDisclaimer
} from '../services/geminiService';
import { calculateSha256, verifyDocumentIntegrity, generateCustodyVerificationToken } from '../services/integrityService';

const router = Router();

// Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NyayaVault Secure Core API'
  });
});

// AI Document Classification
router.post('/ai/classify', async (req: Request, res: Response) => {
  try {
    const { content, fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }
    const result = await classifyDocument(content || fileName, fileName);
    res.json(result);
  } catch (error) {
    console.error('API Classify Error:', error);
    res.status(500).json({ error: 'Classification process failed' });
  }
});

// AI Metadata Extraction
router.post('/ai/extract', async (req: Request, res: Response) => {
  try {
    const { content, fileName } = req.body;
    if (!content && !fileName) {
      return res.status(400).json({ error: 'content or fileName is required' });
    }
    const result = await extractMetadata(content || fileName, fileName || 'document.txt');
    res.json(result);
  } catch (error) {
    console.error('API Extract Error:', error);
    res.status(500).json({ error: 'Metadata extraction failed' });
  }
});

// AI Document Summarization
router.post('/ai/summarize', async (req: Request, res: Response) => {
  try {
    const { content, fileName, documentType } = req.body;
    if (!content && !fileName) {
      return res.status(400).json({ error: 'content or fileName is required' });
    }
    const result = await summarizeDocument(content || fileName, fileName || 'document.txt', documentType);
    res.json(result);
  } catch (error) {
    console.error('API Summarize Error:', error);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

// AI Intelligent Search Parser
router.post('/ai/search-assist', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query string is required' });
    }
    const result = await parseSearchQuery(query);
    res.json(result);
  } catch (error) {
    console.error('API Search Assist Error:', error);
    res.status(500).json({ error: 'Search assistance failed' });
  }
});

// AI Case Summary
router.post('/ai/case-summary', async (req: Request, res: Response) => {
  try {
    const { caseData, documents } = req.body;
    if (!caseData) {
      return res.status(400).json({ error: 'caseData is required' });
    }
    const result = await summarizeCase(caseData, documents || []);
    res.json(result);
  } catch (error) {
    console.error('API Case Summary Error:', error);
    res.status(500).json({ error: 'Case summary generation failed' });
  }
});

// Hash calculation endpoint
router.post('/integrity/hash', (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content is required for hash generation' });
    }
    const hash = calculateSha256(content);
    res.json({
      success: true,
      hash,
      algorithm: 'SHA-256',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Hash calculation failed' });
  }
});

// Integrity verification endpoint
router.post('/integrity/verify', (req: Request, res: Response) => {
  try {
    const { originalHash, currentContent, currentHash } = req.body;
    if (!originalHash) {
      return res.status(400).json({ error: 'originalHash is required' });
    }

    if (currentContent) {
      const result = verifyDocumentIntegrity(originalHash, currentContent);
      return res.json({ success: true, ...result });
    } else if (currentHash) {
      const isMatch = originalHash.toLowerCase() === currentHash.toLowerCase();
      return res.json({
        success: true,
        isVerified: isMatch,
        status: isMatch ? 'VERIFIED' : 'INTEGRITY_WARNING',
        originalHash,
        currentHash,
        timestamp: new Date().toISOString(),
        message: isMatch
          ? 'Cryptographic integrity verified. Checksums match.'
          : 'INTEGRITY WARNING: Checksum mismatch detected! Document has been altered.'
      });
    }

    res.status(400).json({ error: 'Either currentContent or currentHash must be provided' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Custody Verification Token
router.post('/custody/token', (req: Request, res: Response) => {
  try {
    const { evidenceId, from, to } = req.body;
    const token = generateCustodyVerificationToken(
      evidenceId || 'EV-GENERIC',
      from || 'Officer',
      to || 'Locker',
      new Date().toISOString()
    );
    res.json({ success: true, token, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Custody token generation failed' });
  }
});

export default router;
