export interface SafetySettings {
  max_driving_hours_per_day: number;
  max_on_duty_hours_per_day: number;
  max_driving_hours_per_7days: number;
  required_break_minutes_after_hours: number;

  in_cab_camera_installed: boolean;
  outward_camera_installed: boolean;

  fatigue_check_enabled: boolean;
  allow_ai_to_block_jobs_when_over_hours: boolean;
}

export interface SafetyState {
  settings: SafetySettings;
  today_driving_hours: number;
  today_on_duty_hours: number;
  last_break_minutes_ago: number;
}

export interface SafetyStatus {
  can_accept_more_driving: boolean;
  needs_break: boolean;
  cameras_compliant: boolean;
}
