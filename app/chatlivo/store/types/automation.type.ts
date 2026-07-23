export type ConditionType =
  | "text_equals"
  | "text_contains"
  | "text_starts_with"
  | "text_ends_with"
  | "number_equals"
  | "number_gt"
  | "number_lt"
  | "number_between";

export type ConditionConfig = {
    id: string;
    title: string;
    type: string;
    isOpen: boolean;
    value?: string;
  };

export interface AutomationNode {
  id: number;
  automation_id: number;
  node_id: string;
  node_type: string;
  label: string;
  position_x: number;
  position_y: number;
  config: any;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationEdge {
  id: number;
  automation_id: number;
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle: string | null;
  target_handle: string | null;
  label: string;
  edge_type: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface Automation {
  id: number;
  organization_id: number;
  name: string;
  description: string;
  is_active: boolean;
  trigger_type: "manual" | "on_chat_start" | "on_message" | "scheduled" | "chat_start";
  metadata: any;
  createdAt: string;
  updatedAt: string;
  nodes?: AutomationNode[];
  edges?: AutomationEdge[];
}
