import { ArrayNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ArrayNotEmpty()
  @IsString({ each: true })
  users: string[];

  title: string;
}
