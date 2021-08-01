<template>
  <d3MultiLine
    :data="chartData"
    :options="chartOptions"
    width="100%"
    height="500px"
  />
</template>

<script>
import { d3MultiLine } from "d3-vs";

export default {
  name: "LineChart",
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
    chartOptions: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    d3MultiLine,
  },
  data() {
    return {};
  },
};
</script>
