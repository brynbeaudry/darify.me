import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Gpt3Service {
  private apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';
  private apiKey = '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';

  constructor(private http: HttpClient) {}

  generateText(prompt: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const data = {
      prompt: prompt,
      max_tokens: 50, // Adjust this value based on the desired response length
      n: 1,
      stop: null,
      temperature: 1,
    };

    return this.http.post<any>(this.apiUrl, data, { headers: headers });
  }
}