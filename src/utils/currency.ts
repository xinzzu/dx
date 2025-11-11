export const formatIDR = (
    amount: number | string | undefined | null,
    options?: Intl.NumberFormatOptions
): string => {
    if (amount === undefined || amount === null || amount === "") {
        return "Rp0";
    }

    let numberAmount: number;

    if (typeof amount === "string") {
        const sanitized = amount.replace(/[^0-9.,]/g, "").replace(",", ".");
        numberAmount = parseFloat(sanitized) || 0;
    } else {
        numberAmount = amount;
    }

    const defaultOptions: Intl.NumberFormatOptions = {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };

    const finalOptions = { ...defaultOptions, ...options };

    return new Intl.NumberFormat("id-ID", finalOptions).format(numberAmount);
};

export const formatIDRWithDecimals = (
    amount: number | string | undefined | null
): string => {
    return formatIDR(amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};