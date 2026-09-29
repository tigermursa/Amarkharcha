export interface IPeriodSummaryReport {
  period: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  breakdown: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    total: number;
    count: number;
  }[];
  totalAmount: number;
  totalCount: number;
}
