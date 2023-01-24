import { HEALTH_CENTER_NAME } from '../../../config'
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationItemDTO } from '../../../core/api/types/stockOperation/StockOperationItemDTO';
import { REQUISITION_OPERATION_TYPE, STOCK_ISSUE_OPERATION_TYPE } from '../../../core/api/types/stockOperation/StockOperationType';
import { StockItemInventory } from '../../../core/api/types/stockItem/StockItemInventory';
import { StockOperationItemCost } from '../../../core/api/types/stockOperation/StockOperationItemCost';

export interface StockOperationPrintData {
    operationNumber?: string;
    organizationName?: string;
    location?: string;
    operationDate?: Date;
    orderedBy?: string;
    responsiblePerson?: string;
    authorizedBy?: string;
    items?: StockOperationItemData[];
    issueDate?: Date;
    receiptDate?: Date;
    receiverName?: string;
    issuerName?: string;
    documentTitle?: string;
    source?: string;
    destination?: string;
    remarks?: string;
}

export interface StockOperationItemData {
    itemCode?: string;
    itemDescription?: string;
    batchNumber?: string;
    expiryDate?: Date;
    balanceOnHand?: number;
    balanceOnHandUoM?: string;
    quantityRequired?: number;
    quantityRequiredUoM?: string;
    quantityIssued?: number;
    quantityIssuedUoM?: string;
    unitCost?: number;
    unitCostUoM?: string;
    totalCost?: number;
    purchasePrice?: number;
}

export const BuildStockOperationData = async (currentOperation: StockOperationDTO, stockOperationItems: StockOperationItemDTO[], parentOperation?: StockOperationDTO, operationItemsCost?: StockOperationItemCost[] | null, inventory?: StockItemInventory[] | null): Promise<StockOperationPrintData | null> => {
    let data: StockOperationPrintData = {};
    if (REQUISITION_OPERATION_TYPE !== currentOperation.operationType) {
        data.authorizedBy = currentOperation?.dispatchedDate ? `${currentOperation.dispatchedByFamilyName ?? ""} ${currentOperation.dispatchedByGivenName ?? ""}` : (currentOperation?.completedDate ? `${currentOperation.completedByFamilyName ?? ""} ${currentOperation.completedByGivenName ?? ""}` : "");
    }
    data.remarks = currentOperation.remarks!;
    data.operationNumber = currentOperation.operationNumber!;
    data.operationDate = parentOperation?.operationDate ?? currentOperation?.operationDate;
    data.location = parentOperation?.atLocationName ?? currentOperation?.atLocationName!;
    data.source = currentOperation?.sourceName!;
    data.destination = currentOperation?.destinationName!;
    data.responsiblePerson = data.orderedBy = parentOperation?.responsiblePersonFamilyName ? `${parentOperation.responsiblePersonFamilyName ?? ""} ${parentOperation!.responsiblePersonGivenName ?? ""}` : `${currentOperation.responsiblePersonFamilyName ?? ""} ${currentOperation.responsiblePersonGivenName ?? ""}`;
    data.organizationName = HEALTH_CENTER_NAME;
    data.documentTitle = `${currentOperation.operationTypeName} ${currentOperation.operationNumber}${parentOperation ? ` of ${parentOperation.operationTypeName} ${parentOperation.operationNumber}` : ""}`
    data.items = stockOperationItems.map(p => {
        let item: StockOperationItemData = {};
        item.itemCode = p.acronym!;
        item.itemDescription = p.stockItemName!;
        item.purchasePrice = p.purchasePrice!;
        item.batchNumber = p.batchNo!;
        item.expiryDate = p.expiration!;
        if (parentOperation) {
            item.quantityRequired = p.quantityRequested!;
            item.quantityRequiredUoM = p.quantityRequestedPackagingUOMName!;
            item.quantityIssued = p.quantity!;
            item.quantityIssuedUoM = p.stockItemPackagingUOMName!;
        } else if (STOCK_ISSUE_OPERATION_TYPE === currentOperation.operationType) {
            item.quantityIssued = p.quantity!;
            item.quantityIssuedUoM = p.stockItemPackagingUOMName!;
        } else {
            item.quantityRequired = p.quantity!;
            item.quantityRequiredUoM = p.stockItemPackagingUOMName!;
        }
        if (operationItemsCost) {
            let operationItemCost = operationItemsCost.find(x => x.uuid === p.uuid);
            if (operationItemCost) {
                item.unitCost = operationItemCost.unitCost;
                item.unitCostUoM = operationItemCost.unitCostUOMName;
                item.totalCost = operationItemCost.totalCost;
            }
        }
        if (inventory) {
            let itemInventory = inventory.find(x => x.stockItemUuid === p.stockItemUuid);
            if (itemInventory) {
                item.balanceOnHand = itemInventory.quantity;
                item.balanceOnHandUoM = itemInventory.quantityUoM;
            }
        }
        return item;
    });
    return data;
}