export interface IRole {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  for_organization: boolean;
}

export interface IUser {
  id: string;
  created_at: string;
  updated_at: string;
  activated_at: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  birthday: string | null;
  roles: IRole[];
  assets: IAsset[];
}

export type IAssetUsage =
  | "avatar"
  | "event_logo"
  | "event_banner"
  | "ticket_logo"
  | "event_featured_image";

export interface IAsset {
  id: string;
  created_at: string;
  updated_at: string;
  signature: string;
  public_id: string;
  original_url: string;
  secure_url: string;
  usage: IAssetUsage;
  format: string;
  resource_type: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  etag: string;
}

export interface IOrganization {
  id: string;
  created_at: string;
  updated_at: string;
  user_organizations: IUserOrganization[];
  name: string;
  phone?: string | null;
  website?: string | null;
  email?: string | null;
  description: string;
  assets: IAsset[];
  paypal_account: string;
}

export interface IUserOrganization {
  user_id: string;
  organization_id: string;
  user: IUser;
  created_at: string;
  updated_at: string;
  role: IRole;
  role_id: number;
}

export interface ICategory {
  id: number;
  created_at: string;
  updated_at: string;
  slug: string;
  name_en: string;
  name_vi: string;
}

export type IEventStatus = "draft" | "archived" | "published";

export interface IEvent {
  id: string;
  organization_id: string;
  organization: IOrganization;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  address: string;
  place: string;
  start_time: string;
  end_time: string;
  categories: ICategory[];
  keywords: IKeyword[];
  assets: IAsset[];
  shows: IEventShow[];
  status: IEventStatus;
  published_at?: string | null;
}

export interface IKeyword {
  id: number;
  created_at: string;
  updated_at: string;
  name_en: string;
  name_vi: string;
}

export interface IEventShow {
  id: number;
  created_at: string;
  updated_at: string;
  event_id: string;
  start_time: string;
  end_time: string;
  tickets: ITicket[];
}

export interface ITicket {
  id: number;
  created_at: string;
  updated_at: string;
  event_show_id: number;
  name: string;
  description?: string | null;
  price: number;
  sale_start_time: string;
  sale_end_time: string;
  assets: IAsset[];
  available: boolean;
  initial_stock: number;
  stock: number;
}

export type IOrderStatus = "pending" | "canceled" | "processing" | "fulfilled";
export interface IOrder {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  user: IUser;
  items: ITicketItem[];
  status: IOrderStatus;
  payments: IPayment[];
  place_total: number;
}

export interface ITicketItem {
  created_at: string;
  updated_at: string;
  order_id: number;
  ticket_id: number;
  ticket: ITicket;
  quantity: number;
  place_total: number;
  traces: ITicketItemTrace[];
}

export type ITicketItemTraceEvent = "checked-in" | "went-out";

export interface ITicketItemTrace {
  created_at: string;
  ticket_item_order_id: number;
  ticket_item_ticket_id: number;
  id: number;
  event: ITicketItemTraceEvent;
  description?: string | null;
  issuer: IUser;
  issuer_id: string;
}

export interface IPayment {
  id: number;
  created_at: string;
  updated_at: string;
  order_id: number;
  paypal_order_id: string;
  payer_email: string;
  payer_given_name: string;
  payer_surname: string;
  payer_id: string;
  paypal_capture_id?: string | null;
  captured_at?: string | null;
  is_fulfilled: boolean;
  exchange_rate_source_currency?: string | null;
  exchange_rate_target_currency?: string | null;
  exchange_rate_value?: number | null;
  paypal_fee_value?: number | null;
  paypal_fee_currency?: string | null;
  gross_amount_value?: number | null;
  gross_amount_currency?: string | null;
  net_amount_value?: number | null;
  net_amount_currency?: string | null;
  receivable_amount?: number | null;
  receivable_amount_currency?: string | null;
}
export * from "./fetch";
