import axios from "axios";
import store from "../store";

export enum MorpheusTxStatus {
  CONFIRMED,
  REJECTED,
  NOT_FOUND
}

export class MorpheusAPI {
  public async getTxStatus(txs: string[]): Promise<Map<string,MorpheusTxStatus>> {
    const server = store.getters["network/server"];
    const promises = [];
    for(const tx of txs) {
      const axiosPromise = axios.get(`${server.replace("/api","")}/txn-status/${tx}`);
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
}
