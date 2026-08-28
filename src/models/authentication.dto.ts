export interface RegisterRequestDto {
  username: string;
  password: string;
}

export interface RegisterResponseDto {
  username: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  jsonwebtoken: string;
}
