<template>
  <div class="w-full">
    <h3 class="text-lg font-semibold mb-4">{{ data.Class }} 周课表</h3>
    
    <div class="relative max-w-full overflow-x-auto">
      <el-scrollbar>
        <table class="w-full border-collapse table-auto">
          <thead>
            <tr>
              <th class="header-cell time-cell-header whitespace-nowrap">时段</th>
              <th 
                v-for="(date, index) in weekDates" 
                :key="date"
                class="header-cell min-w-[120px]"
              >
                <div class="flex flex-col items-center justify-center h-full">
                  <span>{{ formatWeekday(index) }}</span>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(_, sectionIndex) in 8" :key="sectionIndex">
              <td class="time-cell whitespace-nowrap">
                {{ getSectionName(sectionIndex) }}
              </td>
              <td 
                v-for="(dayData, dayIndex) in data" 
                :key="dayIndex"
                class="lesson-cell"
              >
                <div 
                  v-if="dayData?.Sections[sectionIndex]" 
                  class="flex flex-col items-center justify-center h-full min-h-[60px]"
                >
                  <div class="font-medium leading-tight">
                    {{ dayData.Sections[sectionIndex].Dts[0]?.Subject || '-'  }}
                  </div>
                  <div class="text-sm text-gray-600 leading-tight">
                    {{ dayData.Sections[sectionIndex].Dts[0]?.Teacher || '-'  }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-scrollbar>
    </div>
  </div>
</template>

<style scoped>
.header-cell {
  @apply px-3 py-2 text-center bg-gray-100 text-gray-700 align-middle;
}

.time-cell {
  @apply px-3 py-2 text-center text-gray-600 bg-gray-50;
}

.lesson-cell {
  @apply px-2 py-1 text-center align-middle border border-gray-200;
}

/* 移动端调整 */
@media (max-width: 640px) {
  .time-cell-header,
  .time-cell {
    display: none;
  }
  table {
    display: inline-block;
  }
}

@media (min-width: 1024px) {
  table {
    display: table;
    table-layout: fixed;
    width: 100%;
  }

  /* 桌面端时段列 */
  thead tr th:first-child {
    width: 100px !important;
  }
  /* 桌面端其他列 */
  thead tr th:not(:first-child) {
    width: calc((100% - 100px) / 7) !important;
    min-width: 0 !important; /* 覆盖 min-w-[120px] */
  }
}

table {
  min-width: 800px;
  min-height: 33px;
  line-height: 33px;
  text-align: center;
  width: 100%;
}


.font-medium.leading-tight {
    font-size: large;
    font-weight: bold;
}

.text-sm.text-gray-600.leading-tight {
    font-size: medium;
    color: gray;
}

tr:hover td {
  @apply bg-gray-50;
}

@media (max-width: 480px) {
  .header-cell {
    @apply px-1.5 py-1 text-xs;
  }
  .time-cell {
    @apply px-1.5 text-xs;
  }
  .lesson-cell {
    @apply px-0.5 py-0 text-xs;
  }
}
</style>

<script>
import dayjs from 'dayjs'

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    selectedDate: {
      type: String,
      required: true
    }
  },
  computed: {
    weekDates() {
      return this.getWeekDates(this.selectedDate)
    },
    weekRange() {
      const start = dayjs(this.weekDates[0]).format('MM.DD')
      const end = dayjs(this.weekDates[6]).format('MM.DD')
      return `${start} - ${end}`
    }
  },
  methods: {
    formatWeekday(index) {
      return ['日', '一', '二', '三', '四', '五', '六'][index]
    },
    formatTime(start, end) {
      return `${start.slice(0, 5)}-${end.slice(0, 5)}`
    },
    getSectionName(index) {
      return [
        '上午第一节', '上午第二节', '上午第三节', 
        '上午第四节', '上午第五节', '下午第一节',
        '下午第二节', '下午第三节' 
      ][index]
    },
    getWeekDates(dateStr) {
      const date = dayjs(dateStr)
      const start = date.startOf('week')
      return Array.from({ length: 7 }).map((_, i) => 
        start.add(i, 'day').format('YYYY-MM-DD')
      )
    }
  }
}
</script>