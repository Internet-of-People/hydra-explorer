<template>
  <section class="page-section py-5 px-5 md:px-10 mb-5">
    <div class="text-lg my-5 wrap-all">DNS Operations by {{ principal }}</div>
    <hr class="mt-5 mb-5 w-full">
    <TableWrapper
      v-bind="$attrs"
      :columns="columns"
      :rows="rows"
    >
      <template slot-scope="data">
        <div v-if="data.column.field === 'details'" class="text-sm">
          <div v-if="data.row.operation === 'register'">
            <table class="table-auto m-0">
              <tbody>
                <tr class="donttransform">
                  <td class="border px-4 py-2">Expires at Height</td>
                  <td class="border px-4 py-2">{{ data.row._op.expiresAtHeight }}</td>
                </tr>
                <tr class="donttransform">
                  <td class="border px-4 py-2">Registration Policy</td>
                  <td class="border px-4 py-2">{{ data.row._op.registrationPolicy }}</td>
                </tr>
                <tr class="donttransform">
                  <td class="border px-4 py-2">Data</td>
                  <td class="border px-4 py-2">
                    <button class="ml-0 p-2 button-lg text-xs" @click="onDataClick(data.row.operationIndex)">Open</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="data.row.operation === 'update'">
            <table class="table-auto">
              <tbody>
                <tr>
                  <td class="border px-4 py-2">Data</td>
                  <td class="border px-4 py-2">
                    <button class="ml-0 p-2 button-lg text-xs" @click="onDataClick(data.row.operationIndex)">Open</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="data.row.operation === 'renew'">
            <table class="table-auto">
              <tbody>
                <tr>
                  <td class="border px-4 py-2">Expires at Height</td>
                  <td class="border px-4 py-2">{{ data.row._op.expiresAtHeight }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="data.row.operation === 'transfer'">
            <table class="table-auto">
              <tbody>
                <tr>
                  <td class="border px-4 py-2">To Owner</td>
                  <td class="border px-4 py-2">{{ data.row._op.toOwner }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="data.row.operation === 'delete'">
            -
          </div>
        </div>
      </template>
    </TableWrapper>
  </section>
</template>
<script lang="ts">
import { CoeusAPI } from '../../iop/coeus-api';
import { ISignedBundle } from '../../iop/interfaces';
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class CoeusSignedOperations extends Vue {
  @Prop({ required: true }) private bundle: ISignedBundle;
  @Prop({ required: true }) private bundleIndex: string;
  @Prop({ required: true }) private txId: string;

  get columns() {
    return [
      {
        label: "Domain",
        field: "domain",
        thClass: "semibold w-1/6",
        tdClass: "break-all pt-0 text-sm",
        width: ' ',
      },
      {
        label: "Operation",
        field: "operation",
        thClass: "semibold w-1/6",
        tdClass: "break-all pt-0 text-sm",
        width: ' ',
      },
      {
        label: "Details",
        field: "details",
        thClass: "semibold w-4/6",
        tdClass: "break-all p-0",
      }
    ];
  }

  get principal() {
    return this.bundle.publicKey;
  }

  get rows() {
    const rows = [];
    const operations = this.bundle.operations;

    for(const operation of operations) {
      rows.push({
        domain: `${operation.name}`,
        operation: operation.type,
        _op: operation,
        operationIndex: operations.indexOf(operation),
      });
    }
    return rows;
  }

  private onDataClick(opIndex: number) {
    const operationIndex = opIndex.toString();
    this.$router.push({ name: 'coeus-data', params: { txId: this.txId, bundleIndex: this.bundleIndex, operationIndex}});
  }
}
</script>