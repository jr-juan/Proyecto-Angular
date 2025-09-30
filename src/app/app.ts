import { Component } from '@angular/core';
import { Semana8Component } from './semana8/semana8';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Semana8Component],
  template: `<app-semana8></app-semana8>`,
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Dark-Mode';
}