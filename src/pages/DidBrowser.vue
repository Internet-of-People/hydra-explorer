<template>
  <div class="max-w-2xl mx-auto md:pt-5">
    <ContentHeader>{{ $t("PAGES.DID_BROWSER.TITLE") }}</ContentHeader>

    <section class="page-section mb-5 py-5 md:py-10">
      <div class="mx-5 sm:mx-10">
        {{ $t('PAGES.DID_BROWSER.SEARCH.DESCRIPTION') }}
        <div class="sm:flex w-full justify-between mt-5">
          <div class="sm:w-2/5 mb-4 lg:mb-0">
            <InputText
              :label="$t('PAGES.DID_BROWSER.SEARCH.DID_INPUT')"
              name="did"
              class="pt-0"
              :value="did"
              @input="onDidChange"
            />
          </div>
          <div class="sm:w-1/5 lg:w-64 mb-4 lg:mb-0">
            <InputNumber
              :label="$t('PAGES.DID_BROWSER.SEARCH.AT_HEIGHT_INPUT')"
              name="at-height"
              @input="onHeightChange"
            />
          </div>
          <div class="sm:w-1/5 sm:flex-row lg:w-64 mb-4 lg:mb-0 text-right">
            <button class="button-lg h-full w-full" @click="onSearchClick">Search</button>
          </div>
        </div>
        <div v-if="error" class="mt-10 text-red text-center semibold">
          {{ $t("PAGES.DID_BROWSER.SEARCH.ERROR") }}
        </div>
      </div>
    </section>

    <section v-if="didDocument" class="mb-5 bg-theme-feature-background xl:rounded-lg flex flex-col md:flex-row items-center px-5 sm:px-10 pt-5 sm:py-8">
      <div class="sm:flex items-center flex-auto w-full md:w-auto mb-5 md:mb-0 truncate">
        <div class="flex-auto min-w-0">
          <div class="text-grey mb-2">
            {{ $t("PAGES.DID_BROWSER.TABLE.DID_COL_HEADER") }}
          </div>
          <div class="flex">
            <div class="text-xl text-white semibold truncate">
              <span class="mr-2">
                {{ didDocument.did }}
              </span>
            </div>
          </div>
        </div>

        <div class="sm:flex sm:w-full sm:pt-0 pt-5 md:block md:w-auto justify-between whitespace-no-wrap">
          <div class="flex-auto min-w-0 mb-2 text-grey">
            <span>{{ $t("PAGES.DID_BROWSER.TABLE.HEIGHT_COL_HEADER") }}</span>
            <span class="semibold">
              {{ didDocument.queriedAtHeight }}
            </span>
          </div>
          <div class="flex text-xl text-white">
            <span class="mr-1">{{ $t("PAGES.DID_BROWSER.TABLE.TOMBSTONED_COL_HEADER") }}</span>
            <span :class="`semibold text-${(didDocument.tombstoned) ? 'red' : 'green'}`">
              {{ $t("PAGES.DID_BROWSER.TABLE." + (didDocument.tombstoned ? "TOMBSTONED_YES" : "TOMBSTONED_NO")) }}
              <span v-if="didDocument.tombstoned">{{ $t("PAGES.DID_BROWSER.TABLE.TOMBSTONED_HEIGHT", [didDocument.tombstonedAtHeight]) }}</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="didDocument" class="mb-5 page-section xl:rounded-lg items-center px-5 sm:px-10 py-8">
      <nav class="MorpheusNav">
        <div 
          :class="{ active: isKeysTabActive }"
          class="MorpheusNav--tab"
          @click="setActiveTab('keys')"
        >
          Keys
          <span>{{ didDocument.keys.length }}</span>
        </div>
        <div 
          :class="{ active: isRightsTabActive }"
          class="MorpheusNav--tab"
          @click="setActiveTab('rights')"
        >
          Rights
        </div>
        <div 
          :class="{ active: isOperationsTabActive }"
          class="MorpheusNav--tab"
          @click="setActiveTab('operations')"
        >
          History
        </div>
      </nav>

      <TableWrapper
        :columns="keyColumns"
        :rows="keys"
        no-data-message="No Keys"
        v-if="isKeysTabActive"
      >
        <template slot-scope="data">
          <div v-if="data.column.field === 'index'">
            #{{ data.row.index }}
          </div>
          <div v-if="data.column.field === 'auth'">
            {{ data.row.auth }}
          </div>
          <div v-if="data.column.field === 'rights'">
            <ul>
              <li
                :key="item"
                v-for="(item) in data.row.rights"
              >
                {{ item }}
              </li>
            </ul>
          </div>
          <div v-if="data.column.field === 'validFromHeight'">
            {{ showNullableText(data.row.validFromHeight) }}
          </div>
          <div v-if="data.column.field === 'validUntilHeight'">
            {{ showNullableText(data.row.validUntilHeight) }}
          </div>
          <div v-if="data.column.field === 'valid'">
            <strong>
              <SvgIcon v-if="data.row.valid" name="forging" class="text-green ml-2" view-box="0 0 12 12" style="display: inline;" />
              <SvgIcon v-else name="cross" class="text-red ml-2" view-box="0 0 12 12" style="display: inline;" />
            </strong>
          </div>
        </template>
      </TableWrapper>

      <TableWrapper
        :columns="rightColumns"
        :rows="rights"
        no-data-message="No Rights"
        v-if="isRightsTabActive"
      >
        <template slot-scope="data">
          <div v-if="data.column.field === 'right'">
            {{ data.row.right }}
          </div>
          <div v-if="data.column.field === 'keyLink'">
            {{ data.row.keyLink }}
          </div>
          <div v-if="data.column.field === 'valid'">
            <strong>
              <SvgIcon v-if="data.row.valid" name="forging" class="text-green ml-2" view-box="0 0 12 12" style="display: inline;" />
              <SvgIcon v-else name="cross" class="text-red ml-2" view-box="0 0 12 12" style="display: inline;" />
            </strong>
          </div>
        </template>
      </TableWrapper>

      <TableWrapper
        :columns="operationColumns"
        :rows="operations"
        no-data-message="No Operations"
        v-if="isOperationsTabActive"
      >
        <template slot-scope="data">
          <div v-if="data.column.field === 'confirmed'">
            <SvgIcon v-if="data.row.confirmed" name="forging" class="text-green" view-box="0 0 22 22" style="display:inline;" />
            <SvgIcon v-else name="cross" class="text-red" view-box="0 0 22 22" style="display:inline;" />
          </div>
          <div v-if="data.column.field === 'operation'">
            <ul>
              <li
                :key="detail"
                v-for="(detail,index) in data.row.operation"
              >
                <strong v-if="index===0">{{ detail }}</strong>
                <span class="text-sm pl-2" v-else>{{ detail }}</span>
              </li>
            </ul>
          </div>
          <div v-if="data.column.field === 'blockHeight'">
            {{ data.row.blockHeight }}
          </div>
          <div v-if="data.column.field === 'transactionId'">
            <RouterLink :to="`/transaction/${data.row.transactionId}`">{{ data.row.transactionId }}</RouterLink>
          </div>
        </template>
      </TableWrapper>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Route } from "vue-router";
import { InputText, InputNumber } from "../components/search/input";
import { MorpheusAPI } from "../iop/morpheus-api";
import { IDidDocumentData, ALL_RIGHTS, IKeyRightHistory, IOperationData, DidOperation } from '../iop/interfaces';
import { formatMorpheusSignableOperation } from '../iop/utils';

Component.registerHooks(["beforeRouteEnter"]);

@Component({
  components: {
    InputNumber,
    InputText,
  },
})
export default class MorpheusBrowserPage extends Vue {
  private did = '';
  private atHeight: number;
  private didDocument: IDidDocumentData = null;
  private operationAttempts: DidOperation[] = null;
  private tabActive = 'keys';
  private error = false;

  get rights() {
    if(!this.didDocument) {
      return [];
    }
    const rights = [];

    for(const right of ALL_RIGHTS) {
      const rightHistories: IKeyRightHistory[] = this.didDocument.rights[right];

      for(const history of rightHistories) {
        const keyIndex = history.keyLink.slice(1);
        if (this.didDocument.keys[keyIndex].valid) {
          rights.push({
            right,
            keyLink: history.keyLink,
            valid: history.valid,
          });
        }
      }
    }
    
    return rights;
  }

  get keys() {
    if(!this.didDocument) {
      return [];
    }
    const keys = [];

    for(const key of this.didDocument.keys) {
      const keyRights = [];

      for(const right of ALL_RIGHTS) {
        const rightHistories: IKeyRightHistory[] = this.didDocument.rights[right];

        for(const history of rightHistories) {
          if(
            history.keyLink.startsWith('#') && 
            parseInt(history.keyLink.substring(1), 10) === key.index &&
            history.valid
          ) {
            keyRights.push(right);
          }
        }
      }

      keys.push({
        index: key.index,
        auth: key.auth,
        validFromHeight: key.validFromHeight,
        validUntilHeight: key.validUntilHeight,
        valid: key.valid,
        rights: keyRights
      });
    }
    return keys;
  }

  get operations() {
    return this.operationAttempts.map((attempt) => {
      return {
        confirmed: attempt.valid,
        operation: formatMorpheusSignableOperation(attempt.data),
        blockHeight: attempt.blockHeight,
        transactionId: attempt.transactionId,
      };
    });
  }

  get keyColumns() {
    return [
      {
        label: 'Index', 
        field: 'index', 
        thClass: "start-cell semibold",
        tdClass: "start-cell",
      },
      {
        label: 'Auth',
        field: "auth",
        thClass: "semibold",
        tdClass: "break-all",
      },
      {
        label: 'Rights',
        field: "rights",
        thClass: "semibold",
        tdClass: "break-all",
      },
      {
        label: 'Valid From',
        field: "validFromHeight",
        thClass: "semibold",
        tdClass: "break-all",
      },
      {
        label: 'Valid Until',
        field: "validUntilHeight",
        thClass: "semibold",
        tdClass: "break-all",
      },
      {
        label: 'Valid',
        field: "valid",
        thClass: "semibold",
        tdClass: "break-all",
      },
    ];
  }

  get rightColumns() {
    return [
      {
        label: 'Right', 
        field: 'right', 
        thClass: "start-cell semibold",
        tdClass: "start-cell",
      },
      {
        label: 'Key Link',
        field: "keyLink",
        thClass: "semibold",
        tdClass: "break-all",
      },
      {
        label: 'Valid',
        field: "valid",
        thClass: "semibold",
        tdClass: "break-all",
      },
    ];
  }

  get operationColumns() {
    return [
      {
        label: 'Confirmed', 
        field: 'confirmed', 
        thClass: "semibold",
        tdClass: "text-center",
      },
      {
        label: 'Operation', 
        field: 'operation', 
        thClass: "semibold",
        tdClass: "break-all",
      },
      {
        label: 'At Height', 
        field: 'blockHeight', 
        thClass: "semibold",
        tdClass: "break-all",
      },
      {
        label: 'Tx ID', 
        field: 'transactionId', 
        thClass: "semibold",
        tdClass: "break-all",
      },
    ];
  }

  get isKeysTabActive() {
    return this.tabActive === "keys";
  }

  get isRightsTabActive() {
    return this.tabActive === "rights";
  }

  get isOperationsTabActive() {
    return this.tabActive === "operations";
  }

  public async beforeRouteEnter(to: Route, from: Route, next: (vm: any) => void) {
    try {
      next((vm) => {
        if(to.params.did) {
          vm.did = to.params.did;
          vm.search();
        }
      });
    }
    catch(e) {
      console.log(e);
    }
  }

  private showNullableText(text: string|null) {
    return text ? text : '-';
  }

  private setActiveTab(active: string) {
    this.tabActive = active;
  }

  private onDidChange(event: any): void {
    const { name, value } = event.target;
    this.did = value;
  }

  private onHeightChange(event: any): void {
    const { name, value } = event.target;
    this.atHeight = !value ? undefined : parseInt(value, 10);
  }

  private onSearchClick(): void {
    const path = `/did-browser/${this.did}`;
    if(this.did) {
      if(this.$route.path !== path) {
        this.$router.push(path);
      }
      else {
        this.search();
      }
    }
  }

  private async search(): Promise<void> {
    try {
      this.error = false;
      const results = await Promise.all([
        MorpheusAPI.getDidDocument(this.did, this.atHeight),
        MorpheusAPI.getOperationsAttempts(this.did, this.atHeight),
      ]);
      this.didDocument = results[0];
      this.operationAttempts = results[1];
    } catch(e) {
      this.error = true;
    }
  }
}
</script>

<style scoped>
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