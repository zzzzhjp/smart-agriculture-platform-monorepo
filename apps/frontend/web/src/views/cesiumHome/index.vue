<template>
  <div class="cesium-container">
    <div id="map" @contextmenu.prevent></div>

    <div class="tools-panel">
      <button
        class="action-btn path-btn"
        :class="{ 'is-active': isDrawing }"
        @click="startDrawFlightPath"
      >
        {{ isDrawing ? '左键画点画线，右键结束' : '规划无人机路径' }}
      </button>
    </div>

    <div class="tips-card">
      <div class="tips-title">无人机路径规划</div>
      <div class="tips-text">左键依次落点并自动连线，右键结束本次规划。</div>
      <div v-if="flightSummary" class="result-text">{{ flightSummary }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as Cesium from 'cesium';
import { initViewer, viewer } from '@/cesiumTool/createViewer';
import { DrawFlightPathAction, type DrawFlightPathResult } from '@/cesiumTool/drawFlightPath';

const isDrawing = ref(false);
const flightSummary = ref('');
let drawAction: DrawFlightPathAction | null = null;

const startDrawFlightPath = () => {
  if (!drawAction || isDrawing.value) return;

  isDrawing.value = true;
  flightSummary.value = '正在规划中，请继续左键落点，右键结束。';

  drawAction.activate((result: DrawFlightPathResult) => {
    console.log('--- 无人机路径规划完成 ---');
    console.log('1. 航线顶点坐标:', result.vertices);
    console.log('2. 航线长度(米):', result.lengthMeter);
    console.log('3. 航线长度(公里):', result.lengthKilometer);

    flightSummary.value = `已完成 ${result.vertices.length} 个航点规划，总航线长度约 ${result.lengthMeter} 米。`;
    alert(`路径规划完成\n航点数量: ${result.vertices.length}\n航线长度: ${result.lengthMeter} 米`);
    isDrawing.value = false;
  });
};

onMounted(() => {
  initViewer('map');

  if (viewer) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(106.337, 29.9645, 400),
      duration: 2.5,
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-45.0),
        roll: 0.0
      }
    });

    drawAction = new DrawFlightPathAction(viewer);
  }
});

onUnmounted(() => {
  drawAction?.deactivate();
  if (viewer) {
    viewer.destroy();
  }
});
</script>

<style scoped>
.cesium-container {
  position: relative;
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}

.tools-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 999;
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 10px 15px;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.path-btn {
  background-color: #0f766e;
}

.path-btn:hover {
  background-color: #115e59;
}

.is-active {
  background-color: #fbbf24;
  color: #1f2937;
  animation: pulse 1.5s infinite;
}

.is-active:hover {
  background-color: #f59e0b;
}

.tips-card {
  position: absolute;
  top: 84px;
  left: 20px;
  z-index: 999;
  width: min(320px, calc(100vw - 40px));
  padding: 14px 16px;
  color: #ecfeff;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.25);
}

.tips-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 700;
}

.tips-text,
.result-text {
  font-size: 13px;
  line-height: 1.6;
}

.result-text {
  margin-top: 8px;
  color: #67e8f9;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
  }

  70% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(251, 191, 36, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
  }
}
</style>
