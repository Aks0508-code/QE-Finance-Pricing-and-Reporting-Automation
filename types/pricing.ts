export type PricingLifecycleStatus = 'A' | 'R' | 'P' | 'H';

export interface PricingEvidence {
  environment: string;
  entityType: string;
  entityKey: string;
  expectedSource?: string;
  expectedValue?: string;
  actualValue?: string;
  difference?: string;
  persisted?: boolean;
}