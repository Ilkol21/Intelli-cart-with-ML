import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    // // Ми будемо отримувати ownerId з JWT токена в майбутньому,
    // // але поки що передамо його в тілі запиту.
    // @IsString()
    // @IsNotEmpty()
    // ownerId: string;
}