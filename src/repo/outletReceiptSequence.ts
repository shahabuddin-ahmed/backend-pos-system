import { Transaction } from "sequelize";
import { OutletReceiptSequence } from "../model";

export interface OutletReceiptSequenceRepoInterface {
    nextReceiptNumber(outletId: number, outletCode: string, transaction: Transaction): Promise<string>;
}

export class OutletReceiptSequenceRepo implements OutletReceiptSequenceRepoInterface {
    public async nextReceiptNumber(outletId: number, outletCode: string, transaction: Transaction): Promise<string> {
        let sequence = await OutletReceiptSequence.findOne({ where: { outletId }, transaction, lock: transaction.LOCK.UPDATE });
        if (!sequence) {
            sequence = await OutletReceiptSequence.create({ outletId, lastNumber: 0 }, { transaction });
        }

        const nextNumber = sequence.getDataValue("lastNumber") + 1;
        await sequence.update({ lastNumber: nextNumber, updatedAt: new Date() }, { transaction });
        return `${outletCode}-${String(nextNumber).padStart(6, "0")}`;
    }
}

export const newOutletReceiptSequenceRepo = async (): Promise<OutletReceiptSequenceRepoInterface> => {
    return new OutletReceiptSequenceRepo();
};
