<template>
  <div>
    <h3 class="text-lg font-semibold mb-4">周课表（{{ weekRange }}）</h3>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="header-cell">时段</th>
            <th 
              v-for="(date, index) in weekDates" 
              :key="date"
              class="header-cell"
            >
              {{ formatWeekday(index) }}<br>
              {{ date.slice(5) }}
            </th>
          </tr>
        </thead>
        
        <tbody>
          <tr v-for="(_, sectionIndex) in 8" :key="sectionIndex">
            <td class="time-cell">
              {{ getSectionName(sectionIndex) }}
            </td>
            <td 
              v-for="(dayData, dayIndex) in data" 
              :key="dayIndex"
              class="lesson-cell"
            >
              <div v-if="dayData?.Sections[sectionIndex]">
                <div class="font-medium">
                  {{ dayData.Sections[sectionIndex].Dts[0]?.Subject }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ dayData.Sections[sectionIndex].Dts[0]?.Teacher }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ formatTime(
                    dayData.Sections[sectionIndex].StartTime,
                    dayData.Sections[sectionIndex].EndTime
                  ) }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

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
        '早读', '第一节', '第二节', '第三节', 
        '第四节', '第五节', '午休', '第六节',
        '第七节', '第八节'
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

<style scoped>
table {
  @apply min-w-[800px];
}

th, td {
  @apply p-2 border border-gray-200;
}

tr:hover td {
  @apply bg-gray-50;
}
</style>