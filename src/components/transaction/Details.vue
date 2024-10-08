<template>
  <div>
    <section v-if="isMorpheusTransaction(transaction.type, transaction.typeGroup)" class="page-section py-5 md:py-5 px-5 sm:px-10 mb-5">
      <div class="flex items-center flex-auto w-full md:w-auto mb-5 md:mb-0 truncate">
        <div class="flex-auto min-w-0">
          <div class="text-xl">
            {{ $t("TRANSACTION.TYPES.MORPHEUS_TRANSACTION") }}
            <div class="sm:hidden mt-5">
              <strong v-if="morpheusTxProvider.get(transaction.id)===TxStatus.CONFIRMED" class="text-green">
                <SvgIcon name="forging" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> CONFIRMED
              </strong>
              <strong v-if="morpheusTxProvider.get(transaction.id)===TxStatus.REJECTED" class="text-red">
                <SvgIcon name="cross" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> REJECTED
              </strong>
              <strong v-if="morpheusTxProvider.get(transaction.id)===TxStatus.NOT_FOUND" class="text-orange">
                <SvgIcon name="circle-o" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> PENDING
              </strong>
            </div>
          </div>
        </div>
        <div class="flex w-full md:block md:w-auto justify-between mb-5 md:mb-0 whitespace-no-wrap">
          <div class="flex text-xl semibold hidden sm:block">
            <strong v-if="morpheusTxProvider.get(transaction.id)===TxStatus.CONFIRMED" class="text-green">
              <SvgIcon name="forging" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> CONFIRMED
            </strong>
            <strong v-if="morpheusTxProvider.get(transaction.id)===TxStatus.REJECTED" class="text-red">
              <SvgIcon name="cross" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> REJECTED
            </strong>
            <strong v-if="morpheusTxProvider.get(transaction.id)===TxStatus.NOT_FOUND" class="text-orange">
              <SvgIcon name="circle-o" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> PENDING
            </strong>
          </div>
        </div>
      </div>
      <hr class="mt-5 w-full">

      <nav class="MorpheusNav">
        <div 
          :class="{ active: isDidOperationsTabActive }"
          class="MorpheusNav--tab"
          @click="setActiveTab('didOperations')"
        >
          DID Operations
          <span>{{morpheusOperations.didOperationsCount}}</span>
        </div>
        <div 
          :class="{ active: isOtherOperationsTabActive }"
          class="MorpheusNav--tab"
          @click="setActiveTab('otherOperations')"
        >
          Other Operations
          <span>{{morpheusOperations.otherOperationsCount}}</span>
        </div>
      </nav>
      <div class="px-2">
        <template v-if="isDidOperationsTabActive">
          <div v-if="morpheusOperations.didOperationsCount===0" class="text-theme-text-secondary">
            No Operations.
          </div>
          <div
            v-for="(did) in morpheusOperations.didOperations.keys()"
            :key="did"
          >
            <div class="my-2">
              <RouterLink :to="`/did-browser/${did}`">{{ did }}</RouterLink>
            </div>
            <ul>
              <li
                :key="operation"
                v-for="operation in morpheusOperations.didOperations.get(did)"
              >
                - {{ operation }}
              </li>
            </ul>
          </div>
        </template>
        <template v-if="isOtherOperationsTabActive">
          <div v-if="morpheusOperations.otherOperations.length===0" class="text-theme-text-secondary">
            No Operations.
          </div>
          <ul>
            <li
              :key="operation"
              v-for="(operation) in morpheusOperations.otherOperations"
            >
              - {{ operation }}
            </li>
          </ul>
        </template>
      </div>
    </section>

    <section v-if="isCoeusTransaction(transaction.type, transaction.typeGroup)" class="page-section py-5 md:py-5 px-5 sm:px-10 mb-5">
      <div class="flex items-center flex-auto w-full md:w-auto mb-5 md:mb-0 truncate">
        <div class="flex-auto min-w-0">
          <div class="text-xl">
            {{ $t("TRANSACTION.TYPES.COEUS_TRANSACTION") }}
            <div class="sm:hidden mt-5">
              <strong v-if="coeusTxProvider.get(transaction.id)===TxStatus.CONFIRMED" class="text-green">
                <SvgIcon name="forging" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> CONFIRMED
              </strong>
              <strong v-if="coeusTxProvider.get(transaction.id)===TxStatus.REJECTED" class="text-red">
                <SvgIcon name="cross" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> REJECTED
              </strong>
              <strong v-if="coeusTxProvider.get(transaction.id)===TxStatus.NOT_FOUND" class="text-orange">
                <SvgIcon name="circle-o" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> PENDING
              </strong>
            </div>
          </div>
        </div>
        <div class="flex w-full md:block md:w-auto justify-between mb-5 md:mb-0 whitespace-no-wrap">
          <div class="flex text-xl semibold hidden sm:block">
            <strong v-if="coeusTxProvider.get(transaction.id)===TxStatus.CONFIRMED" class="text-green">
              <SvgIcon name="forging" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> CONFIRMED
            </strong>
            <strong v-if="coeusTxProvider.get(transaction.id)===TxStatus.REJECTED" class="text-red">
              <SvgIcon name="cross" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> REJECTED
            </strong>
            <strong v-if="coeusTxProvider.get(transaction.id)===TxStatus.NOT_FOUND" class="text-orange">
              <SvgIcon name="circle-o" class="ml-2 mr-2" view-box="0 0 22 22" style="display: inline;" /> PENDING
            </strong>
          </div>
        </div>
      </div>
    </section>

    <CoeusSignedOperations
      class="mt-5"
      :txId="transaction.id"
      :key="bundle.signature"
      v-for="bundle in coeusTxBundles"
      :bundle="bundle"
      :bundleIndex="bundleIndex(bundle)"
    />

    <section class="page-section py-5 md:py-10 mb-5">
      <div v-if="isIOPTransaction(transaction.typeGroup)" class="px-5 sm:px-10 text-xl mb-8">
        Core Transaction Information
      </div>
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.SENDER") }}</div>
          <div class="truncate">
            <LinkWallet :address="transaction.sender" :trunc="false" tooltip-placement="left" />
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.RECIPIENT") }}</div>
          <div class="truncate">
            <LinkWallet :address="transaction.recipient" :trunc="false" tooltip-placement="left" />
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.TYPE") }}</div>
          <div class="truncate">
            <LinkWallet
              :address="transaction.recipient"
              :type="transaction.type"
              :asset="transaction.asset"
              :trunc="false"
              :type-group="transaction.typeGroup"
              :show-as-type="true"
              tooltip-placement="left"
            />
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("COMMON.CONFIRMATIONS") }}</div>
          <div>{{ readableNumber(confirmations) }}</div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.AMOUNT") }}</div>
          <div
            v-if="isMultiPayment(transaction.type, transaction.typeGroup)"
            v-tooltip="{
              trigger: 'hover click',
              content: price ? readableCurrency(multipaymentAmount, price) : '',
              placement: 'left',
            }"
          >
            {{ readableCrypto(multipaymentAmount) }}
          </div>
          <div
            v-else
            v-tooltip="{
              trigger: 'hover click',
              content: price ? readableCurrency(transaction.amount, price) : '',
              placement: 'left',
            }"
          >
            {{ readableCrypto(transaction.amount) }}
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.FEE") }}</div>
          <div
            v-tooltip="{
              trigger: 'hover click',
              content: price ? readableCurrency(transaction.fee, price) : '',
              placement: 'left',
            }"
          >
            {{ readableCrypto(transaction.fee) }}
          </div>
        </div>

        <div class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("COMMON.TIMESTAMP") }}</div>
          <div v-if="transaction.timestamp">{{ readableTimestamp(transaction.timestamp.unix) }}</div>
        </div>

        <div v-if="transaction.vendorField" class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("TRANSACTION.SMARTBRIDGE") }}</div>
          <div class="overflow-hidden break-words">{{ emojify(transaction.vendorField) }}</div>
        </div>

        <div v-if="transaction.nonce" class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("TRANSACTION.NONCE") }}</div>
          <div>{{ transaction.nonce }}</div>
        </div>

        <div v-if="isIpfs(transaction.type, transaction.typeGroup)" class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.IPFS") }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.ipfs }}</div>
        </div>

        <div v-if="isTimelock(transaction.type, transaction.typeGroup)">
          <div class="list-row-border-b-no-wrap">
            <div class="mr-4 whitespace-no-wrap">{{ $t("TRANSACTION.TIMELOCK.SECRET_HASH") }}</div>
            <div class="overflow-hidden break-all">{{ transaction.asset.lock.secretHash }}</div>
          </div>

          <div v-if="transaction.asset.lock.expiration.type === 1" class="list-row-border-b">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.EXPIRATION") }}</div>
            <div>{{ readableTimestampFromEpoch(transaction.asset.lock.expiration.value) }}</div>
          </div>
          <div v-else-if="transaction.asset.lock.expiration.type === 2" class="list-row-border-b">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.BLOCKHEIGHT") }}</div>
            <div
              v-tooltip="{
                trigger: 'hover click',
                content: readableTimestampFromBlockheight(transaction.asset.lock.expiration.value),
                placement: 'left',
              }"
            >
              {{ transaction.asset.lock.expiration.value }}
            </div>
          </div>

          <div class="list-row-border-b-no-wrap">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.STATUS") }}</div>
            <div v-if="timelockLink">
              <LinkTransaction :id="timelockLink">{{ timelockStatus }}</LinkTransaction>
            </div>
            <div v-else>{{ timelockStatus }}</div>
          </div>
        </div>

        <div v-if="isTimelockClaim(transaction.type, transaction.typeGroup)">
          <div class="list-row-border-b-no-wrap">
            <div class="mr-4 whitespace-no-wrap">{{ $t("TRANSACTION.TIMELOCK.UNLOCK_SECRET_HEX") }}</div>
            <div class="overflow-hidden break-all">{{ stringToHex(transaction.asset.claim.unlockSecret) }}</div>
          </div>

          <div class="list-row-border-b">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.CLAIMED") }}</div>
            <div class="overflow-hidden break-all">
              <LinkTransaction :id="transaction.asset.claim.lockTransactionId" />
            </div>
          </div>
        </div>

        <div v-if="isTimelockRefund(transaction.type, transaction.typeGroup)" class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.REFUNDED") }}</div>
          <div class="overflow-hidden break-all">
            <LinkTransaction :id="transaction.asset.refund.lockTransactionId" />
          </div>
        </div>

        <div class="list-row">
          <div class="mr-4">{{ $t("TRANSACTION.BLOCK_ID") }}</div>
          <div>
            <LinkBlock v-if="transaction.blockId" :id="transaction.blockId">{{ transaction.blockId }}</LinkBlock>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="isMultiSignature(transaction.type, transaction.typeGroup)"
      class="TransactionDetails__MultiSignature page-section py-5 md:py-10 mb-5"
    >
      <div class="px-5 sm:px-10">
        <div v-if="!isLegacyMultiSignature" class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.ADDRESS") }}</div>
          <div class="truncate">
            <LinkWallet
              :address="addressFromMultiSignatureAsset(multiSignatureAsset)"
              :trunc="false"
              tooltip-placement="left"
            />
          </div>
        </div>
        <div class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.PARTICIPANTS") }}</div>
          <ul>
            <li v-for="publicKey in publicKeysFromMultiSignatureAsset" :key="publicKey" class="mb-1">
              <LinkWallet
                :address="addressFromPublicKey(publicKey)"
                :trunc="false"
                tooltip-placement="left"
                class="justify-end"
              />
            </li>
          </ul>
        </div>
        <div :class="isLegacyMultiSignature ? 'list-row-border-b' : 'list-row'">
          <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.MIN") }}</div>
          <div>{{ multiSignatureAsset.min }} / {{ publicKeysFromMultiSignatureAsset.length }}</div>
        </div>
        <template v-if="isLegacyMultiSignature">
          <div class="list-row">
            <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.LIFETIME") }}</div>
            <div>
              {{ multiSignatureAsset.lifetime }}
            </div>
          </div>
          <div v-if="isLegacyMultiSignature" class="list-row text-sm text-theme-text-secondary">
            <span>* {{ $t("TRANSACTION.MULTI_SIGNATURE.LEGACY_NOTICE") }}</span>
          </div>
        </template>
      </div>
    </section>

    <section
      v-if="
        transaction.typeGroup === typeGroupTransaction.MAGISTRATE &&
          transaction.type !== magistrateTransaction.BUSINESS_RESIGNATION
      "
      class="page-section py-5 md:py-10 mb-5"
    >
      <div class="px-5 sm:px-10">
        <div v-for="(value, prop) in assetField" :key="prop" class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.ASSET.${prop.toUpperCase()}`) }}</div>
          <div class="overflow-hidden break-all">{{ value }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BigNumber } from '../../utils/BigNumber';
import { TranslateResult } from 'vue-i18n';
import { mapGetters } from 'vuex';
import { ITransaction } from '../../interfaces';
import { CoreTransaction, MagistrateTransaction, TypeGroupTransaction } from '../../enums';
import { CoeusSignedOperations } from '../../components/coeus';
import {
  LockService,
  TransactionService,
} from '../../services';
import {
  formatMorpheusOperations,
  isMorpheusTransaction,
  isCoeusTransaction,
  isIOPTransaction,
  OperationDetails,
} from '../../iop/utils';
import { morpheusTxProvider, coeusTxProvider } from '../../iop/tx-status';
import { ICoeusAsset, ISignedBundle, TxStatus } from '../../iop/interfaces';

@Component({
  computed: {
    ...mapGetters("currency", { currencySymbol: "symbol" }),
    ...mapGetters("network", ["height"]),
  },
  data: () => {
    return {
      isMorpheusTransaction,
      isCoeusTransaction,
      isIOPTransaction,
      formatMorpheusOperations,
      morpheusTxProvider,
      coeusTxProvider,
      TxStatus,
    };
  },
  components: {
    CoeusSignedOperations,
  }
})
export default class TransactionDetails extends Vue {
  @Prop({ required: true }) public transaction: ITransaction;

  private initialBlockHeight = 0;
  private price: number | null = 0;
  private currencySymbol: string;
  private height: number;
  private multipaymentAmount: BigNumber | null = null;
  private timelockStatus: TranslateResult | null = null;
  private timelockLink: string | null = null;
  private tabActive: string = 'didOperations';

  get isDidOperationsTabActive() {
    return this.tabActive === "didOperations";
  }

  get coeusTxBundles() {
    if(!isCoeusTransaction(this.transaction.type, this.transaction.typeGroup)) {
      return;
    }
    return this.coeusAsset.bundles;
  }

  get isOtherOperationsTabActive() {
    return this.tabActive === "otherOperations";
  }

  get confirmations() {
    return this.initialBlockHeight ? this.height - this.initialBlockHeight : this.transaction.confirmations;
  }

  get coreTransaction() {
    return CoreTransaction;
  }

  get magistrateTransaction() {
    return MagistrateTransaction;
  }

  get typeGroupTransaction() {
    return TypeGroupTransaction;
  }

  get isLegacyMultiSignature() {
    return !!this.transaction.asset.multiSignatureLegacy;
  }

  get multiSignatureAsset() {
    return this.transaction.asset.multiSignature || this.transaction.asset.multiSignatureLegacy;
  }

  get publicKeysFromMultiSignatureAsset() {
    return this.isLegacyMultiSignature
      ? this.multiSignatureAsset.keysgroup.map((publicKey) => publicKey.slice(1))
      : this.multiSignatureAsset.publicKeys;
  }

  get assetField() {
    switch (this.transaction.type) {
      case MagistrateTransaction.BUSINESS_REGISTRATION:
        return this.transaction.asset.businessRegistration;
      case MagistrateTransaction.BUSINESS_UPDATE:
        return this.transaction.asset.businessUpdate;
      case MagistrateTransaction.BRIDGECHAIN_REGISTRATION:
        return this.transaction.asset.bridgechainRegistration;
      case MagistrateTransaction.BRIDGECHAIN_RESIGNATION:
        return this.transaction.asset.bridgechainResignation;
      case MagistrateTransaction.BRIDGECHAIN_UPDATE:
        return this.transaction.asset.bridgechainUpdate;
      default:
        return [];
    }
  }

  get morpheusOperations(): OperationDetails {
    return formatMorpheusOperations(this.transaction.asset);
  }

  get coeusAsset(): ICoeusAsset {
    return this.transaction.asset as ICoeusAsset;
  }

  private setActiveTab(active: string) {
    this.tabActive = active;
  }

  @Watch("transaction")
  public async onTransactionChanged() {
    this.updatePrice();
    this.handleMultipayment();
    this.getTimelockStatus();
    this.setInitialBlockHeight();
    await this.updateLayer2TxStatus();
  }

  @Watch("currencySymbol")
  public async onCurrencySymbolChanged() {
    await this.updatePrice();
  }

  @Watch("height")
  public onHeightChanged(newValue: number, oldValue: number) {
    if (!oldValue) {
      this.setInitialBlockHeight();
    }
  }

  public async mounted() {
    this.updatePrice();
    this.handleMultipayment();
    this.getTimelockStatus();
    await this.updateLayer2TxStatus();
  }

  private async updateLayer2TxStatus(): Promise<void> {
    if(isMorpheusTransaction(this.transaction.type, this.transaction.typeGroup)) {
      await morpheusTxProvider.load([this.transaction.id]);
    }
    else if(isCoeusTransaction(this.transaction.type, this.transaction.typeGroup)) {
      await coeusTxProvider.load([this.transaction.id]);
    }
  }

  private async updatePrice() {
    //this.price = await CryptoCompareService.dailyAverage(this.transaction.timestamp.unix);
  }

  private setInitialBlockHeight() {
    this.initialBlockHeight = this.height - this.transaction.confirmations;
  }

  private handleMultipayment() {
    // @ts-ignore
    if (this.isMultiPayment(this.transaction.type, this.transaction.typeGroup)) {
      // @ts-ignore
      this.multipaymentAmount = this.calculateMultipaymentAmount(this.transaction);
    }
  }

  private async getTimelockStatus() {
    // @ts-ignore
    if (this.isTimelock(this.transaction.type, this.transaction.typeGroup)) {
      const response = await TransactionService.findUnlockedForLocks([this.transaction.id]);
      if (response.data.length === 0) {
        const lock = await LockService.find(this.transaction.id);
        this.timelockStatus = lock.isExpired
          ? this.$t("TRANSACTION.TIMELOCK.EXPIRED")
          : this.$t("TRANSACTION.TIMELOCK.OPEN");
      } else if (response.data[0].type === CoreTransaction.TIMELOCK_CLAIM) {
        this.timelockStatus = this.$t("TRANSACTION.TIMELOCK.CLAIMED");
        this.timelockLink = response.data[0].id;
      } else if (response.data[0].type === CoreTransaction.TIMELOCK_REFUND) {
        this.timelockStatus = this.$t("TRANSACTION.TIMELOCK.REFUNDED");
        this.timelockLink = response.data[0].id;
      }
    } else {
      this.timelockStatus = this.$t("TRANSACTION.TIMELOCK.UNKNOWN");
    }
  }

  private bundleIndex(bundle: ISignedBundle): string {
    return this.coeusAsset.bundles.indexOf(bundle).toString();
  }
}
</script>

<style scoped>
.list-row-border-b-no-wrap > div:last-child {
  text-align: right;
}
.MorpheusNav {
  @apply .flex .items-end .mb-8 .border-b .whitespace-no-wrap .overflow-y-auto;
}

.MorpheusNav--tab {
  @apply .text-lg .text-theme-text-secondary .border-transparent .mr-4 .py-4 .px-2 .cursor-pointer .border-b-3;
}

.MorpheusNav--tab:hover {
  @apply .text-theme-text-primary .border-blue;
}

.MorpheusNav--tab.active {
  @apply .text-lg .border-blue .text-theme-text-primary;
}

.MorpheusNav--tab.disabled {
  @apply .pointer-events-none .text-theme-text-tertiary;
}

.MorpheusNav--tab > span {
  @apply .text-xs .text-theme-text-tertiary;
}

.MorpheusNav--tab.active > span {
  @apply .text-theme-text-secondary;
}
</style>
