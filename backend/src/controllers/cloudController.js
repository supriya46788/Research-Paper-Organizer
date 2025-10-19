import { bucket } from '../utils/firebase.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadPaperToCloud = async (req, res) => {
  try {
    if (!bucket) {
      return res.status(503).json({ 
        message: 'Cloud storage not available. Firebase service account not configured.' 
      });
    }
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileName = `${uuidv4()}_${req.file.originalname}`;
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({ metadata: { contentType: req.file.mimetype } });
    stream.end(req.file.buffer);
    stream.on('error', (err) => res.status(500).json({ message: err.message }));
    stream.on('finish', async () => {
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      res.json({ url: publicUrl, provider: 'firebase' });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadPaperFromCloud = async (req, res) => {
  try {
    if (!bucket) {
      return res.status(503).json({ 
        message: 'Cloud storage not available. Firebase service account not configured.' 
      });
    }
    
    const { fileName } = req.params;
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).json({ message: 'File not found' });
    res.setHeader('Content-Type', file.metadata.contentType || 'application/pdf');
    file.createReadStream().pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
