import { storagePut } from "./server/storage.js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const photos = [
  "santakayak.jpg",
  "SANTADOGS.jpg",
  "santagroup2.jpg",
  "santAPADDLE.jpg",
  "SANTAPADDLEGROUP.JPG",
];

async function uploadPhotos() {
  const results = [];
  
  for (const photo of photos) {
    const filePath = join(process.cwd(), "santa-paddle-photos", photo);
    const fileBuffer = readFileSync(filePath);
    
    const key = `santa-paddle/${photo}`;
    const result = await storagePut(key, fileBuffer, "image/jpeg");
    
    console.log(`Uploaded ${photo}: ${result.url}`);
    results.push({
      filename: photo,
      key: result.key,
      url: result.url,
    });
  }
  
  // Save results to JSON file
  writeFileSync(
    join(process.cwd(), "santa-paddle-photos", "upload-results.json"),
    JSON.stringify(results, null, 2)
  );
  
  console.log("\n✅ All photos uploaded successfully!");
  console.log(`Results saved to santa-paddle-photos/upload-results.json`);
}

uploadPhotos().catch(console.error);
