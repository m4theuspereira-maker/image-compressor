import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../../.env") });

export const IMAGE_DOWNLOADED_PATH = 'images/';
export const IMAGE_DOWNLAODED_NAME = 'image.jpg';
export const IMAGE_COMPRESSED_NAME = 'thumb';
export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = String(process.env.DATABASE_URL);
