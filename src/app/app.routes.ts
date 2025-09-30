import { Routes } from '@angular/router';
import { Semana8Component } from './semana8/semana8';

export const routes: Routes = [
    {
        path: 'semana8',
        component: Semana8Component
    },
    {
        path: '',
        redirectTo: 'semana8',
        pathMatch: 'full'
    }
];