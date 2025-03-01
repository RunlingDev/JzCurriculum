<template>
  <div v-if="data">
    <h3 class="text-lg font-semibold mb-4">{{ data.Class }} 课程表</h3>
    
    <div class="grid timetable-grid">
      <!-- 时间表头 -->
      <div class="header-cell">时段</div>
      <div class="header-cell">科目</div>
      <div class="header-cell">任课教师</div>
      <div class="header-cell">时间</div>

      <!-- 课程内容 -->
      <template v-for="(section, index) in data.Sections" :key="section.SectionId">
        <div class="time-cell">{{ getSectionName(index) }}</div>
        <div class="lesson-cell">{{ section.Dts[0]?.Subject || '自习' }}</div>
        <div class="lesson-cell">{{ section.Dts[0]?.Teacher || '-' }}</div>
        <div class="time-cell">{{ formatTime(section.StartTime, section.EndTime) }}</div>
      </template>
    </div>
  </div>
</template>

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

<style scoped>
.timetable-grid {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 640px) {
  .timetable-grid > div {
    @apply text-sm p-1;
  }
}
</style>