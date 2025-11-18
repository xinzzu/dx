import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { JSX } from "react";

export type ChangeStatus = 'increase' | 'decrease' | 'same' | null;

const DANGER_COLOR = 'text-red-600';
const PRIMARY_COLOR_TEXT = 'text-[color:var(--color-primary)]';
export interface FormattedCarbon {
    value: string;
    unit: string;
    shortUnit: string;
}

export function convertKgToTons(kg: number): number {
    return kg / 1000;
}

export function formatCarbonFootprint(kg: number): FormattedCarbon {

    if (kg === null || kg === undefined || isNaN(kg)) {
        return {
            value: '0',
            unit: 'kg CO₂e',
            shortUnit: 'kg'
        };
    }

    const numericKg = Number(kg);
    const ABS_KG = Math.abs(numericKg);

    let rawValue: number;
    let unit: string;
    let shortUnit: string;

    if (ABS_KG >= 1000) {
        rawValue = convertKgToTons(numericKg);
        unit = 'ton CO₂e';
        shortUnit = 'ton';
    } else {
        rawValue = numericKg;
        unit = 'kg CO₂e';
        shortUnit = 'kg';
    }

    const formattedValue = limitLeadingDigits(rawValue);

    return {
        value: formattedValue,
        unit: unit,
        shortUnit: shortUnit
    };
}

export function limitLeadingDigits(value: number, digits: number = 4): string {
    if (!isFinite(value)) return String(value);

    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);

    const intPart = Math.floor(abs).toString();

    if (intPart.length >= digits) {
        return sign + intPart.slice(0, digits);
    }

    const maxAllowedDecimals = Math.min(2, digits - intPart.length);

    if (maxAllowedDecimals <= 0) {
        return sign + intPart;
    }

    let out = abs.toFixed(maxAllowedDecimals);
    out = out.replace(/\.0+$/, "");
    out = out.replace(/(?<=\.[0-9]*[1-9])0+$/u, "");

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