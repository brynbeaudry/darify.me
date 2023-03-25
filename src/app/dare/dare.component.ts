import { Component, OnInit, ElementRef } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { KNOWN_DARES_LIST } from '../dare-list/constants';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, interval, observable, switchMap, takeUntil, tap } from 'rxjs';


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
export class DareComponent implements OnInit {

  constructor(private route: ActivatedRoute, private elementRef: ElementRef, private storageService: Storage, private http: HttpClient) { }
  private dare: any;
  private storage: Storage | null = null;
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

  async ngOnInit() {
    AWS.config.update({
      accessKeyId: 'AKIAYDE77D5UNTLJVM5C',
      secretAccessKey: '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',
      region: 'us-east-1'
    });
    this.storage = await this.storageService.create();

    const dareKey = this.route.snapshot.params['key'];

    if (dareKey === 'random') {
      this.dare = KNOWN_DARES_LIST[Math.floor(Math.random() * KNOWN_DARES_LIST.length)];
    } else {
      this.dare = KNOWN_DARES_LIST.find(element => element['key'] === dareKey) ?? {}
    }

    this.title = this.dare.keyPrompt
    this.username = await this.storage?.get('USERNAME') ?? '';
    // Initilize the user
    if (!this.username) {
      this.username = await this.promptDialog('Enter a username', 'Your Name')
      await this.storage?.set('USERNAME', this.username);
    }
  }

  async onButtonClick(event: any) {
    event.preventDefault();

    const uuid = uuidv4();
    const s3 = new AWS.S3();
    const videoElement = this.elementRef.nativeElement.querySelector('video');
    const maxDuration = 10; // seconds  

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videoElement.srcObject = stream;
    videoElement.play();

    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, maxDuration * 1000);
    });

    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach((track: any) => track.stop());

    const response = await fetch(videoElement.srcObject);
    const blob = await response.blob();

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

    const s3Resp = s3.upload(params).promise();

    interval(2000).pipe(
      switchMap(() => this.http.get(`${DARE_AWS_URL}/${uuid}`))
    ).subscribe((data : any) => {
      console.log(data);
      if (data.hasOwnProperty('result')) {
        if (data.result === true){
          alert('Congratulations!!!!')
        } else {
          alert('OOO Maybe next time')
        }
      }
    });

  }
}
