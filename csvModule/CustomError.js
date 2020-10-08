class CustomError extends Error {
  constructor(message, errorDataArray) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.errorDataArray = errorDataArray;
  }
}

exports.CustomError = CustomError;
