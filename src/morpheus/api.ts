import axios from "axios";
import store from "../store";
import { IDidDocumentData } from './interfaces';

export enum MorpheusTxStatus {
  CONFIRMED,
  REJECTED,
  NOT_FOUND
}

export class MorpheusAPI {
  public static async getTxStatus(txs: string[]): Promise<Map<string,MorpheusTxStatus>> {
    const promises = [];
    for(const tx of txs) {
      const axiosPromise = axios.get(`${this.getBaseUrl()}/txn-status/${tx}`);
      promises.push(axiosPromise.catch(() => undefined)); // will prevent break of Promise.all if any of those fails
    }
    const result = await Promise.all(promises);
    
    const map = new Map<string, MorpheusTxStatus>();
    for(let i=0;i<txs.length;i++){
      if(result[i].data === undefined){
        map.set(txs[i],MorpheusTxStatus.NOT_FOUND);
      }
      else {
        map.set(txs[i],result[i].data ? MorpheusTxStatus.CONFIRMED : MorpheusTxStatus.REJECTED);  
      }
    }

    return map;
  }

  public static async getDidDocument(did: string, atHeight?: number): Promise<IDidDocumentData> {
    const url = atHeight 
      ? `${this.getBaseUrl()}/did/${did}/document/${atHeight}` 
      : `${this.getBaseUrl()}/did/${did}/document`;
    
    const resp = await axios.get(url);
    return resp.data as IDidDocumentData;
  }

  private static getBaseUrl(): string {
    return store.getters["network/server"].replace("/api","");
  }
}
