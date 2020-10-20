import axios from "axios";
import store from "../store";
import { IDidDocumentData, DidOperation, TxStatus } from './interfaces';
import { buildTxStatusesMap } from './utils';

export class MorpheusAPI {
  public static async getTxStatus(txs: string[]): Promise<Map<string,TxStatus>> {
    const promises = [];
    for(const tx of txs) {
      const axiosPromise = axios.get(`${this.getBaseUrl()}/txn-status/${tx}`);
      promises.push(axiosPromise.catch(() => undefined)); // will prevent break of Promise.all if any of those fails
    }
    const result = await Promise.all(promises);
    return buildTxStatusesMap(txs, result);
  }

  public static async getDidDocument(did: string, atHeight?: number): Promise<IDidDocumentData> {
    const url = atHeight 
      ? `${this.getBaseUrl()}/did/${did}/document/${atHeight}` 
      : `${this.getBaseUrl()}/did/${did}/document`;
    
    const resp = await axios.get(url);
    return resp.data as IDidDocumentData;
  }

  public static async getOperationsAttempts(did: string, untilHeight: number): Promise<DidOperation[]> {
    const url = untilHeight 
      ? `${this.getBaseUrl()}/did/${did}/operation-attempts/0/${untilHeight}` 
      : `${this.getBaseUrl()}/did/${did}/operation-attempts/0`;

    const resp = await axios.get(url);
    return resp.data;
  }

  private static getBaseUrl(): string {
    return store.getters["network/server"].replace("/api/v2","/morpheus/v1");
  }
}
