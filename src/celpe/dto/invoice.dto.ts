export interface Invoice {
    fileName: string;
    fileSize: number;
    fileData: string;
    fileExtension: string;
    month: string;
}

export interface UcInvoice {
    uc: number;
    invoices: Invoice[];
}