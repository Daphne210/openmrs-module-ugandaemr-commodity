import { StockOperationStatus } from '../stockOperation/StockOperationStatus';


export interface StockItemTransactionDTO {
    uuid: string;
    dateCreated: Date;
    partyUuid: string;
    partyName: string;
    isPatientTransaction: boolean;
    quantity: number;
    stockBatchUuid: string;
    stockBatchNo: string;
    stockItemUuid: string;
    stockOperationUuid: string;
    stockOperationStatus: StockOperationStatus;
    stockOperationNumber: string;
    stockOperationTypeName: string;
    stockItemPackagingUOMUuid: string;
    packagingUomName: string;
    operationSourcePartyName: string;
    operationDestinationPartyName: string;

}
