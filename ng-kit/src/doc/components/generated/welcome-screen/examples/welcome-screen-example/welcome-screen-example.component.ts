import { Component } from '@angular/core';

@Component({
  selector: 'doc-welcome-screen-example',
  templateUrl: 'welcome-screen-example.component.html',
  styleUrls: ['./welcome-screen-example.component.scss']
})
export class WelcomeScreenExampleDocComponent {
    welcomeScreenOpened: boolean = true;
    exampleTitle: string = 'Welcome to Connect';
    exampleMessage: string = 'Here you can add applications which will help you to grow up your Business.';

    onStart(): void {
        this.welcomeScreenOpened = false;
    }
}
