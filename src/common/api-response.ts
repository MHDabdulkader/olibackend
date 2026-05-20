export class ApiResponse<T>{
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  pagination?: PaginationMeta;
  success: boolean;
  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: T,
    timestamp: string,
    pagination?: PaginationMeta, 
  ){
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.pagination= pagination
  }

  static success<T>(data: T, message:string = "Success"){

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