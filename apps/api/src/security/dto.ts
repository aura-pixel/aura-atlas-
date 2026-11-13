import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsHexColor,
  IsInt,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { HypertextTheme, MaterialType, RequestStatus } from '@prisma/client';

export class StructureSubtopicDto {
  @IsString() @Matches(/^\d+\.\d+(?:\.\d+)*$/) @MaxLength(40) number!: string;
  @IsString() @IsNotEmpty() @MaxLength(500) title!: string;
}
export class StructureTopicDto extends StructureSubtopicDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => StructureSubtopicDto)
  subtopics?: StructureSubtopicDto[];
}
export class StructureUnitDto {
  @IsInt() @Min(1) @Max(100) number!: number;
  @IsString() @IsNotEmpty() @MaxLength(500) title!: string;
  @IsOptional() @IsString() @MaxLength(5000) objective?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => StructureTopicDto)
  topics!: StructureTopicDto[];
}
export class StructureDto {
  @IsOptional() @IsString() @MaxLength(5000) subjectObjective?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => StructureUnitDto)
  units!: StructureUnitDto[];
}
export class SaveStructureDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => StructureDto)
  structure!: StructureDto;
}
export class ConfigurationDto {
  @IsOptional()
  @Matches(
    /^\/hypertext\/covers\/(?:[1-8]\.png|minimal-(?:lavender|sage|sky|cherry|peach|night)\.svg)$/,
  )
  @MaxLength(200)
  coverImageUrl?: string | null;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(250) title?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string | null;
  @IsOptional() @IsHexColor() primaryColor?: string;
  @IsOptional() @IsHexColor() secondaryColor?: string;
  @IsOptional()
  @IsString()
  @Matches(/^[\p{L}\d ,_-]+$/u)
  @MaxLength(100)
  fontFamily?: string;
  @IsOptional() @IsEnum(HypertextTheme) theme?: HypertextTheme;
}
export class UnitImageDto {
  @IsOptional()
  @Matches(
    /^(?:\/hypertext\/covers\/(?:[1-8]\.png|minimal-(?:lavender|sage|sky|cherry|peach|night)\.svg)|https:\/\/[a-zA-Z0-9.-]+(?::\d+)?\/[^\s]*)$/,
  )
  @MaxLength(2000)
  imageUrl?: string | null;
}
export class SaveMaterialDto {
  @IsOptional() @IsString() @MaxLength(100) uploadId?: string;
  @IsString() @IsNotEmpty() @MaxLength(250) name!: string;
  @IsString() @MaxLength(100) mimeType!: string;
  @IsInt() @Min(0) @Max(20 * 1024 * 1024) size!: number;
  @IsOptional() @IsString() @MaxLength(2000) url?: string;
  @IsString()
  @Matches(/^\d+\.\d+(?:\.\d+)*$/)
  @MaxLength(40)
  topicNumber!: string;
  @IsEnum(MaterialType) type!: MaterialType;
}
export class MaterialTopicDto {
  @IsString()
  @Matches(/^\d+\.\d+(?:\.\d+)*$/)
  @MaxLength(40)
  topicNumber!: string;
}
export class SaveMaterialsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SaveMaterialDto)
  files!: SaveMaterialDto[];
}
export class ReviewRequestDto {
  @IsEnum(RequestStatus) status!: RequestStatus;
  @IsOptional() @IsString() @MaxLength(1000) reviewNotes?: string;
}
export class EmailCodeDto {
  @IsString() @Matches(/^[a-f0-9]{64}$/) token!: string;
}
