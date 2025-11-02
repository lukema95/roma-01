import numeral from "numeral";

export function fmtUSD(value: number | undefined | null): string {
  if (value === undefined || value === null) return "--";
  
  try {
    if (Math.abs(value) >= 1000) {
      return numeral(value).format("$0,0.00");
    }
    return numeral(value).format("$0,0.0000");
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function fmtNumber(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null) return "--";
  
  try {
    return numeral(value).format(`0,0.${"0".repeat(decimals)}`);
  } catch {
    return value.toFixed(decimals);
  }
}

export function fmtPercent(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null) return "--";
  
  const sign = value >= 0 ? "+" : "";
  try {
    return `${sign}${numeral(value).format(`0.${"0".repeat(decimals)}`)}%`;
  } catch {
    return `${sign}${value.toFixed(decimals)}%`;
  }
}

export function fmtCompact(value: number | undefined | null): string {
  if (value === undefined || value === null) return "--";
  
  try {
    return numeral(value).format("0.0a").toUpperCase();
  } catch {
    return value.toFixed(0);
  }
}

