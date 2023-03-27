import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { KNOWN_DARES_LIST } from '../dare-list/constants';
import { HttpClient } from '@angular/common/http';
import { Subscription, firstValueFrom, interval, observable, switchMap, takeUntil, tap } from 'rxjs';
import { Gpt3Service } from '../services/gpt3.service';


const DARE_AWS_URL = 'https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/dare'

@Component({
  selector: 'app-dare',
  templateUrl: './dare.component.html',
  styleUrls: ['./dare.component.scss'],
})
// data structure is key, keyPrompt, uuid, username, [acceptablePrompts includes keyPrompt]

/* Post to backend /dare a json blob of
uuid, username, prompt
Put object to s3 bucket dareme-video-store-dev with key = uuid
Poll /dare with get requests until the json has result in addition to uuid, username, and prompt */
export class DareComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private elementRef: ElementRef, private storageService: Storage, private http: HttpClient, private router: Router, private gpt3Service: Gpt3Service) { 

    const dareKey = this.route.snapshot.params['key'];
    this.dareKey = dareKey;
    console.log(`Dare key : ${dareKey}`)

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url === this.router.url) {
          // Perform the action you want when the route is reloaded.
          console.log('Route reloaded:', this.router.url);
          location.reload()
        }
      }
    });
  }
  private dare: any;
  private dareKey: any;
  private storage: Storage | null = null;
  private routerSubscription: Subscription;
  title = ''
  username?: string;
  countDownValue = 0;


  promptDialog(message: string, defaultValue: string): Promise<string> {
    return new Promise(function (resolve, reject) {
      let text = window.prompt(message, defaultValue);
      return text ? resolve(text) : reject('No Name');
    });
  }

  async countDown() {
    this.countDownValue = 3
    const observable = interval(1000)
      .pipe(
        takeUntil(interval(3000)),
        tap(x => {
          this.countDownValue -= 1;
          console.log(this.countDownValue)
        })
      )

    await firstValueFrom(observable)
    this.countDownValue = 0
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  async ngOnInit() {

    AWS.config.update({
      accessKeyId: 'AKIAYDE77D5UNTLJVM5C',
      secretAccessKey: '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',
      region: 'us-east-1'
    });
    this.storage = await this.storageService.create();

    if (this.dareKey === 'random') {
      this.dare = KNOWN_DARES_LIST[Math.floor(Math.random() * KNOWN_DARES_LIST.length)];
    } else {
      this.dare = KNOWN_DARES_LIST.find(element => element['key'] === this.dareKey) ?? {}
    }

    this.title = this.dare.keyPrompt
    this.username = await this.storage?.get('USERNAME') ?? '';
    // Initilize the user
    if (!this.username) {
      this.username = await this.promptDialog('Enter a username', 'Your Name')
      await this.storage?.set('USERNAME', this.username);
    }
  }

  async captureVideo(maxDuration : number) {
    return new Promise<Blob>(async (resolve) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const videoElement = this.elementRef.nativeElement.querySelector('video');
      videoElement.srcObject = stream;
      videoElement.play();
  
      const mediaRecorder = new MediaRecorder(stream);
      const chunks : any[]= [];
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
  
      mediaRecorder.start();
      console.log('Started recording');
  
      setTimeout(() => {
        mediaRecorder.stop();
        console.log('Stopped recording');
      }, maxDuration * 1000);
  
      mediaRecorder.onstop = () => {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach((track : any) => track.stop());
  
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Video Blob:', blob);
        resolve(blob);
      };
    });
  }

  async speak(text: string) {

    const waitForUtterance = (text:string) => {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        // Set the voice and other properties (optional)
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.onend = resolve;
        utterance.onerror = reject;
        speechSynthesis.speak(utterance);
      });
    }

    if ('speechSynthesis' in window) {
      const sentences = text.split('.')
      for (const s of sentences) {
        // Speak the text
        await waitForUtterance(s)
        console.log('Uttering one sentence')
      }
    } else {
      console.error('Speech synthesis is not supported in this browser.');
      alert(text)
    }
  };
  

  async onButtonClick(event: any) {
    event.preventDefault();

    const uuid = uuidv4();
    const s3 = new AWS.S3();
    const maxDuration = 10; // seconds  

    
    const blob = await this.captureVideo(maxDuration)

    const requestBody = {
      "uuid": uuid,
      "username": this.username ?? '',
      "prompt": this.dare.acceptableTokens,
      "result": ""
    }

    try {
      const response = await firstValueFrom(this.http.post(DARE_AWS_URL, requestBody));
      console.log('Response from server:', response);
    } catch (error) {
      console.error('Error occurred:', error);
    }

    const params = {
      Bucket: 'dareme-video-store-dev',
      Key: uuid,
      Body: blob,
      ContentType: 'video/mp4'
    };

    console.log(`Blob : ${blob}`)

    const s3Resp = await s3.upload(params).promise();

    const polling = interval(2000).pipe(
      switchMap(() => this.http.get(`${DARE_AWS_URL}/${uuid}`))
    ).subscribe(async (data : any) => {
      console.log(data);
      const result = data["Item"]["result"]["S"]
      console.log(result)
      if (result === "true" || result === "false") {
        let response;
        let prompt = ''
        let speech = ''
        if (result === 'true'){
          prompt = `Give me a really long, sarcastic compliment for ${this.username} for being really good at the following task: ${this.dare.keyPrompt}`
          response = await firstValueFrom(this.gpt3Service.generateText(prompt))
          console.log(response)
          speech = response.choices[0].text.trim()
          this.speak(speech)

          //alert('Congratulations!!!!')
        } else {
          //alert('OOO Maybe next time')
          prompt = `Give me a really long sarcastic condolence for ${this.username} for not having been able to complete the following task : ${this.dare.keyPrompt}`
          response = await firstValueFrom(this.gpt3Service.generateText(prompt))
          console.log(response)
          speech = response.choices[0].text.trim()
          this.speak(speech)
        }
        polling.unsubscribe()
      }
    });

  }
}
