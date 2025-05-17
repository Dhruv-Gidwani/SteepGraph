// xml-parser.service.ts
import { Injectable } from '@angular/core';
import { Parser } from 'xml2js';

@Injectable({
    providedIn: 'root'
})
export class XmlParserService {
    async parseXml(xmlData: string): Promise<any> {
        const parser = new Parser({ explicitArray: false });
        return parser.parseStringPromise(xmlData);
    }
}
