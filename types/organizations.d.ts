export type Organization = {
    id: number;
    name: string;
    metadata: {
        hypno?: boolean;
        hypno_pro?: {
            additional_users: number;
            api_access: boolean;
            base_users: number;
            cancel_at?: any;
            canon_connect: boolean;
            current_tier: string;
            custom_branding: boolean;
            custom_domain: boolean;
            custom_legal: boolean;
            data_capture: boolean;
            effects: boolean;
            filters: Array<string>;
            graphics: boolean;
            line_items: Array<any>;
            live_support: boolean;
            plan_item_id: any;
            plan_price_id: any;
            studio_services: boolean;
            subscription_id: any;
            unlimited_uploads: boolean;
            user_item_id: boolean;
        }
    };
}