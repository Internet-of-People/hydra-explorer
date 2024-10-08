<template>
  <Loader :data="transactions">
    <TableWrapper
      v-bind="$attrs"
      :columns="columns"
      :rows="transactions"
      :no-data-message="$t('COMMON.NO_RESULTS')"
      @on-sort-change="emitSortChange"
    >
      <template slot-scope="data">
        <div v-if="data.column.field === 'id'">
          <LinkTransaction
            :id="data.row.id"
            :smart-bridge="data.row.vendorField"
            :show-smart-bridge-icon="showSmartBridgeIcon"
          />
        </div>

        <div v-else-if="data.column.field === 'timestamp.unix'">
          <span>
            {{ readableTimestamp(data.row.timestamp.unix) }}
          </span>
        </div>

        <div v-else-if="data.column.field === 'sender'">
          <LinkWallet :address="data.row.sender" />
        </div>

        <div v-else-if="data.column.field === 'recipient'">
          <LinkWallet
            v-if="!isIOPTransaction(data.row.typeGroup)"
            :address="data.row.recipient"
            :type="data.row.type"
            :asset="data.row.asset"
            :type-group="data.row.typeGroup"
            :show-timelock-icon="true"
          />
          <div v-if="isMorpheusTransaction(data.row.type, data.row.typeGroup)" v-tooltip="`${TxStatus[morpheusTxProvider.get(data.row.id)]}`">
            {{ $t("TRANSACTION.TYPES.MORPHEUS_TRANSACTION") }}
            <strong>
              <SvgIcon v-if="morpheusTxProvider.get(data.row.id)===TxStatus.CONFIRMED" name="forging" class="text-green ml-2" view-box="0 0 12 12" style="display: inline;" />
              <SvgIcon v-if="morpheusTxProvider.get(data.row.id)===TxStatus.REJECTED" name="cross" class="text-red ml-2" view-box="0 0 12 12" style="display: inline;" />
              <SvgIcon v-if="morpheusTxProvider.get(data.row.id)===TxStatus.NOT_FOUND" name="circle-o" class="text-orange ml-2" view-box="0 0 12 12" style="display: inline;" />
            </strong>
          </div>
          <div v-if="isCoeusTransaction(data.row.type, data.row.typeGroup)">
            {{ $t("TRANSACTION.TYPES.COEUS_TRANSACTION") }}
            <strong>
              <SvgIcon v-if="coeusTxProvider.get(data.row.id)===TxStatus.CONFIRMED" name="forging" class="text-green ml-2" view-box="0 0 12 12" style="display: inline;" />
              <SvgIcon v-if="coeusTxProvider.get(data.row.id)===TxStatus.REJECTED" name="cross" class="text-red ml-2" view-box="0 0 12 12" style="display: inline;" />
              <SvgIcon v-if="coeusTxProvider.get(data.row.id)===TxStatus.NOT_FOUND" name="circle-o" class="text-orange ml-2" view-box="0 0 12 12" style="display: inline;" />
            </strong>
          </div>
        </div>

        <div v-else-if="data.column.field === 'vendorField'">
          <div class="cell-smartbridge-truncate">
            {{ emojify(data.row.vendorField) }}
          </div>
        </div>

        <div v-else-if="data.column.field === 'amount'">
          <TransactionAmount :transaction="data.row" />
        </div>

        <div v-else-if="data.column.field === 'fee'">
          <TransactionAmount :transaction="data.row" :is-fee="true" />
        </div>

        <div v-else-if="data.column.field === 'confirmations'">
          <div class="flex items-center justify-end whitespace-no-wrap">
            <div
              v-if="data.row.confirmations <= activeDelegates"
              class="flex items-center justify-end whitespace-no-wrap text-green"
            >
              <span class="inline-block mr-2">{{ readableNumber(data.row.confirmations) }}</span>
              <SvgIcon class="icon flex-none" name="became-active" view-box="0 0 16 16" />
            </div>
            <div v-else>
              <div v-tooltip="readableNumber(data.row.confirmations) + ' ' + $t('COMMON.CONFIRMATIONS')">
                {{ $t("TRANSACTION.WELL_CONFIRMED") }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </TableWrapper>
  </Loader>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { mapGetters } from "vuex";
import { IDelegate, ISortParameters, ITransaction } from "@/interfaces";
// import CryptoCompareService from "@/services/crypto-compare";
import { IMorpheusAsset, OperationType, ISignedOperationsData, TxStatus } from "@/iop/interfaces";
import { isCoeusTransaction, isMorpheusTransaction, isIOPTransaction } from "@/iop/utils";
import { morpheusTxProvider, coeusTxProvider } from "@/iop/tx-status";

@Component({
  computed: {
    ...mapGetters("network", ["activeDelegates", "isListed"]),
    ...mapGetters("currency", { currencySymbol: "symbol" }),
  },
  data: () => {
    return { isCoeusTransaction, isMorpheusTransaction, isIOPTransaction, morpheusTxProvider, coeusTxProvider, TxStatus };
  },
})
export default class TableTransactionsDesktop extends Vue {
  @Prop({
    required: true,
    validator: (value) => {
      return Array.isArray(value) || value === null;
    },
  })
  public transactions: ITransaction[] | null;
  @Prop({ required: false, default: false }) public showConfirmations: boolean;

  private activeDelegates: IDelegate[];
  private isListed: boolean;
  private currencySymbol: string;

  get columns() {
    const feeClasses = ["hidden", "lg:table-cell"];

    feeClasses.push(this.showConfirmations ? "pr-10 xl:pr-4" : "end-cell");

    let columns = [
      {
        label: this.$t("COMMON.ID"),
        field: "id",
        thClass: "start-cell",
        tdClass: "start-cell",
      },
      {
        label: this.$t("COMMON.TIMESTAMP"),
        field: "timestamp.unix",
        type: "number",
        thClass: "text-left hidden md:table-cell",
        tdClass: "text-left hidden md:table-cell wrap-timestamp",
      },
      {
        label: this.$t("TRANSACTION.SENDER"),
        field: "sender",
        tdClass: "break-all",
      },
      {
        label: this.$t("TRANSACTION.RECIPIENT"),
        field: "recipient",
        tdClass: "break-all",
      },
      {
        label: this.$t("TRANSACTION.SMARTBRIDGE"),
        field: "vendorField",
        thClass: "text-right cell-smartbridge",
        tdClass: "text-right cell-smartbridge",
      },
      {
        label: this.$t("TRANSACTION.AMOUNT"),
        field: "amount",
        type: "number",
        thClass: "end-cell lg:base-cell",
        tdClass: "end-cell lg:base-cell",
      },
      {
        label: this.$t("TRANSACTION.FEE"),
        field: "fee",
        type: "number",
        thClass: feeClasses.join(" "),
        tdClass: feeClasses.join(" "),
      },
    ];

    if (this.showConfirmations) {
      columns = columns.filter((column) => column.field !== "vendorField");

      columns.push({
        label: this.$t("COMMON.CONFIRMATIONS"),
        field: "confirmations",
        type: "number",
        // @ts-ignore
        sortable: false,
        thClass: "end-cell hidden xl:table-cell not-sortable",
        tdClass: "end-cell hidden xl:table-cell",
      });
    }

    return columns;
  }

  get showSmartBridgeIcon() {
    return this.transactions!.some((transaction) => {
      return !!transaction.vendorField;
    });
  }

  @Watch("transactions")
  public async onTransactionsChanged() {
    await this.prepareTransactions();
    await this.updateLayer2TxStatuses();
  }

  @Watch("currencySymbol")
  public async onCurrencySymbolChanged() {
    await this.updatePrices();
  }

  public async created() {
    this.prepareTransactions();
    await this.updateLayer2TxStatuses();
  }

  private async updateLayer2TxStatuses(): Promise<void> {
    if(!this.transactions) {
      return;
    }

    const morpheusTxs = [];
    const coeusTxs = [];

    for(const tx of this.transactions) {
      if(isMorpheusTransaction(tx.type, tx.typeGroup)) {
        morpheusTxs.push(tx.id);  
      }
      else if(isCoeusTransaction(tx.type, tx.typeGroup)) {
        coeusTxs.push(tx.id);
      }
      else {
        continue;
      }
    }

    await Promise.all([
      morpheusTxProvider.load(morpheusTxs),
      coeusTxProvider.load(coeusTxs),
    ]);
  }

  private async prepareTransactions() {
    await this.updatePrices();
  }

  private async fetchPrice(transaction: ITransaction) {
    // transaction.price = await CryptoCompareService.dailyAverage(transaction.timestamp.unix);
  }

  private async updatePrices() {
    if (!this.transactions) {
      return;
    }

    if (this.isListed) {
      const promises = this.transactions.map(this.fetchPrice);
      await Promise.all(promises);
    }
  }

  private emitSortChange(params: ISortParameters[]) {
    this.$emit("on-sort-change", params[0]);
  }
}
</script>

<style scoped>
.icon {
  width: 16px;
  height: 16px;
}

.wrap-timestamp {
  white-space: normal;
}

@media (min-width: 870px) {
  .wrap-timestamp {
    white-space: nowrap;
  }
}
</style>
