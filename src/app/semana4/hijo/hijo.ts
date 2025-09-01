import { Component, Input } from '@angular/core';

@Component({
  selector: 'hijo',
  standalone: true,
  templateUrl: './hijo.html',
  styleUrl: './hijo.css'
})
export class HijoComponent {
  @Input() mensaje: string = '';
}
