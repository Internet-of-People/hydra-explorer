<template>
  <section class="page-section py-5 px-5 md:px-10 mb-5">
    <div class="text-lg my-5 wrap-all">{{ data }}</div>
  </section>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class DomainData extends Vue {
  @Prop({ required: true }) private data: unknown;
}
</script>