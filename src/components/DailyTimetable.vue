<template>
  <div v-if="data">
    <h3 class="text-lg font-semibold mb-4">{{ data.Class }} 课程表</h3>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse table-auto">
        <thead>
          <tr>
            <th class="header-cell">时段</th>
            <th class="header-cell">科目</th>
            <th class="header-cell">教师</th>
            <th class="header-cell">时间</th>
          </tr>
        </thead>
        
        <tbody>
          <tr v-for="(section, index) in data.Sections" :key="section.SectionId">
            <td class="time-cell whitespace-nowrap">{{ getSectionName(index) }}</td>
            <td class="lesson-cell">{{ section.Dts[0]?.Subject || "-" }}</td>
            <td class="lesson-cell">{{ section.Dts[0]?.Teacher || "-" }}</td>
            <td class="time-cell whitespace-nowrap">{{ formatTime(section.StartTime, section.EndTime) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header-cell {
  @apply px-4 py-2 text-center bg-gray-100 font-medium text-gray-700 border-b-2 border-gray-200;
}

.time-cell {
  @apply px-4 py-2 text-center text-gray-600 whitespace-nowrap;
  width: 30%;
}

.lesson-cell {
  @apply px-4 py-2 text-center text-gray-800;
}

table {
  @apply min-w-full;
  text-align: center;
}

tr {
  @apply border-t border-gray-200;
}

td {
  @apply border-b border-gray-200;
}

@media (max-width: 640px) {
  .header-cell,
  .time-cell,
  .lesson-cell {
    @apply px-2 py-1 text-sm;
  }
}
</style>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatTime(start, end) {
      return `${start.slice(0, 5)} - ${end.slice(0, 5)}`
    },
    getSectionName(index) {
      const sections = [
        '上午第一节', '上午第二节', '上午第三节', 
        '上午第四节', '上午第五节', '下午第一节',
        '下午第二节', '下午第三节' 
      ]
      return sections[index] || `第${index+1}节`
    }
  }
}
</script>