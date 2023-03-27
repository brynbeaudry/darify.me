import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Gpt3Service {
  private apiUrl = 'https://api.openai.com/v1/completions';
  private xyN6 = 'c2stQUl2OVJ2TkxNNjFHYW10WWxFa2xUM0JsYmtGSkE5czlWTE5CVEhuRW5yVXBQa3BCCg=='

  constructor(private http: HttpClient) { }

  generateText(prompt: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.atob(this.xyN6)}`,
    };

    const data = {
      prompt: prompt,
      model: 'text-davinci-003',
      max_tokens: 1000, // Adjust this value based on the desired response length
      temperature: 1,
    };

    return this.http.post<any>(this.apiUrl, data, { headers: headers });
  }
}