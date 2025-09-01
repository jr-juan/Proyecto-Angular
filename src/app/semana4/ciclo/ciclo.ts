import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'ciclo',
  standalone: true,
  templateUrl: './ciclo.html',
  styleUrl: './ciclo.css'
})
export class CicloComponent implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('CicloComponent ha sido inicializado');
  }

  ngOnDestroy() {
    console.log('CicloComponent ha sido destruido');
  }
}
