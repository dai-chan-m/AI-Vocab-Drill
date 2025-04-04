import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";

// Visionライブラリ読み込み
import vision from "@google-cloud/vision";

// 環境変数からGoogle認証情報を取得して設定
let credentials;
if (process.env.GOOGLE_CREDENTIALS) {
  try {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (error) {
    console.error("Failed to parse GOOGLE_CREDENTIALS:", error);
  }
}

const client = new vision.ImageAnnotatorClient({
  credentials: credentials,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルが必要です" },
        { status: 400 }
      );
    }

    // 一時ファイルとして保存
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(tmpdir(), `ocr-${Date.now()}.png`);
    await writeFile(filePath, buffer);

    // OCR実行
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations ?? [];

    const text = detections[0]?.description ?? "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json({ error: "OCRに失敗しました" }, { status: 500 });
  }
}
