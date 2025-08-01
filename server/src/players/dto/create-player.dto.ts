import { IsString, MinLength, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePlayerDto {
  @IsString({ message: 'El nombre del jugador debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre del jugador debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre del jugador no puede exceder 100 caracteres' })
  name!: string;

  @IsOptional()
  @IsInt({ message: 'El ID del club debe ser un número entero' })
  @Min(1, { message: 'El ID del club debe ser mayor a 0' })
  clubId?: number;
} 