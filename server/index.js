import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

const PORT = 8000;

let sheetsConfig = null;

function getSheetsConfig() {
  if (sheetsConfig) return sheetsConfig;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!email || !key || !spreadsheetId || email.startsWith("placeholder")) {
    return null;
  }

  const auth = new google.auth.JWT(
    email,
    null,
    key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  sheetsConfig = {
    sheets: google.sheets({ version: "v4", auth }),
    spreadsheetId,
  };
  return sheetsConfig;
}

app.post("/api/save", async (req, res) => {
  try {
    const { expression, result } = req.body;
    if (!expression || result === undefined) {
      return res.status(400).json({ error: "Missing expression or result" });
    }

    const config = getSheetsConfig();
    if (!config) {
      return res.status(503).json({ error: "Google Sheets not configured" });
    }

    const timestamp = new Date().toLocaleString("en-GB", {
      timeZone: "Africa/Casablanca",
    });

    await config.sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: "A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[timestamp, expression, result]],
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  const configured = getSheetsConfig() !== null;
  res.json({ status: "ok", sheetsConfigured: configured });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Calculator API running on port ${PORT}`);
});
