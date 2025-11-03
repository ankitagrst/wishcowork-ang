import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './faq.component.html'
})
export class FaqComponent {
  faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is WishCowork?',
          answer: 'WishCowork is a premium workspace solutions provider offering flexible coworking spaces, private offices, virtual offices, and meeting rooms across major cities in India.',
          open: false
        },
        {
          question: 'How do I book a workspace?',
          answer: 'You can book a workspace through our website, mobile app, or by visiting any of our locations. Our team will help you choose the perfect solution for your needs.',
          open: false
        },
        {
          question: 'What are your operating hours?',
          answer: 'Most of our locations offer 24/7 access. However, front desk services are typically available from 9 AM to 6 PM on weekdays.',
          open: false
        }
      ]
    },
    {
      category: 'Pricing & Plans',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept cash, credit cards, debit cards, bank transfers, and digital payments including UPI, PhonePe, and Paytm.',
          open: false
        },
        {
          question: 'Are there any setup fees?',
          answer: 'No, we don\'t charge any setup fees. You only pay for the workspace solution you choose.',
          open: false
        },
        {
          question: 'Can I upgrade or downgrade my plan?',
          answer: 'Yes, you can upgrade or downgrade your plan anytime. Changes will be reflected in your next billing cycle.',
          open: false
        }
      ]
    },
    {
      category: 'Amenities & Services',
      questions: [
        {
          question: 'What amenities are included?',
          answer: 'Our workspaces include high-speed WiFi, printing services, meeting rooms, complimentary tea/coffee, reception services, and mail handling.',
          open: false
        },
        {
          question: 'Do you provide parking facilities?',
          answer: 'Yes, most of our locations offer parking facilities. Please check with the specific location for availability and charges.',
          open: false
        },
        {
          question: 'Can I bring guests to the workspace?',
          answer: 'Yes, you can bring guests. Some plans include guest passes, while others may have additional charges for guest access.',
          open: false
        }
      ]
    }
  ];

  toggleFaq(categoryIndex: number, questionIndex: number) {
    this.faqs[categoryIndex].questions[questionIndex].open = 
      !this.faqs[categoryIndex].questions[questionIndex].open;
  }
}