<template>
  <div class="max-w-2xl mx-auto my-5 text-lg">
    <ContentHeader>{{ $t('PAGES.COEUS_DATA.TITLE') }}: {{ this.domainName }}</ContentHeader>

    <section class="page-section mb-5 py-5 md:py-5" v-if="txOperation">
      <div class="my-5 sm:mx-10">
        <div class="text-xl">{{ $t('PAGES.COEUS_DATA.TX_DATA') }}</div>
        <hr class="mt-5 mb-5 w-full">
        <div class="w-full justify-between mt-5">
          <div class="lg:mb-0 text-theme-text-tertiary">
            <DomainData
              class="mt-5"
              :data="txOperation.data"
            />
          </div>
        </div>
        <hr class="mt-5 mb-5 w-full">
      </div>
    </section>

    <section class="page-section mb-5 py-5 md:py-5">
      <div class="my-5 sm:mx-10">
        <div class="text-xl">{{ $t('PAGES.COEUS_DATA.CURRENT_DATA') }}</div>
        <hr class="mt-5 mb-5 w-full">
        <div v-if="domainExpired" class="text-theme-text-tertiary">
          <pre>Domain has already been expired.</pre>
        </div>
        <template v-else>
          <div class="w-full justify-between mt-5">
            <div class="lg:mb-0">
              <DomainData
                class="mt-5"
                :data="currentData"
              />
            </div>
          </div>
          <hr class="mt-5 w-full">
        </template>
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

  private errorPresent = false;
  private errorMessage: string;
  private domainExpired = false;

  public async mounted(): Promise<void> {
    try {
      const transaction = await TransactionService.find(this.txId);
      this.txOperation = CoeusAPI.getOperationFromTx(transaction, this.bundleIndex, this.operationIndex);
      this.domainName = this.txOperation.name;
      this.currentData = await CoeusAPI.getDomainData(this.domainName);
      
      if (this.currentData === null) { 
        this.domainExpired = true;
      }
    } catch(e) {
      this.errorPresent = true;
      this.errorMessage = e;
    }
  }
}
</script>