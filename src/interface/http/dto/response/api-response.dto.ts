export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  statusCode: number;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    data: T,
    message = 'Success',
    statusCode = 200,
  ): ApiResponse<T> {
    return new ApiResponse<T>({
      success: true,
      message,
      data,
      statusCode,
    });
  }

  static error(message: string, error?: string, statusCode = 400): ApiResponse {
    return new ApiResponse({
      success: false,
      message,
      error,
      statusCode,
    });
  }
}
