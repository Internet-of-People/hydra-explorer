import axios from "axios";
import store from "../store";
import { 
  ICoeusAsset,
  ICoeusDomainChildren,
  ICoeusDomainData,
  ICoeusDomainMeta,
  IDataOperation,
  TxStatus,
  IUserOperation,
} from './interfaces';
import { buildTxStatusesMap } from './utils';

export class CoeusAPI {
  public static async getDomainData(domain: string): Promise<ICoeusDomainData | null> {
    const resp = await axios.get(`${this.getBaseUrl()}/resolve/${domain}`, { validateStatus: () => true });
    if(resp.status === 404) {
      return null;
    }

    return resp.data;
  }

  public static async getDomainMeta(domain: string): Promise<ICoeusDomainMeta | null> {
    const resp = await axios.get(`${this.getBaseUrl()}/metadata/${domain}`, { validateStatus: () => true });
    if(resp.status === 404) {
      return null;
    }

    return resp.data;
  }

  public static async getDomainChildren(domain: string): Promise<ICoeusDomainChildren | null> {
    const resp = await axios.get(`${this.getBaseUrl()}/children/${domain}`, { validateStatus: () => true });
    if(resp.status === 404) {
      return null;
    }
  }

  public static async getTxDomainData(domain: string, tx: string): Promise<unknown> | null {
    const resp = await axios.get(`${this.getServerUrl()}/transactions/${tx}`);
    if (resp.status === 404) {
      return null;
    }
    const { bundles } = resp.data.data.asset as unknown as ICoeusAsset;
    for (let bundle of bundles) {
      for (let operation of bundle.operations) {
        if ( operation.name === domain ) {
          if ( this.isDataOperation(operation) ) {
            return operation.data;
          }
        }
      }
    }
    return null;
  }

  public static async getTxStatus(txs: string[]): Promise<Map<string,TxStatus>> {
    const promises = [];
    for(const tx of txs) {
      const axiosPromise = axios.get(`${this.getBaseUrl()}/txn-status/${tx}`, { validateStatus: () => true });
      promises.push(axiosPromise.catch(() => undefined)); // will prevent break of Promise.all if any of those fails
    }
    const result = await Promise.all(promises);
    return buildTxStatusesMap(txs, result);
  }

  public static getServerUrl(): string {
    return store.getters["network/server"];
  }

  public static getBaseUrl(): string {
    return this.getServerUrl().replace("/api/v2","/coeus/v1");
  }

  private static isDataOperation(operation: IUserOperation): operation is IDataOperation {
    return (operation.type ===  'register' || operation.type === 'update');
  };
}