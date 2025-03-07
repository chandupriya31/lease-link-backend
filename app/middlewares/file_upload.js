import multer from "multer";

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});


const fileFilter = (req, file, cb) => {

    const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const videoTypes = ["video/mp4", "video/mov", "video/avi"];
    const documentTypes = [
        "application/pdf",
        "application/docx",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ];

    if (req.originalUrl.includes("/upload-article") && imageTypes.includes(file.mimetype)) {
        return cb(null, true);
    } else if (req.originalUrl.includes("/upload-video") && videoTypes.includes(file.mimetype)) {
        return cb(null, true);
    } else if (req.originalUrl.includes("/upload-document") && documentTypes.includes(file.mimetype)) {
        return cb(null, true);
    } else {
        return cb(new Error("Invalid file type!"));
    }
};


const upload = multer({ storage, fileFilter });

export default upload;