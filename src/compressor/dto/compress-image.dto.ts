import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CompressorImageDto {
  @ApiProperty({
    description: 'Public image url',
    example: 'https://www.publicimage/image.jpg',
  })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Compression rate used to compress image that comes from url',
    example: 10,
  })
  @IsNotEmpty()
  compression: number;
}
