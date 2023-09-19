import { DialogHTMLAttributes } from "react";

declare global {
    interface Window {
        safeAreaInsets?: {
            top: number;
            left: number;
            bottom: number;
            right: number;
        };
        payment_plans_modal?: DialogHTMLAttributes;
        text_prompt_editor_modal?: DialogHTMLAttributes;
    }
}