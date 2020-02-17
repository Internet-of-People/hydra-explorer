import { MorpheusAPI, MorpheusTxStatus } from "./api";

class MorpheusTxStatusProvider {
  private api: MorpheusAPI;
  private morpheusTxStatuses: Map<string,MorpheusTxStatus> = new Map();

  constructor() {
    this.api = new MorpheusAPI();
  }

  public async load(txIds: string[]): Promise<void> {
    this.morpheusTxStatuses = await this.api.getTxStatus(txIds)
  }

  public get(txId: string): MorpheusTxStatus {
    if(this.morpheusTxStatuses.has(txId)){
      return this.morpheusTxStatuses.get(txId);
    }
    return MorpheusTxStatus.NOT_FOUND;
  }
}

export const morpheusTxProvider = new MorpheusTxStatusProvider();

