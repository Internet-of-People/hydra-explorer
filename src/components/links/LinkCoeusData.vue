<template>
  <RouterLink :to="{ name: 'coeus-data', params: { id, bundleIndex, operationIndex } }" class="flex items-center whitespace-no-wrap">
  </RouterLink>
</template>

<script lang="ts">
import { IDataOperation } from "../../iop/interfaces";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LinkCoeusData extends Vue {
  @Prop({ required: true }) public operation: IDataOperation;
  @Prop({ required: true }) public id: string;
  @Prop({ required: true }) public bundleIndex: string;
  @Prop({ required: true }) public operationIndex: string;
}
</script>