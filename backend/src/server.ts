import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Laya backend running on http://localhost:${PORT}`);
  console.log(`   NODE_ENV  : ${process.env.NODE_ENV}`);
  console.log(`   CORS      : ${process.env.ALLOWED_ORIGINS}`);
});
