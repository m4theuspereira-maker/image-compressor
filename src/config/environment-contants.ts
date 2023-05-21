export const IMAGE_DOWNLOADED_PATH = 'images/';
export const IMAGE_DOWNLAODED_NAME = 'image.png';
export const IMAGE_COMPRESSED_NAME = 'thumb';
import { resolve } from "path";
import { config } from "dotenv";


config({ path: resolve(__dirname, "../../.env") });

export const PORT = process.env.PORT || 3000;

