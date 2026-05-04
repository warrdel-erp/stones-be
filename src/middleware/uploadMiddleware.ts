import multer from "multer";
import path from "path";
import { AppError } from "../helper/appError";

// Configure storage
const storage = multer.memoryStorage();

// File filter for CSV and Excel
const excelFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const filetypes = /csv|xlsx|xlsm|xls/;
    const allowedMimetypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroEnabled.12"
    ];
    
    const mimetype = allowedMimetypes.includes(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype || extname) {
        return cb(null, true);
    }
    cb(new AppError("Only .csv, .xlsx, .xlsm, and .xls files are allowed!", 400));
};

export const uploadCSV = multer({
    storage: storage,
    fileFilter: excelFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
