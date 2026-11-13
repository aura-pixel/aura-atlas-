import { Injectable } from '@nestjs/common';
import { PdfHypertextExtractor } from '../../material/extractor/pdf-hypertext.extractor';
@Injectable()
export class PdfTextExtractor extends PdfHypertextExtractor {}
