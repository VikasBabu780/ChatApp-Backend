import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors,
    });
  }

  // Custom API Error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value found.",
    });
  }

  // Default Error
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;