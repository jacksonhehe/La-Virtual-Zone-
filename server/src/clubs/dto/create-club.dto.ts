import { IsString, MinLength, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateClubDto {
  @IsString({ message: 'El nombre del club debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre del club debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre del club no puede exceder 100 caracteres' })
  name: string;

  @IsOptional()
  @IsInt({ message: 'El ID del manager debe ser un número entero' })
  @Min(1, { message: 'El ID del manager debe ser mayor a 0' })
  managerId?: number;
} 