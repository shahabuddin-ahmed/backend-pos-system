export type ReportPeriod = "today" | "thisMonth" | "lifetime";

export interface ReportRange {
    start?: Date;
    end?: Date;
}

export const resolveReportRange = (period: ReportPeriod): ReportRange => {
    const now = new Date();

    if (period === "today") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        return { start, end };
    }

    if (period === "thisMonth") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        return { start, end };
    }

    return {};
};
