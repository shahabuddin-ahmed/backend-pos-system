import { ReportPeriod } from "./reportPeriod";

export interface ReportOutletSummary {
    id: number;
    name: string;
    code: string;
}

export interface RevenueByOutletRow {
    totalRevenue: number;
    outlet: ReportOutletSummary | null;
}

export interface TopItemByOutletRow {
    totalQuantity: number;
    masterMenuItem: {
        name: string;
        sku: string;
    } | null;
}

export interface ReportSummary {
    period: ReportPeriod;
    totalRevenue: number;
    topOutlet: RevenueByOutletRow | null;
    selectedOutletId: number | null;
    revenueByOutlet: RevenueByOutletRow[];
    topItems: TopItemByOutletRow[];
}

export interface RevenueByOutletRecord {
    get(options?: { plain?: boolean }): {
        totalRevenue: number | string;
        outlet: ReportOutletSummary | null;
    };
}

export interface TopItemByOutletRecord {
    get(options?: { plain?: boolean }): {
        totalQuantity: number | string;
        masterMenuItem: {
            name: string;
            sku: string;
        } | null;
    };
}
