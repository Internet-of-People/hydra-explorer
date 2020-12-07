<template>
    <div class="text-sm my-5 wrap-all">
<pre>
{{ JSON.stringify(data, undefined, 2) }}
</pre>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class DomainData extends Vue {
  @Prop({ required: true }) private data: unknown;
}
</script>