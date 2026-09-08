import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure secure storage paths are prepared on launch
  const UPLOADS_DIR = path.join(process.cwd(), "uploads");
  const SECURE_DIR = path.join(UPLOADS_DIR, "secure");
  const METADATA_FILE = path.join(SECURE_DIR, "metadata.json");

  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(SECURE_DIR)) fs.mkdirSync(SECURE_DIR, { recursive: true });
  if (!fs.existsSync(METADATA_FILE)) fs.writeFileSync(METADATA_FILE, JSON.stringify([], null, 2));

  // Helper key generator
  const getEncryptionKey = () => {
    const secret = process.env.ENCRYPTION_KEY || "parrotmoney-default-super-secret-key-13245";
    return crypto.createHash("sha256").update(secret).digest();
  };

  // Log all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // Serve high-resolution brand assets dynamically from uploaded logo files
  app.get(["/logo.png", "/logo-icon.png", "/parrot-money-final.png", "/Untitled - June 05, 2026 at 18.00.04.png"], (req, res) => {
    const newLogoPath = path.join(process.cwd(), "Untitled - June 05, 2026 at 18.00.04.png");
    const oldLogoPath = path.join(process.cwd(), "parrot-money-final.png");
    if (fs.existsSync(newLogoPath)) {
      res.sendFile(newLogoPath);
    } else if (fs.existsSync(oldLogoPath)) {
      res.sendFile(oldLogoPath);
    } else {
      res.status(404).send("Logo not found");
    }
  });

  const upload = multer({ dest: "uploads/" });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Sarvam AI API Configuration
  const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

  // STT Endpoint
  app.post("/api/voice/stt", (req, res, next) => {
    console.log("Incoming STT request");
    upload.single("audio")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: "File upload failed", details: err.message });
      }
      next();
    });
  }, async (req, res) => {
    console.log("POST /api/voice/stt handler started");
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (!SARVAM_API_KEY) {
      console.error("Missing SARVAM_API_KEY");
      return res.status(500).json({ error: "SARVAM_API_KEY not configured" });
    }

    if (!req.file) {
      console.error("No file in request. Body:", req.body);
      return res.status(400).json({ error: "No audio file provided" });
    }

    try {
      console.log(`Uploading ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes) to Sarvam AI`);
      const formData = new FormData();
      formData.append("file", fs.createReadStream(req.file.path), {
        filename: req.file.originalname || "audio.wav",
        contentType: req.file.mimetype || "audio/wav",
      });
      formData.append("model", "saaras:v1");
      formData.append("language_code", req.body.language_code || "hi-IN");

      const response = await axios.post("https://api.sarvam.ai/v1/speech-to-text", formData, {
        headers: {
          ...formData.getHeaders(),
          "api-subscription-key": SARVAM_API_KEY,
        },
      });

      console.log("Sarvam AI STT Success:", response.status);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.json(response.data);
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      const details = error.response?.data;
      console.error("STT API Error:", details || error.message);
      res.status(error.response?.status || 500).json({ 
        error: "STT failed", 
        message: error.message,
        details: typeof details === 'string' && details.startsWith('<!doctype') ? 'HTML Error from API' : details
      });
    }
  });

  // TTS Endpoint
  app.post("/api/voice/tts", async (req, res) => {
    console.log("POST /api/voice/tts received");
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (!SARVAM_API_KEY) {
      return res.status(500).json({ error: "SARVAM_API_KEY not configured" });
    }

    const { text, language_code = "hi-IN" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    try {
      const response = await axios.post(
        "https://api.sarvam.ai/v1/text-to-speech",
        {
          inputs: [text],
          target_language_code: language_code,
          speaker: "meera",
          model: "bulbul:v1",
        },
        {
          headers: {
            "api-subscription-key": SARVAM_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      const details = error.response?.data;
      console.error("TTS Error:", details || error.message);
      res.status(error.response?.status || 500).json({ 
        error: "TTS failed", 
        message: error.message,
        details: typeof details === 'string' && details.startsWith('<!doctype') ? 'HTML Error from API' : details
      });
    }
  });

  // Secure Document Upload Endpoint (AES-256-CBC Encrypted Storage)
  app.post("/api/documents/upload", upload.single("document"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No document file provided" });
      }

      const documentType = req.body.documentType || "other";
      const fileId = "doc_" + Date.now() + "_" + crypto.randomInt(1000, 9999);
      const originalName = req.file.originalname;
      const mimetype = req.file.mimetype;
      const tempPath = req.file.path;
      const encryptedFilename = `${fileId}.enc`;
      const encryptedFilePath = path.join(SECURE_DIR, encryptedFilename);

      // Read unencrypted temp file data
      const fileData = fs.readFileSync(tempPath);

      // Compute SHA-256 checksum of original file for integrity validation
      const checksum = crypto.createHash("sha256").update(fileData).digest("hex");

      // Generate secure Ivy and encrypt with stable derived 256-bit key
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(), iv);
      const encrypted = Buffer.concat([cipher.update(fileData), cipher.final()]);

      // Prepend public IV (16 bytes) then write encrypted file
      const finalContents = Buffer.concat([iv, encrypted]);
      fs.writeFileSync(encryptedFilePath, finalContents);

      // Delete the unencrypted temp path immediately
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      // Read current registry to append a record
      let metadataList = [];
      try {
        if (fs.existsSync(METADATA_FILE)) {
          metadataList = JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
        }
      } catch (e) {
        console.error("Error reading metadata list, resetting:", e);
        metadataList = [];
      }

      const newDocMetadata = {
        id: fileId,
        originalName,
        mimetype,
        size: fileData.length,
        uploadedAt: new Date().toISOString(),
        documentType,
        checksum,
        encryptedFilename
      };

      metadataList.push(newDocMetadata);
      fs.writeFileSync(METADATA_FILE, JSON.stringify(metadataList, null, 2));

      console.log(`Document [${originalName}] successfully encrypted and saved to storage.`);

      res.json({
        success: true,
        message: "Document successfully encrypted and uploaded.",
        document: {
          id: fileId,
          originalName,
          mimetype,
          size: fileData.length,
          uploadedAt: newDocMetadata.uploadedAt,
          documentType,
          checksum,
        }
      });
    } catch (error: any) {
      console.error("Secure upload handler failed:", error);
      res.status(500).json({ error: "Secure document upload failed", details: error.message });
    }
  });

  // List Secure Document Metadata API
  app.get("/api/documents/list", (req, res) => {
    try {
      let metadataList = [];
      if (fs.existsSync(METADATA_FILE)) {
        metadataList = JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
      }

      // Map clean payload, omitting disk storage particulars
      const cleanList = metadataList.map((doc: any) => ({
        id: doc.id,
        originalName: doc.originalName,
        mimetype: doc.mimetype,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        documentType: doc.documentType,
        checksum: doc.checksum,
      }));

      res.json(cleanList);
    } catch (error: any) {
      console.error("Listing secure documents failed:", error);
      res.status(500).json({ error: "Failed to load document records", details: error.message });
    }
  });

  // Secure Decrypt & Stream Download Endpoint
  app.get("/api/documents/download/:id", (req, res) => {
    try {
      const { id } = req.params;
      let metadataList = [];
      if (fs.existsSync(METADATA_FILE)) {
        metadataList = JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
      }

      const matchedDoc = metadataList.find((doc: any) => doc.id === id);
      if (!matchedDoc) {
        return res.status(404).json({ error: "Document not found" });
      }

      const encryptedPath = path.join(SECURE_DIR, matchedDoc.encryptedFilename);
      if (!fs.existsSync(encryptedPath)) {
        return res.status(404).json({ error: "Encrypted file payload missing on disk" });
      }

      // Read ciphertext
      const encryptedContents = fs.readFileSync(encryptedPath);

      // Extract IV and encrypted payload
      const iv = encryptedContents.subarray(0, 16);
      const ciphertext = encryptedContents.subarray(16);

      // Decrypt
      const decipher = crypto.createDecipheriv("aes-256-cbc", getEncryptionKey(), iv);
      const decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

      // Stream decrypted plaintext back
      res.setHeader("Content-Disposition", `attachment; filename="${matchedDoc.originalName}"`);
      res.setHeader("Content-Type", matchedDoc.mimetype);
      res.send(decryptedBuffer);
    } catch (error: any) {
      console.error("Dynamic decryption failed:", error);
      res.status(500).json({ error: "Decryption and download failed", details: error.message });
    }
  });

  // Lead Registration Endpoint
  app.post("/api/leads", (req, res) => {
    try {
      const { email, phone, name, source = "chat_advisory" } = req.body;
      if (!email || !phone) {
        return res.status(400).json({ error: "Email and phone are required." });
      }

      const LEADS_FILE = path.join(SECURE_DIR, "leads.json");
      let leads = [];
      if (fs.existsSync(LEADS_FILE)) {
        try {
          leads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
        } catch (e) {
          leads = [];
        }
      }

      const leadRecord = {
        id: "lead_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        name: (name || "").trim(),
        source,
        createdAt: new Date().toISOString()
      };

      leads.push(leadRecord);
      fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

      console.log(`[Lead Captured] ${leadRecord.email} | ${leadRecord.phone}`);
      res.json({ success: true, lead: leadRecord });
    } catch (error: any) {
      console.error("Failed to capture lead:", error);
      res.status(500).json({ error: "Failed to log lead record", details: error.message });
    }
  });

  // AI Chat Route with Deep Research & Principal Advisory Agent Capabilities
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, userContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request. 'messages' array is required." });
      }

      // Format messages for @google/genai SDK
      // Roles are mapped: user -> 'user', assistant/model -> 'model'
      const formattedContents = messages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const client = getGeminiClient();
      const SYSTEM_INSTRUCTION = `You are **AI**, a warm, thoughtful, and knowledgeable personal loan guide helping borrowers in India make smart home loan decisions.

## Persona & Conversational Style
- **Warm, Human & Empathetic**: Talk like a trusted, friendly financial advisor chatting over coffee. Be encouraging, clear, and easy to understand. Never sound like a robotic legal textbook, contract, or corporate algorithm.
- **Limited Yet Meaningful**: Keep responses concise, elegant, and easy to skim. Avoid giant walls of text. Give the essential numbers, insights, and options directly.
- **Clarity Over Jargon**: Explain concepts simply (e.g. explain FOIR as "the percentage of your monthly income that can go toward EMIs"). Highlight key figures in bold (e.g. **₹52,400/month**, **8.40% interest**).
- **Personal Touch**: If the user's name is provided, greet them naturally by name.

## Core Knowledge (Indian Mortgages)
- **Top Lenders & Rates**: SBI (from ~8.40%), HDFC Bank (from ~8.45%), ICICI Bank, Kotak, Bank of Baroda, LIC HFL, Bajaj Housing.
- **Loan Types**: New Home Purchase, Balance Transfer & Top-Up (zero prepayment penalty on floating rates as per RBI), Plot + Construction, Loan Against Property (LAP), Home Renovation, and NRI loans.
- **Key Calculations**:
  - FOIR / Eligibility: Banks usually allow 50% to 65% of net monthly income toward all EMIs combined.
  - Balance Transfer: Compare the new lower interest rate vs switching fees to show real net savings.
  - Fees & Transparency: Transparently mention processing fees, stamp duty/MODTD, and legal checks without making it sound scary.

## Response Structure
1. **Direct, helpful answer**: Start with the direct answer or calculation first.
2. **Clear breakdown**: Use brief bullet points or a mini table if comparing 2-3 banks.
3. **One gentle next step**: Ask a simple, friendly follow-up question (e.g., "Would you like me to calculate your exact EMI for this amount?").
${userContext ? `\nUser Context: Name: ${userContext.name || 'User'}, Mobile: +91 ${userContext.phone}, Email: ${userContext.email}.` : ''}`;

      // Fallback model list as defined in gemini-api skill
      const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let reply = "";
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            }
          });
          if (response.text) {
            reply = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed, attempting next fallback:`, err.message);
          lastError = err;
        }
      }

      if (!reply) {
        if (lastError) throw lastError;
        reply = "I was unable to formulate a response at this moment. Please try asking again.";
      }

      res.json({ reply });
    } catch (error: any) {
      console.error("AI Chatbot Error:", error);
      res.status(500).json({ 
        error: "AI Chatbot failed to respond", 
        message: error.message 
      });
    }
  });

  // Catch-all for API to prevent HTML responses
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found", path: req.url });
  });

  // Error handling middleware to ensure JSON responses
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandle Error:", err);
    res.status(err.status || 500).json({
      error: "Internal Server Error",
      message: err.message,
      path: req.url
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
