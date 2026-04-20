// Default templates loaded when a new project is created.

export type Phase =
  | "Initiation"
  | "Planning"
  | "Creative"
  | "Procurement"
  | "Execution Prep"
  | "Activation"
  | "Post-Activation";

export const PHASES: Phase[] = [
  "Initiation",
  "Planning",
  "Creative",
  "Procurement",
  "Execution Prep",
  "Activation",
  "Post-Activation",
];

export type TaskTemplate = {
  task_code: string;
  name: string;
  phase: Phase;
  owner: string;
  start_day: number; // day from project start (1-based)
  duration_days: number;
  priority: "High" | "Medium" | "Low";
  critical_path: boolean;
  is_milestone: boolean;
};

// Helper: week N starts on day (N-1)*7 + 1
const w = (n: number) => (n - 1) * 7 + 1;

export const TASK_TEMPLATE: TaskTemplate[] = [
  // Phase 1 — Initiation
  { task_code: "1.1", name: "Receive Activation Brief", phase: "Initiation", owner: "PM", start_day: 1, duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "1.2", name: "Brief Review & Clarification", phase: "Initiation", owner: "PM + Marketing", start_day: 2, duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "1.3", name: "Stakeholder Alignment Meeting", phase: "Initiation", owner: "All", start_day: 4, duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "1.4", name: "Project Charter Sign-off", phase: "Initiation", owner: "PM", start_day: 5, duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "M1", name: "MILESTONE: Kickoff Complete", phase: "Initiation", owner: "PM", start_day: 7, duration_days: 0, priority: "High", critical_path: true, is_milestone: true },

  // Phase 2 — Planning
  { task_code: "2.1", name: "Venue / Site Identification", phase: "Planning", owner: "Executor", start_day: w(2), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "2.2", name: "Audience & Market Research", phase: "Planning", owner: "Marketing", start_day: w(2), duration_days: 3, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "2.3", name: "Budget Breakdown & Approval", phase: "Planning", owner: "PM", start_day: w(2), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "2.4", name: "Activation Concept Development", phase: "Planning", owner: "Marketing + Executor", start_day: w(2), duration_days: 4, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "2.5", name: "Supplier & Vendor Identification", phase: "Planning", owner: "Executor", start_day: w(2), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "2.6", name: "Regulatory & Permit Assessment", phase: "Planning", owner: "PM + Executor", start_day: w(2), duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "M2", name: "MILESTONE: Planning Approved", phase: "Planning", owner: "PM", start_day: w(3), duration_days: 0, priority: "High", critical_path: true, is_milestone: true },

  // Phase 3 — Creative
  { task_code: "3.1", name: "Creative Brief to Agency", phase: "Creative", owner: "Marketing", start_day: w(3), duration_days: 2, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "3.2", name: "Creative Concept Presentation", phase: "Creative", owner: "Marketing", start_day: w(3), duration_days: 3, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "3.3", name: "Creative Sign-off", phase: "Creative", owner: "PM + Client", start_day: w(4), duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "3.4", name: "Asset Production", phase: "Creative", owner: "Marketing + Executor", start_day: w(4), duration_days: 5, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "3.5", name: "Experiential Journey Design", phase: "Creative", owner: "Marketing + Executor", start_day: w(4), duration_days: 3, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "M3", name: "MILESTONE: Design Approved", phase: "Creative", owner: "PM + Client", start_day: w(5), duration_days: 0, priority: "High", critical_path: true, is_milestone: true },

  // Phase 4 — Procurement
  { task_code: "4.1", name: "Venue Booking & Contract", phase: "Procurement", owner: "PM + Executor", start_day: w(3), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "4.2", name: "Permit Applications", phase: "Procurement", owner: "Executor", start_day: w(3), duration_days: 10, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "4.3", name: "Supplier Confirmation & Contracts", phase: "Procurement", owner: "PM + Executor", start_day: w(3), duration_days: 5, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "4.4", name: "Staffing Plan & Recruitment", phase: "Procurement", owner: "Executor", start_day: w(3), duration_days: 5, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "4.5", name: "Equipment & Materials Order", phase: "Procurement", owner: "Executor", start_day: w(4), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "4.6", name: "Transport & Logistics Plan", phase: "Procurement", owner: "Executor", start_day: w(4), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "4.7", name: "POPIA Data Capture Compliance", phase: "Procurement", owner: "PM + Marketing", start_day: w(4), duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "M4", name: "MILESTONE: Procurement Locked", phase: "Procurement", owner: "PM", start_day: w(5), duration_days: 0, priority: "High", critical_path: true, is_milestone: true },

  // Phase 5 — Execution Prep
  { task_code: "5.1", name: "Run-of-Show Document", phase: "Execution Prep", owner: "PM + Executor", start_day: w(6), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "5.2", name: "Staff Briefing & Training", phase: "Execution Prep", owner: "Executor + Marketing", start_day: w(6), duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "5.3", name: "Pre-production Site Visit", phase: "Execution Prep", owner: "PM + Executor", start_day: w(6), duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "5.4", name: "Tech & Digital Setup", phase: "Execution Prep", owner: "Marketing + Executor", start_day: w(7), duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "5.5", name: "Mock Activation / Dry Run", phase: "Execution Prep", owner: "PM + Executor", start_day: w(7), duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "5.6", name: "Final Permit Confirmation", phase: "Execution Prep", owner: "PM", start_day: w(7), duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "5.7", name: "Pre-event Stakeholder Update", phase: "Execution Prep", owner: "PM", start_day: w(7), duration_days: 1, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "M5", name: "MILESTONE: Ready for Activation", phase: "Execution Prep", owner: "PM", start_day: w(8), duration_days: 0, priority: "High", critical_path: true, is_milestone: true },

  // Phase 6 — Activation (Event Day = Week 8, day 56)
  { task_code: "6.1", name: "Load-in & Setup", phase: "Activation", owner: "Executor", start_day: w(8), duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "6.2", name: "Final Walk-through & Sign-off", phase: "Activation", owner: "PM + Executor", start_day: w(8) + 1, duration_days: 0.5, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "6.3", name: "ACTIVATION — EVENT DAY", phase: "Activation", owner: "All", start_day: w(8) + 1, duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "6.4", name: "Real-time Monitoring", phase: "Activation", owner: "PM", start_day: w(8) + 1, duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "6.5", name: "Live Social Media Coverage", phase: "Activation", owner: "Marketing", start_day: w(8) + 1, duration_days: 1, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "6.6", name: "Data Capture & Lead Collection", phase: "Activation", owner: "Executor + Marketing", start_day: w(8) + 1, duration_days: 1, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "6.7", name: "Load-out & Site Clearance", phase: "Activation", owner: "Executor", start_day: w(8) + 2, duration_days: 0.5, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "M6", name: "MILESTONE: Activation Complete", phase: "Activation", owner: "PM", start_day: w(8) + 2, duration_days: 0, priority: "High", critical_path: true, is_milestone: true },

  // Phase 7 — Post-Activation
  { task_code: "7.1", name: "Data Consolidation & Cleaning", phase: "Post-Activation", owner: "Marketing", start_day: w(9), duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "7.2", name: "Staff Debrief", phase: "Post-Activation", owner: "PM + Executor", start_day: w(9), duration_days: 1, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "7.3", name: "Post-activation Social Content", phase: "Post-Activation", owner: "Marketing", start_day: w(9), duration_days: 3, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "7.4", name: "Supplier Invoice Reconciliation", phase: "Post-Activation", owner: "PM", start_day: w(9), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "7.5", name: "KPI Measurement & Reporting", phase: "Post-Activation", owner: "Marketing + PM", start_day: w(10), duration_days: 3, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "7.6", name: "Client Report & Presentation", phase: "Post-Activation", owner: "PM + Marketing", start_day: w(10), duration_days: 3, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "7.7", name: "Budget Final Reconciliation", phase: "Post-Activation", owner: "PM", start_day: w(10), duration_days: 2, priority: "High", critical_path: true, is_milestone: false },
  { task_code: "7.8", name: "Lessons Learned Document", phase: "Post-Activation", owner: "All", start_day: w(11), duration_days: 2, priority: "Medium", critical_path: false, is_milestone: false },
  { task_code: "M7", name: "MILESTONE: Project Closed", phase: "Post-Activation", owner: "PM + Client", start_day: w(11) + 2, duration_days: 0, priority: "High", critical_path: true, is_milestone: true },
];

export type MilestoneTemplate = {
  code: string;
  name: string;
  phase: string;
  target_week: number | null;
  sign_off: string;
};

export const MILESTONE_TEMPLATE: MilestoneTemplate[] = [
  { code: "M1", name: "Kickoff Complete", phase: "Initiation", target_week: 1, sign_off: "PM + Client" },
  { code: "M2", name: "Charter Signed", phase: "Initiation", target_week: 1, sign_off: "PM + Client + Executor" },
  { code: "M3", name: "Planning & Budget Approved", phase: "Planning", target_week: 3, sign_off: "PM + Finance + Client" },
  { code: "M4", name: "Creative Assets Approved", phase: "Creative", target_week: 5, sign_off: "PM + Marketing + Client" },
  { code: "M5", name: "Procurement Locked", phase: "Procurement", target_week: 5, sign_off: "PM + Executor" },
  { code: "M6", name: "All Permits Confirmed", phase: "Procurement", target_week: 7, sign_off: "PM" },
  { code: "M7", name: "Dry Run Complete / Go-No-Go", phase: "Execution Prep", target_week: 8, sign_off: "PM + Executor + Client" },
  { code: "M8", name: "Activation Day — Event Live", phase: "Activation", target_week: 8, sign_off: "All Roles" },
  { code: "M9", name: "Activation Complete & Site Cleared", phase: "Activation", target_week: 8, sign_off: "PM + Executor" },
  { code: "M10", name: "KPI Report Delivered", phase: "Post-Activation", target_week: 10, sign_off: "PM + Marketing" },
  { code: "M11", name: "Budget Closed", phase: "Post-Activation", target_week: 10, sign_off: "PM + Finance" },
  { code: "M12", name: "Project Formally Closed", phase: "Post-Activation", target_week: 11, sign_off: "PM + Client" },
];

export type RiskTemplate = {
  risk_number: number;
  description: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  rating: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  mitigation: string;
};

export const RISK_TEMPLATE: RiskTemplate[] = [
  { risk_number: 1, description: "Permit delays", likelihood: "High", impact: "High", rating: "CRITICAL", mitigation: "Submit applications early; have backup venues identified." },
  { risk_number: 2, description: "Supplier cancellation", likelihood: "High", impact: "High", rating: "CRITICAL", mitigation: "Maintain a vetted backup supplier list; confirm in writing 14 days out." },
  { risk_number: 3, description: "Last-minute brief changes", likelihood: "High", impact: "Medium", rating: "HIGH", mitigation: "Lock scope at charter sign-off; require written change requests." },
  { risk_number: 4, description: "Poor consumer turnout", likelihood: "Medium", impact: "High", rating: "HIGH", mitigation: "Drive pre-event marketing; partner with local influencers." },
  { risk_number: 5, description: "POPIA non-compliance", likelihood: "Medium", impact: "High", rating: "HIGH", mitigation: "Audit data capture flow; train staff on consent requirements." },
  { risk_number: 6, description: "Staff no-shows on event day", likelihood: "High", impact: "High", rating: "CRITICAL", mitigation: "Over-recruit by 20%; confirm attendance 48h prior." },
  { risk_number: 7, description: "Weather / force majeure", likelihood: "Medium", impact: "High", rating: "HIGH", mitigation: "Wet-weather contingency plan; insurance coverage." },
  { risk_number: 8, description: "Budget overrun", likelihood: "Medium", impact: "High", rating: "HIGH", mitigation: "Weekly budget tracker; 10% contingency reserve." },
  { risk_number: 9, description: "Tech/device failure", likelihood: "Medium", impact: "High", rating: "HIGH", mitigation: "Backup devices on site; tested at dry run." },
  { risk_number: 10, description: "Weak post-event reporting", likelihood: "Medium", impact: "Medium", rating: "MEDIUM", mitigation: "Define KPIs upfront; assign reporting owner at kickoff." },
  { risk_number: 11, description: "Social content not approved", likelihood: "Medium", impact: "Medium", rating: "MEDIUM", mitigation: "Pre-approve content templates; assign on-site approver." },
  { risk_number: 12, description: "Venue access/setup delays", likelihood: "Low", impact: "High", rating: "MEDIUM", mitigation: "Confirm load-in window in venue contract." },
];
