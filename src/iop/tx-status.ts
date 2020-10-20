import { TxStatus } from './interfaces';
import { CoeusAPI } from './coeus-api';
import { MorpheusAPI } from "./morpheus-api";

class MorpheusTxStatusProvider {
  private morpheusTxStatuses: Map<string,TxStatus> = new Map();

  public async load(txIds: string[]): Promise<void> {
    this.morpheusTxStatuses = await MorpheusAPI.getTxStatus(txIds);
  }

  public get(txId: string): TxStatus {
    if(this.morpheusTxStatuses.has(txId)){
      return this.morpheusTxStatuses.get(txId);
    }
    return TxStatus.NOT_FOUND;
  }
}

class CoeusTxStatusProvider {
  private coeusTxStatuses: Map<string,TxStatus> = new Map();

  public async load(txIds: string[]): Promise<void> {
    this.coeusTxStatuses = await CoeusAPI.getTxStatus(txIds);
  }

  public get(txId: string): TxStatus {
    if(this.coeusTxStatuses.has(txId)){
      return this.coeusTxStatuses.get(txId);
    }
    return TxStatus.NOT_FOUND;
  }
}

export const morpheusTxProvider = new MorpheusTxStatusProvider();
export const coeusTxProvider = new CoeusTxStatusProvider();
