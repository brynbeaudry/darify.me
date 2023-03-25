import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { KNOWN_DARES_LIST } from '../dare-list/constants';
import { firstValueFrom, interval, observable, takeUntil, tap } from 'rxjs';


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

  constructor(private route: ActivatedRoute, private elementRef: ElementRef) { }
  private dare: any;
  title = ''
  username!: string;
  countDownValue = 0;
  

  promptDialog(message: string, defaultValue: string) : Promise<string> {
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
    const dareKey = this.route.snapshot.params['key'];

    if (dareKey === 'random') {
      this.dare = KNOWN_DARES_LIST[Math.floor(Math.random() * KNOWN_DARES_LIST.length)];
    } else {
      this.dare = KNOWN_DARES_LIST.find(element => element['key'] === dareKey) ?? {}
    }

    this.title = this.dare.keyPrompt

    // Initilize the user
    this.username = await this.promptDialog('Enter a username', 'Your Name')
    
  }

  async onButtonClick(event: any){
    event.preventDefault();

    const uuid = uuidv4();
    const s3 = new AWS.S3();
    const videoElement = this.elementRef.nativeElement.querySelector('video');
    const maxDuration = 10; // seconds  

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then( stream => {
        videoElement.srcObject = stream;
        videoElement.play();

        return new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, maxDuration * 1000);
        });
      })
      .then(() => {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach((track : any) => track.stop());

        return fetch(videoElement.srcObject)
          .then(response => response.blob());
      })
      .then(blob => {
        const params = {
          Bucket: 'dareme-video-store-dev',
          Key: uuid,
          Body: blob,
          ContentType: 'video/mp4'
        };

        return s3.upload(params).promise();
      })
      .then(data => {
        console.log(`Video uploaded to: ${data.Location}`);
      })
      .catch(error => {
        console.error(error);
      });
  }
}
