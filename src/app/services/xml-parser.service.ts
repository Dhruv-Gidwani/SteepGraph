// xml-parser.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class XmlParserService {

  async parseXml(xmlData: string): Promise<any> {
    const xml2js = await import('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });

    return parser.parseStringPromise(xmlData);
  }

}
