<template>
  <div id="app">
    <el-row>
      <el-col :span="8">
        <p>Stock:</p>
        <el-select
          v-model="selected_stock"
          filterable
          placeholder="Select stock type.."
          :loading="stock_select_loading"
          loading-text="Loading stocks..."
          :multiple="true"
          :disabled="chart_loading"
          :popper-append-to-body="false"
          @change="onStockChange"
        >
          <el-option
            v-for="item in stock_options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="chart_loading"
          >
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
        <p>Date Range:</p>
        <el-date-picker
          v-model="date_range"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          default-value="01-01-2010"
          format="dd-MM-yyyy"
          :clearable="false"
          :collapse-tags="true"
          @change="onDateChange"
        >
        </el-date-picker>
      </el-col>
    </el-row>
    <LineChart
      :chartData="chart_data"
      v-loading="chart_loading"
      :chartOptions="chart_options"
      :key="line_chart_key"
    />
    <el-table
      :data="table_data"
      v-if="selected_stock.length"
      max-height="500"
      row-key="_id"
      v-loading="chart_loading"
    >
      <el-table-column sortable prop="name" label="Stock" />
      <el-table-column sortable prop="open_price" label="Opening price" />
      <el-table-column sortable prop="high_price" label="Hight price" />
      <el-table-column sortable prop="low_price" label="Low price" />
      <el-table-column sortable prop="close_price" label="Closing price" />
      <el-table-column sortable prop="volume" label="Volume" />
      <el-table-column prop="date" label="Date" />
      <el-table-column sortable prop="market" label="Market" />
    </el-table>
  </div>
</template>

<script>
import { Select, Option, DatePicker, Table, TableColumn } from "element-ui";
import { getStocks, getStockInfoByName } from "./api";
import agg_data from "./assets/data/agg_data.json";
const LineChart = () => import("./components/LineChart.vue");
export default {
  name: "App",
  components: {
    LineChart,
    "el-select": Select,
    "el-option": Option,
    "el-date-picker": DatePicker,
    "el-table": Table,
    "el-table-column": TableColumn,
  },
  data() {
    return {
      chart_options: {
        axisXLabel: "Date",
        // axisYLabel: "Total Volume (1/1000) & Total Revenue",
        stroke: "#409EFF",
        circleColor: "#555",
        axisXGroupLabelGap: 15,
      },
      chart_data: [],
      agg_data: [],
      backup_chart_data: [],
      selected_stock: [],
      stock_options: [],
      stock_select_loading: true,
      stock_select_disabled: false,
      date_range: [
        new Date(agg_data[0].date),
        new Date(agg_data[agg_data.length - 1].date),
      ],
      stocks_data: {},
      table_data: [],
      chart_loading: false,
      line_chart_key: Date.now(),
    };
  },
  watch: {
    chart_data(newVal) {
      if (!this.selected_stock.length) return;
      let temp_arr = [];
      newVal.forEach((item) => {
        let f_index = temp_arr.findIndex((item1) => item1.name === item.name);
        if (f_index > -1) {
          temp_arr[f_index].children.push(item);
        } else {
          temp_arr.push({ ...item, children: [] });
        }
      });
      this.table_data = [...temp_arr];
    },
  },
  methods: {
    async initAggregateChart() {
      let temp_chart_data = [...this.agg_data];
      if (!temp_chart_data.length) {
        agg_data.forEach((item) => {
          temp_chart_data.push({
            group: "Volume (1/1000)",
            key: new Date(item.date),
            value: item.total_vol / 1000,
          });
          temp_chart_data.push({
            group: "Revenue",
            key: new Date(item.date),
            value: item.total_rev,
          });
        });
        this.agg_data = [...temp_chart_data];
      }
      this.chart_data = [];
      await this.$nextTick();
      const [start_date, end_date] = this.date_range;
      temp_chart_data = temp_chart_data.filter(
        (item1) => item1.key >= start_date && item1.key <= end_date
      );
      this.chart_data = [...temp_chart_data];
    },
    async poupulateStocks() {
      try {
        const data = await getStocks();
        data.result.forEach((item) => {
          this.stock_options.push({ label: item, value: item });
        });
      } catch (e) {
        console.error(e);
      } finally {
        this.stock_select_loading = false;
      }
    },
    async onStockChange(stocks, date_range, rand) {
      if (!stocks.length) {
        this.initAggregateChart();
        return;
      }
      this.chart_loading = true;
      let temp_data = [];
      for (const elem of stocks) {
        let data;
        if (elem in this.stocks_data) {
          // stock info exists
          data = this.stocks_data[elem];
        } else {
          data = await getStockInfoByName(elem);
          data = data.result;
          data = data.map((item) => ({
            ...item,
            open_price: parseFloat(item.open_price),
            high_price: parseFloat(item.high_price),
            low_price: parseFloat(item.low_price),
            close_price: parseFloat(item.close_price),
            group: item.name,
            key: new Date(item.date),
            value: parseFloat(item.close_price),
          }));
          this.$set(this.stocks_data, elem, data);
        }
        temp_data = [...temp_data, ...data];
      }
      await this.$nextTick();
      const [start_date, end_date] = date_range || this.date_range;
      temp_data = temp_data.filter(
        (item1) => item1.key >= start_date && item1.key <= end_date
      );
      this.chart_data = [...temp_data];
      this.chart_loading = false;
    },
    onDateChange(dates) {
      this.chart_data = [];
      this.$nextTick(() => {
        this.onStockChange(this.selected_stock, dates);
      });
    },
    columnDateSort(a, b) {
      return new Date(a) - new Date(b);
    },
  },
  mounted() {
    this.initAggregateChart();
    this.poupulateStocks();
  },
};
</script>

<style lang="scss">
#app {
  font-family: monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 60px 24px 0 24px;
}
</style>
