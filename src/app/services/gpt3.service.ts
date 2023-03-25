import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Gpt3Service {
  private apiUrl = 'https://api.openai.com/v1/completions';
  private apiKey = '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';

  constructor(private http: HttpClient) {}

  generateText(prompt: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.CHAT_KEY ?? process.env['CHAT_KEY']}`,
    };

    const data = {
      prompt: prompt,
      model: 'text-davinci-003',
      max_tokens: 50, // Adjust this value based on the desired response length
      temperature: 1,
    };

    return this.http.post<any>(this.apiUrl, data, { headers: headers });
  }
}