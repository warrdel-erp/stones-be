import multer from "multer";
import path from "path";
import { AppError } from "../helper/appError";

// Configure storage
const storage = multer.memoryStorage();

// File filter for CSV
const csvFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const filetypes = /csv/;
    const mimetype = file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel";
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new AppError("Only .csv files are allowed!", 400));
};

export const uploadCSV = multer({
    storage: storage,
    fileFilter: csvFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
