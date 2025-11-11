import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { JSX } from "react";

export type ChangeStatus = 'increase' | 'decrease' | 'same' | null;

const DANGER_COLOR = 'text-red-600';
const PRIMARY_COLOR_TEXT = 'text-[color:var(--color-primary)]';

export function limitLeadingDigits(value: number, digits: number = 4): string {
    if (!isFinite(value)) return String(value);
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);

    const intPart = Math.floor(abs).toString();
    if (intPart.length >= digits) {
        return sign + intPart.slice(0, digits);
    }

    const remaining = digits - intPart.length;
    let out = abs.toFixed(remaining);
    out = out.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/u, "");

    if (out.replace(/[^0-9]/g, "").length > digits) {
        out = out.slice(0, digits + (out.includes('.') ? 1 : 0));
        if (out.endsWith('.')) out = out.slice(0, -1);
    }

    return sign + out;
}

export function getChangeIcon(status: ChangeStatus): JSX.Element {
    const defaultClasses = "h-4 w-4 mr-2";
    switch (status) {
        case 'increase':
            return <TrendingUp className={`${defaultClasses} ${DANGER_COLOR}`} />;
        case 'decrease':
            return <TrendingDown className={`${defaultClasses} text-emerald-600`} />;
        case 'same':
        default:
            return <Minus className={`${defaultClasses} text-gray-500`} />;
    }
}

export function getChangeTextColor(status: ChangeStatus): string {
    switch (status) {
        case 'increase':
            return DANGER_COLOR;
        case 'decrease':
            return PRIMARY_COLOR_TEXT;
        default:
            return "text-gray-600";
    }
}