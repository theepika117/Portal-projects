import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  greeting: string = '';
  private greetingInterval: any;

  ngOnInit(): void {
    this.setGreeting();
    // Update greeting every hour to handle long sessions
    this.greetingInterval = setInterval(() => {
      this.setGreeting();
    }, 3600000); // 1 hour
  }

  ngOnDestroy(): void {
    if (this.greetingInterval) {
      clearInterval(this.greetingInterval);
    }
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    let greetings: string[] = [];

    if (hour < 12) {
      // Morning greetings
      greetings = [
        "Good Morning – A new day, a clear mind. Take a deep breath, stretch, and let's get started.",
        "Good Morning – Fuel your morning with a healthy breakfast — your brain will thank you.",
        "Good Morning – Water before coffee; clarity before chaos. Let's go.",
        "Good Morning – Your mind works best when your body moves — even a 5-minute stretch counts."
      ];
    } else if (hour < 17) {
      // Afternoon greetings
      greetings = [
        "Good Afternoon – Time for a quick walk — a healthy body keeps ideas moving.",
        "Good Afternoon – Keep your focus sharp; hydrate and take short movement breaks.",
        "Good Afternoon – Step away from your desk for a few minutes — your posture will love you.",
        "Good Afternoon – Recharge with a nutritious snack; fuel your afternoon power."
      ];
    } else {
      // Evening greetings
      greetings = [
        "Good Evening – You've worked hard; now move, stretch, or walk it out.",
        "Good Evening - Another day well done. Time to log off, recharge, and let tomorrow's ideas simmer.",
        "Good Evening – Even 15 minutes of exercise can turn a long day into a great one.",
        "Good Evening – Unplug from the screen and plug into your well-being."
      ];
    }

    // Select random greeting
    this.greeting = greetings[Math.floor(Math.random() * greetings.length)];
  }
}
