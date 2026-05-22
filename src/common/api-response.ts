export class ApiResponse<T>{
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  pagination?: PaginationMeta;
  status: boolean;
  constructor(
    status: boolean,
    statusCode: number,
    message: string,
    data: T,
    pagination?: PaginationMeta, 
  ){
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.pagination= pagination
  }

  static success<T>(
    data: T, 
    message:string = "Success",
    pagination?: PaginationMeta,
  ):ApiResponse<T>{
    return new ApiResponse<T>(true, 200, message, data, pagination);
  }

  static create<T>(
    data: T,
    message: string = "Create Successfully"
  ): ApiResponse<T>{
    return new ApiResponse<T>(true,201, message, data, undefined);
  }

  static paginated<T>(
    data: T,
    pagination: PaginationMeta,
    message: string = "Success"
  ): ApiResponse<T>{
    return new ApiResponse<T>(true, 200, message, data, pagination)
  }

  static error<T=null>(
    statusCode: number,
    message: string,
    data : T = null as T
  ): ApiResponse<T>{
    return new ApiResponse<T>(false, statusCode, message, data,undefined);
  }

  static badRequest<T=null>(
    message: string = "Bed request"
  ): ApiResponse<T>{
    return new ApiResponse<T>(false, 400, message, null as T, undefined);
  }

  static unAuthorized<T=null>(
    message: string = "Unauthorizated"
  ): ApiResponse<T>{
    return new ApiResponse<T>(false, 401, message, null as T, undefined)
  }

  static forbidden<T = null>(
    message: string = "Forbidden"
  ): ApiResponse<T>{
    return new ApiResponse<T>(false, 403, message, null as T, undefined)
  }

  static notFound<T = null>(
    message: string = "Resource not found"
  ):ApiResponse<T>{
    return new ApiResponse<T>(false, 404, message, null as T, undefined)
  }

  static internalError<T=null>(
    message:string = "Internal server error"
  ): ApiResponse<T>{
    return new ApiResponse<T>(false, 500, message, null as T, undefined)
  }

  static maintainceBreak<T=null>(
    message: string = "Service is temporarily unavailable due to maintenance. Please try again later."
  ):ApiResponse<T>{
    return new ApiResponse<T>(false, 503, message, null as T, undefined)
  }

}

export interface PaginationMeta{
  total: number;
  page: number;
  limit: number;
  totalPage: number;
  hasNext: boolean;
  hasPrev: boolean
}