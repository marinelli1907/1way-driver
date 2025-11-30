import type { Job, AutomationPreferences } from '@/types';
import { scheduleUnoActionNotification } from './notifications';

export interface UnoDecision {
  action: 'accept' | 'bid' | 'decline';
  confidence: number;
  reasons: string[];
  bidAmount?: number;
}

export class UnoBot {
  private preferences: AutomationPreferences;
  private name = 'Uno';

  constructor(preferences: AutomationPreferences) {
    this.preferences = preferences;
  }

  updatePreferences(preferences: AutomationPreferences) {
    this.preferences = preferences;
  }

  evaluateJob(job: Job): UnoDecision {
    const reasons: string[] = [];
    let score = 100;

    if (!this.preferences.enabled) {
      return {
        action: 'decline',
        confidence: 100,
        reasons: ['Uno is currently disabled'],
      };
    }

    if (job.driverShare < this.preferences.minPayout) {
      score -= 40;
      reasons.push(`Payout ($${job.driverShare}) below minimum ($${this.preferences.minPayout})`);
    }

    if (job.distance > this.preferences.maxDistance) {
      score -= 50;
      reasons.push(`Distance (${job.distance}mi) exceeds maximum (${this.preferences.maxDistance}mi)`);
    }

    const pickupDate = new Date(job.pickupTime);
    const pickupHour = pickupDate.getHours();
    const pickupDay = pickupDate.getDay();
    const pickupDateStr = pickupDate.toISOString().split('T')[0];

    const dayOff = this.preferences.daysOff.find(d => d.date === pickupDateStr);
    if (dayOff) {
      score -= 100;
      reasons.push(`Scheduled day off${dayOff.reason ? `: ${dayOff.reason}` : ''}`);
    }

    const workingHours = this.preferences.workingHours.find(w => w.dayOfWeek === pickupDay);
    if (!workingHours) {
      score -= 80;
      reasons.push('Not scheduled to work this day');
    } else {
      const startHour = parseInt(workingHours.startTime.split(':')[0], 10);
      const endHour = parseInt(workingHours.endTime.split(':')[0], 10);

      if (pickupHour < startHour || pickupHour >= endHour) {
        score -= 70;
        reasons.push(`Outside working hours (${workingHours.startTime} - ${workingHours.endTime})`);
      }
    }

    if (job.driverShare > this.preferences.minPayout * 1.5) {
      score += 20;
      reasons.push('High payout premium');
    }

    if (job.distance <= this.preferences.maxDistance * 0.6) {
      score += 15;
      reasons.push('Short distance bonus');
    }

    const hoursSinceListed = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceListed > 1) {
      score += 10;
      reasons.push('Job has been available for a while');
    }

    if (score >= 80 && this.preferences.autoAccept) {
      return {
        action: 'accept',
        confidence: Math.min(score, 100),
        reasons: ['✅ Excellent match for your criteria', ...reasons],
      };
    }

    if (score >= 50 && this.preferences.autoBid) {
      const bidAmount = this.calculateBidAmount(job);
      return {
        action: 'bid',
        confidence: score,
        reasons: ['💰 Good opportunity for bidding', ...reasons],
        bidAmount,
      };
    }

    return {
      action: 'decline',
      confidence: 100 - score,
      reasons: ['❌ Does not meet criteria', ...reasons],
    };
  }

  private calculateBidAmount(job: Job): number {
    const baseAmount = job.driverShare;
    const confidence = this.evaluateJob(job).confidence;
    
    if (confidence >= 80) {
      return baseAmount * 0.95;
    } else if (confidence >= 60) {
      return baseAmount * 0.90;
    } else {
      return baseAmount * 0.85;
    }
  }

  async processNewJob(job: Job, onAction: (job: Job, decision: UnoDecision) => Promise<void>) {
    console.log(`[${this.name}] Evaluating job ${job.id}...`);
    
    const decision = this.evaluateJob(job);
    
    console.log(`[${this.name}] Decision: ${decision.action.toUpperCase()}`);
    console.log(`[${this.name}] Confidence: ${decision.confidence}%`);
    console.log(`[${this.name}] Reasons:`, decision.reasons);

    if (decision.action === 'accept' || decision.action === 'bid') {
      await scheduleUnoActionNotification(
        decision.action === 'accept' ? 'accepted' : 'bid',
        {
          id: job.id,
          pickupAddress: job.pickupLocation.address,
          payout: job.driverShare,
        }
      );
      
      await onAction(job, decision);
    } else {
      console.log(`[${this.name}] Job ${job.id} declined`);
    }

    return decision;
  }

  async processBatch(
    jobs: Job[],
    onAction: (job: Job, decision: UnoDecision) => Promise<void>
  ): Promise<UnoDecision[]> {
    const decisions: UnoDecision[] = [];

    for (const job of jobs) {
      const decision = await this.processNewJob(job, onAction);
      decisions.push(decision);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return decisions;
  }

  getSummary(decisions: UnoDecision[]): {
    accepted: number;
    bid: number;
    declined: number;
  } {
    return {
      accepted: decisions.filter(d => d.action === 'accept').length,
      bid: decisions.filter(d => d.action === 'bid').length,
      declined: decisions.filter(d => d.action === 'decline').length,
    };
  }
}
