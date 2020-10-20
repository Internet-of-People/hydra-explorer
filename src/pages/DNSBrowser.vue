<template>
  <div class="max-w-2xl mx-auto md:pt-5">
    <ContentHeader>{{ $t("PAGES.DNS_BROWSER.TITLE") }}</ContentHeader>

    <section class="page-section mb-5 py-5 md:py-10">
      <div class="mx-5 sm:mx-10">
        {{ $t('PAGES.DNS_BROWSER.SEARCH.DESCRIPTION') }}

        <div class="w-full justify-between mt-5">
          <div class="mb-4 lg:mb-0">
            <InputText
              :label="$t('PAGES.DNS_BROWSER.SEARCH.DOMAIN_INPUT')"
              name="domain"
              class="pt-0"
              :value="domain"
              @input="onDomainChange"
            />
          </div>
        </div>
        <div class="mt-3">
          <button class="ml-0 button-lg" @click="onSearchClick">{{ $t('PAGES.DNS_BROWSER.SEARCH.SEARCH_BUTTON') }}</button>
        </div>
      </div>
    </section>

    <section v-if="domainNotFound" class="mb-5 page-section xl:rounded-lg px-5 sm:px-10 pt-5 sm:py-8">
      <h1 class="text-3xl text-center mb-8">
        {{ $t('PAGES.DNS_BROWSER.SEARCH.DOMAIN_NOT_FOUND') }}
      </h1>
      <div class="text-center">
        <img v-if="!nightMode" class="mx-auto" src="@/assets/images/not-found/light.png" />
        <img v-else class="mx-auto" src="@/assets/images/not-found/dark.png" />
      </div>
    </section>

    <section v-if="domainData && domainMeta" class="mb-5 bg-theme-feature-background xl:rounded-lg flex flex-col md:flex-row items-center px-5 sm:px-10 pt-5 sm:py-8">
      <div class="sm:flex items-center flex-auto w-full md:w-auto mb-5 md:mb-0 truncate">
        <div class="flex-auto min-w-0">
          <div class="text-grey mb-2">
            {{ $t("PAGES.DNS_BROWSER.TABLE.DOMAIN_COL_HEADER") }}
          </div>
          <div class="flex">
            <div class="text-xl text-white semibold truncate">
              <span class="mr-2">
                {{ domain }}
              </span>
            </div>
          </div>
        </div>

        <div class="sm:flex sm:w-full sm:pt-0 pt-5 md:block md:w-auto justify-between whitespace-no-wrap">
          <div class="flex-auto min-w-0 mb-2 text-grey">
            <span>{{ $t("PAGES.DNS_BROWSER.TABLE.EXPIRES_AT_HEIGHT_COL_HEADER") }}</span>
            <span class="semibold">
              {{ domainMeta.expiresAtHeight }}
            </span>
          </div>
          <div class="flex text-xl text-white">
            <span class="mr-1">{{ $t("PAGES.DNS_BROWSER.TABLE.EXPIRED_COL_HEADER") }}</span>
            <span :class="`semibold text-${isExpired ? 'red' : 'green'}`">
              {{ $t("PAGES.DNS_BROWSER.TABLE." + (isExpired ? "EXPIRED_YES" : "EXPIRED_NO")) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="domainData && domainMeta" class="mb-5 page-section xl:rounded-lg items-center px-5 sm:px-10 py-8">
      <div v-if="domainMeta" class="list-row-border-b">
        <div class="sm:flex w-full justify-between">
          <div class="sm:w-2/5 lg:w-1/6 mr-3 font-bold">{{ $t("PAGES.DNS_BROWSER.TABLE.OWNER") }}</div>
          <div class="sm:w-1/5 lg:w-5/6"><code>{{ domainMeta.owner }}</code></div>
        </div>
      </div>
      <div v-if="domainMeta" class="list-row-border-b">
        <div class="sm:flex w-full justify-between">
          <div class="sm:w-2/5 lg:w-1/6 mr-3 font-bold">{{ $t("PAGES.DNS_BROWSER.TABLE.REGISTRATION_POLICY") }}</div>
          <div class="sm:w-1/5 lg:w-5/6"><code>{{ domainMeta.registrationPolicy }}</code></div>
        </div>
      </div>
      <div v-if="domainMeta" class="list-row-border-b">
        <div class="sm:flex w-full justify-between">
          <div class="sm:w-2/5 lg:w-1/6 mr-3 font-bold">{{ $t("PAGES.DNS_BROWSER.TABLE.EXPIRES_AT_HEIGHT") }}</div>
          <div class="sm:w-1/5 lg:w-5/6">
            <code>{{ domainMeta.expiresAtHeight }} <template v-if="isExpired">- {{ $t("PAGES.DNS_BROWSER.TABLE.EXPIRED") }}</template></code>
            <SvgIcon v-if="isExpired" name="cross" class="text-red ml-2" view-box="0 0 12 12" style="display: inline;" />
          </div>
        </div>
      </div>
      <div v-if="domainData" class="list-row-border-b">
        <div class="sm:flex w-full justify-between">
          <div class="sm:w-2/5 lg:w-1/6 mr-3 font-bold">
            Data
            <button class="mt-3 ml-0 p-2 button-lg text-xs" @click="onDirectLinkClick">{{ $t("PAGES.DNS_BROWSER.TABLE.DIRECT_LINK") }}</button>
          </div>
          <div class="sm:w-1/5 lg:w-5/6">
<pre>
{{ JSON.stringify(domainData.data, null, 2) }}
</pre>
          </div>
        </div>
      </div>
      <div v-if="domainChildren" class="list-row-border-b">
        <div class="sm:flex w-full justify-between">
          <div class="sm:w-2/5 lg:w-1/6 mr-3 font-bold">{{ $t("PAGES.DNS_BROWSER.TABLE.SUBDOMAINS") }}</div>
          <div class="sm:w-1/5 lg:w-5/6">
            <code>
              <ul v-if="domainChildren.children.length">
                <li
                  :key="child"
                  v-for="(child) in domainChildren.children"
                >
                  {{ child }}
                </li>
              </ul>
              <template v-else>
                {{ $t("PAGES.DNS_BROWSER.TABLE.NO_SUBDOMAINS") }}
              </template>
            </code>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Route } from "vue-router";
import { mapGetters } from "vuex";
import store from "@/store";
import { CoeusAPI } from "../iop/coeus-api";
import { InputText } from "../components/search/input";
import { ICoeusDomainChildren, ICoeusDomainData, ICoeusDomainMeta } from "../iop/interfaces";

Component.registerHooks(["beforeRouteEnter"]);

@Component({
  components: { InputText },
  computed: {
    ...mapGetters("ui", ["nightMode"]),
  },
})
export default class MorpheusBrowserPage extends Vue {
  private domain = '';
  private error = false;
  private domainNotFound = false;
  private domainData: ICoeusDomainData = null;
  private domainMeta: ICoeusDomainMeta = null;
  private domainChildren: ICoeusDomainChildren = null;

  private get currentHeight(): number {
    return store.getters["network/height"];
  }

  private get isExpired(): boolean {
    return this.domainMeta.expiresAtHeight < this.currentHeight;
  }

  public async beforeRouteEnter(to: Route, from: Route, next: (vm: any) => void) {
    try {
      next((vm) => {
        
        if(to.params.domain) {
          vm.domain = to.params.domain;
          vm.search();
        }
      });
    }
    catch(e) {
      console.log(e);
    }
  }

  private onSearchClick(): void {
    const path = `/dns-browser/${this.domain}`;
    if(this.domain) {
      if(this.$route.path !== path) {
        this.$router.push(path);
      }
      else {
        this.search();
      }
    }
  }

  private onDirectLinkClick(): void {
    const url = `${CoeusAPI.getBaseUrl()}/resolve/${this.domain}`;
    window.open(url,'_blank');
  }

  private onDomainChange(event: any): void {
    const { value } = event.target;
    this.domain = value;
  }

  private async search(): Promise<void> {
    try {
      this.error = false;
      this.domainNotFound = false;
      const x =await CoeusAPI.getDomainData(this.domain);
      const results = await Promise.all([
        CoeusAPI.getDomainData(this.domain),
        CoeusAPI.getDomainMeta(this.domain),
        CoeusAPI.getDomainChildren(this.domain),
      ]);
      if(!results[0]) {
        this.domainNotFound = true;
        return;
      }
      this.domainData = results[0];
      this.domainMeta = results[1];
      this.domainChildren = results[2];
    } catch(e) {
      this.error = true;
    }
  }
}
</script>