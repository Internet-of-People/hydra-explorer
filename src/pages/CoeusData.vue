<template>
  <div class="max-w-2xl mx-auto my-5 text-lg">
    <ContentHeader>{{ $t('PAGES.COEUS_DATA.TITLE') }}: {{ this.domainName }}</ContentHeader>

    <section class="page-section mb-5 py-5 md:py-10" v-if="txOperation">
      <div class="my-5 sm:mx-10">
        {{ $t('PAGES.COEUS_DATA.TX_DATA') }}
        <div class="w-full justify-between mt-5">
          <div class="mb-4 lg:mb-0">
            <DomainData
              class="mt-5"
              :data="txOperation.data"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="page-section mb-5 py-5 md:py-10" v-if="currentData">
      <div class="mx-5 sm:mx-10">
        {{ $t('PAGES.COEUS_DATA.CURRENT_DATA') }}
        <div class="w-full justify-between mt-5">
          <div class="mb-4 lg:mb-0">
            <DomainData
              class="mt-5"
              :data="currentData"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="page-section mb-5 py-5 md:py-10" v-if="errorPresent">
      <div class="mx-5 sm:mx-10">
        {{ errorMessage }}
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DomainData } from "@/components/coeus";
import { IDataOperation } from '@/iop/interfaces';
import { CoeusAPI } from '@/iop/coeus-api';
import TransactionService from "@/services/transaction";

@Component({
  components: {
    DomainData,
  },
})
export default class CoeusData extends Vue {
  @Prop({ required: true }) private txId: string;
  @Prop({ required: true }) private bundleIndex: number;
  @Prop({ required: true }) private operationIndex: number;

  private txOperation: IDataOperation | null = null;
  private currentData: unknown = null;
  private domainName: string;

  private errorPresent: boolean = false;
  private errorMessage: string;

  public async mounted(): Promise<void> {
    try {
      const transaction = await TransactionService.find(this.txId);
      this.txOperation = CoeusAPI.getOperationFromTx(transaction, this.bundleIndex, this.operationIndex);
      this.domainName = this.txOperation.name;
      this.currentData = await CoeusAPI.getDomainData(this.domainName);
      
      if (this.currentData === null) { 
        throw Error('Domain data not found in current state of the blockchain!');
      }
    } catch(e) {
      this.errorPresent = true;
      this.errorMessage = e;
    }
  }
}
</script>