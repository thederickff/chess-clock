import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  clock1: { value: string, loser?: boolean };
  clock2: { value: string, loser?: boolean };
  intervalId: any;
  turn: 'none' | 'one' | 'two' = 'none';
  gameOver = false;
  sound: HTMLAudioElement = new Audio();
  switcherSound: HTMLAudioElement = new Audio();

  constructor(
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.startGame();

    this.updateGame();
    this.intervalId = setInterval(() => {
      this.updateGame();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateGame() {
    if (this.turn === 'one') {
      this.tickClock(this.clock1);
    } else if (this.turn === 'two') {
      this.tickClock(this.clock2);
    }
  }
  
  startGame() {
    if (!localStorage.getItem('minutes')) {
      localStorage.setItem('minutes', '05:00');
    }

    const minutes = localStorage.getItem('minutes');
    this.clock1 = { value: minutes };
    this.clock2 = { value: minutes };
  }

  pauseGame() {
    this.turn = 'none';
    this.stopSfx();
  }

  async restartGame() {
    this.pauseGame();
    const alert = await this.alertCtrl.create({
      header: 'Reiniciar o jogo',
      message: 'Tem certeza disso?',
      buttons: [
        {
          text: 'Não'
        },
        {
          text: 'Sim',
          handler: () => {
            this.startGame();
            this.turn = 'none';
            this.gameOver = false;
          }
        }
      ]
    });
    alert.present();
  }

  handleOne() {
    this.turn = 'two';
    this.playSfx();
  }
  
  handleTwo() {
    this.turn = 'one';
    this.playSfx();
  }

  tickClock(clock: { value: string, loser?: boolean }) {
    const [oMinute, oSecond] = clock.value.split(':');
    const totalSeconds = (+oMinute * 60) + (+oSecond) - 1;

    if (totalSeconds >= 0) {
      const nMinute = Math.floor(totalSeconds / 60);
      clock.value = `${this.lpad(nMinute)}:${this.lpad(totalSeconds - (nMinute * 60))}`;
    }

    if (!totalSeconds) {
      clock.loser = true;
      this.gameOver = true;
      this.stopSfx();
    }
  }

  async displaySettings() {
    const alert = await this.alertCtrl.create({
      header: 'Configurações',
      inputs: [
        {
          type: 'text',
          placeholder: 'Tempo',
          value: localStorage.getItem('minutes')
        }
      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Salvar',
          handler: async inputs => {
            const value = inputs[0];
            
            if (value) {
              const items = value.split(':');
              
              if (
                items.length === 2 && items[0].length === 2 && items[1].length === 2 &&
                +items[0] >= 0 && +items[0] < 60 && 
                +items[1] >= 0 && +items[1] < 60
              ) {
                localStorage.setItem('minutes', inputs[0]);
                this.startGame();
                this.turn = 'none';
                this.gameOver = false;
                return;
              }
            }

            const message = await this.alertCtrl.create({
              header: 'Configurações',
              message: 'Campo Inválido!',
              buttons: ['Ok']
            });
            message.present();
          }
        }
      ]
    })
    alert.present();
  }

  private lpad(number: number) {
    return number < 10 ? `0${number}` : `${number}`;
  }

  private playSfx() {
    this.sound.src = '/assets/sfx/switcher.mp3';
    this.sound.loop = false;
    this.sound.play();

    setTimeout(() => {
      this.sound.src = '/assets/sfx/tick.mp3';
      this.sound.loop = true;
      this.sound.play();
    }, 500);
  }

  private stopSfx() {
    this.sound.src = '';
    
    setTimeout(() => {
      this.sound.src = '';
    }, 500)
  }
}
