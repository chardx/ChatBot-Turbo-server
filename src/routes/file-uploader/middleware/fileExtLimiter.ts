import path from "path";

const fileExtLimiter = (allowedExtArray) => {
  return (req: any, res, next) => {
    const files = req.files;

    const fileExtensions = [];
    Object.keys(files).forEach((key) => {
      fileExtensions.push(path.extname(files[key].name));
    });

    // Are the file extension allowed?
    const allowed = fileExtensions.every((ext) =>
      allowedExtArray.includes(ext)
    );

    if (!allowed) {
      const message: String =
        `Upload failed. Only ${allowedExtArray.toString()} files allowed. `.replace(
          /,/g,
          ", "
        );

      return res.status(422).json({ status: "error", message });
    }

    next();
  };
};
export default fileExtLimiter;
