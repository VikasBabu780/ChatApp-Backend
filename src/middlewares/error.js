
import { ZodError } from "zod";

const errorHandler = (err, req, res, next) => {
  console.error("\n========== API ERROR ==========");
  console.error("URL:", req.method, req.originalUrl);
  console.error("Message:", err.message);

  if (err instanceof ZodError) {
    console.error("ZOD ERRORS:", err.issues);

    return res.status(400).json({
      success: false,
      message: "Please correct the following errors.",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  console.error("FULL ERROR:", err);

  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;

