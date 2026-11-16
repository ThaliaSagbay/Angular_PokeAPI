
import { Component } from '@angular/core';
import { TournamentComponent } from './components/tournament/tournament';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TournamentComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
