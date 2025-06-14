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
    <!-- 生成图片按钮 -->
    <div class="flex justify-center mt-4">
      <button @click="generateImage" class="timetable-img-btn">
        <svg class="inline-block mr-2" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
        生成周课表图片
      </button>
    </div>
    <!-- 隐藏canvas用于绘图导出 -->
    <canvas ref="timetableCanvas" width="1024" height="1024" style="display:none;"></canvas>
    <!-- 图片弹窗 -->
    <div v-if="showImageModal" class="timetable-modal-mask">
      <div class="timetable-modal-content">
        <button @click="showImageModal=false" class="timetable-modal-close">×</button>
        <img :src="imageUrl" alt="周课表图片" class="timetable-modal-img" crossorigin="anonymous" />
        <div class="timetable-modal-tip">（移动端）长按图片可保存到相册</div>
        <a v-if="imageUrl" :href="imageUrl" download="周课表.png" class="timetable-download-btn">下载图片</a>
      </div>
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

.fixed {
  position: fixed;
}
.inset-0 {
  top: 0; left: 0; right: 0; bottom: 0;
}
.bg-black.bg-opacity-50 {
  background: rgba(0,0,0,0.5);
}
.max-h-\[80vh\] {
  max-height: 80vh;
}

.timetable-img-btn {
  background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 999px;
  padding: 0.7em 2.2em;
  box-shadow: 0 2px 8px rgba(56,189,248,0.12);
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.timetable-img-btn:hover {
  background: linear-gradient(90deg, #1d4ed8 0%, #0ea5e9 100%);
  box-shadow: 0 4px 16px rgba(56,189,248,0.18);
  transform: translateY(-2px) scale(1.03);
}

.timetable-modal-mask {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
.timetable-modal-content {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  padding: 1.2em 1em 1.5em 1em;
  position: relative;
  max-width: 98vw;
  max-height: 95vh;
  width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
@media (max-width: 600px) {
  .timetable-modal-content {
    width: 98vw;
    padding: 0.5em 0.2em 1em 0.2em;
    max-width: 99vw;
    max-height: 99vh;
  }
}
.timetable-modal-close {
  position: absolute;
  top: 0.3em;
  right: 0.7em;
  font-size: 2.1em;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  z-index: 2;
  transition: color 0.2s;
}
.timetable-modal-close:hover {
  color: #2563eb;
}
.timetable-modal-img {
  display: block;
  max-width: 90vw;
  max-height: 70vh;
  width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(56,189,248,0.10);
  margin: 0 auto;
}
@media (max-width: 600px) {
  .timetable-modal-img {
    max-width: 98vw;
    max-height: 60vh;
  }
}
.timetable-modal-content .timetable-modal-tip {
  text-align: center;
  color: #6b7280;
  margin-top: 0.7em;
  font-size: 0.98em;
  transition: color 0.2s;
}
@media (prefers-color-scheme: dark) {
  .timetable-modal-content {
    background: #23232a;
    color: #e6e6e6;
  }
  .timetable-modal-content .timetable-modal-tip {
    color: #b8c2cc;
  }
}

.timetable-download-btn {
  display: inline-block;
  margin: 1em auto 0 auto;
  padding: 0.5em 1.5em;
  background: linear-gradient(90deg, #38bdf8 0%, #2563eb 100%);
  color: #fff;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(56,189,248,0.12);
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
.timetable-download-btn:hover {
  background: linear-gradient(90deg, #0ea5e9 0%, #1d4ed8 100%);
  box-shadow: 0 4px 16px rgba(56,189,248,0.18);
  transform: translateY(-2px) scale(1.03);
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
  data() {
    return {
      showImageModal: false,
      imageUrl: ''
    }
  },
  computed: {
    weekDates() {
      return this.getWeekDates(this.selectedDate)
    },
    weekRange() {
      // 健壮性提升，避免Invalid Date
      if (!this.weekDates || this.weekDates.length < 7) return ''
      const start = dayjs(this.weekDates[0]).isValid() ? dayjs(this.weekDates[0]).format('MM.DD') : ''
      const end = dayjs(this.weekDates[6]).isValid() ? dayjs(this.weekDates[6]).format('MM.DD') : ''
      if (!start || !end) return ''
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
    },
    // 新增：生成图片方法
    generateImage() {
      const canvas = this.$refs.timetableCanvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 1024, 1024)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, 1024, 1024)
      // 字体整体放大
      const titleFont = 'bold 44px sans-serif'
      const classFont = 'bold 36px sans-serif'
      const rangeFont = '28px sans-serif'
      const headerFont = 'bold 26px sans-serif'
      const sectionFont = '20px sans-serif'
      const subjectFont = 'bold 22px sans-serif'
      const teacherFont = '18px sans-serif'
      // 标题
      ctx.font = titleFont
      ctx.fillStyle = '#222'
      ctx.textAlign = 'center'
      ctx.fillText('周课表', 512, 70)
      // 班级名（优先取本周第一个数据的Name或Class）
      let className = ''
      if (Array.isArray(this.data) && this.data.length > 0) {
        className = this.data[0]?.Name || this.data[0]?.Class || ''
      }
      let classY = 120
      if (className) {
        ctx.font = classFont
        ctx.fillStyle = '#2196f3'
        ctx.fillText(className, 512, classY)
        classY += 10 // 微调下方间距
      }
      // 周范围
      ctx.font = rangeFont
      ctx.fillStyle = '#666'
      const rangeY = className ? 160 : 120
      ctx.fillText(this.weekRange || '', 512, rangeY)
      // 表格参数
      // 表格整体下移，保证班级名在表头正上方
      const tableTop = className ? 200 : 170
      const tableLeft = 60
      const tableWidth = 904
      const tableHeight = 700 
      const rowCount = 9 
      const colCount = 8
      const rowHeight = tableHeight / (rowCount - 1)
      const colWidth = tableWidth / colCount
      // 画表头
      ctx.font = headerFont
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(tableLeft, tableTop, colWidth, rowHeight)
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(tableLeft + colWidth * (i + 1), tableTop, colWidth, rowHeight)
        ctx.fillStyle = '#222'
        ctx.textAlign = 'center'
        ctx.fillText(this.formatWeekday(i), tableLeft + colWidth * (i + 1) + colWidth / 2, tableTop + rowHeight / 2 + 10)
      }
      // 画时段列
      for (let i = 0; i < rowCount; i++) {
        ctx.fillStyle = '#f9fafb'
        ctx.fillRect(tableLeft, tableTop + rowHeight * i, colWidth, rowHeight)
        ctx.fillStyle = '#666'
        ctx.textAlign = 'center'
        ctx.font = sectionFont
        if (i > 0) {
          ctx.fillText(this.getSectionName(i - 1), tableLeft + colWidth / 2, tableTop + rowHeight * i + rowHeight / 2 + 8)
        } else {
          ctx.font = headerFont
          ctx.fillText('时段', tableLeft + colWidth / 2, tableTop + rowHeight / 2 + 10)
        }
      }
      // 画表格内容
      for (let row = 1; row < rowCount; row++) {
        for (let col = 1; col < colCount; col++) {
          const x = tableLeft + colWidth * col
          const y = tableTop + rowHeight * row
          ctx.fillStyle = '#fff'
          ctx.fillRect(x, y, colWidth, rowHeight)
          ctx.strokeStyle = '#e5e7eb'
          ctx.strokeRect(x, y, colWidth, rowHeight)
          // 填充课程内容
          const dayData = this.data[col - 1]
          const section = dayData?.Sections?.[row - 1]
          const subject = section?.Dts?.[0]?.Subject || '-'
          const teacher = section?.Dts?.[0]?.Teacher || '-'
          ctx.fillStyle = '#222'
          ctx.font = subjectFont
          ctx.textAlign = 'center'
          ctx.fillText(subject, x + colWidth / 2, y + rowHeight / 2 - 6)
          ctx.font = teacherFont
          ctx.fillStyle = '#888'
          ctx.fillText(teacher, x + colWidth / 2, y + rowHeight / 2 + 22)
        }
      }
      // 画表格线
      ctx.strokeStyle = '#d1d5db'
      for (let i = 0; i <= rowCount; i++) {
        ctx.beginPath()
        ctx.moveTo(tableLeft, tableTop + i * rowHeight)
        ctx.lineTo(tableLeft + tableWidth, tableTop + i * rowHeight)
        ctx.stroke()
      }
      for (let i = 0; i <= colCount; i++) {
        ctx.beginPath()
        ctx.moveTo(tableLeft + i * colWidth, tableTop)
        ctx.lineTo(tableLeft + i * colWidth, tableTop + rowHeight * rowCount)
        ctx.stroke()
      }
      // 生成图片并在弹窗中展示，兼容不支持blob的浏览器
      if (canvas.toBlob) {
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            this.imageUrl = url
            this.showImageModal = true
          } else {
            // fallback
            this.imageUrl = canvas.toDataURL('image/png')
            this.showImageModal = true
          }
        }, 'image/png')
      } else {
        this.imageUrl = canvas.toDataURL('image/png')
        this.showImageModal = true
      }
    }
  }
}
</script>