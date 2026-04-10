<template>
  <div class="cesium-container">
    <div id="map" @contextmenu.prevent></div>

    <div class="tools-panel">
      <button
        class="action-btn path-btn"
        :class="{ 'is-active': activeMode === 'path' }"
        @click="startDrawFlightPath"
      >
        {{ activeMode === 'path' ? '左键画点画线，右键结束' : '规划无人机路径' }}
      </button>

      <button
        class="action-btn area-btn"
        :class="{ 'is-active': activeMode === 'area' }"
        @click="startMeasureArea"
      >
        {{ activeMode === 'area' ? '左键画点成面，右键结束' : '测量面积' }}
      </button>
    </div>

    <div class="tips-card">
      <div class="tips-title">Cesium 地图工具</div>
      <div class="tips-text">
        {{ activeTip }}
      </div>
      <div v-if="flightSummary" class="result-text path-result">{{ flightSummary }}</div>
      <div v-if="areaSummary" class="result-text area-result">{{ areaSummary }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import * as Cesium from 'cesium';
import { initViewer, viewer } from '@/cesiumTool/createViewer';
import { DrawFlightPathAction, type DrawFlightPathResult } from '@/cesiumTool/drawFlightPath';
import { DrawPolygonAction, type DrawPolygonResult } from '@/cesiumTool/drawPolygen';

type ActiveMode = 'idle' | 'path' | 'area';

const activeMode = ref<ActiveMode>('idle');
const flightSummary = ref('');
const areaSummary = ref('');

let flightPathAction: DrawFlightPathAction | null = null;
let polygonAction: DrawPolygonAction | null = null;

const activeTip = computed(() => {
  if (activeMode.value === 'path') {
    return '正在规划无人机路径：左键依次落点并自动连线，右键结束本次规划。';
  }

  if (activeMode.value === 'area') {
    return '正在测量面积：左键依次绘制地块顶点，右键结束并计算面积。';
  }

  return '可选择“规划无人机路径”或“测量面积”，两种工具互不影响。';
});

const stopAllDrawing = () => {
  flightPathAction?.deactivate();
  polygonAction?.deactivate();
  activeMode.value = 'idle';
};

const startDrawFlightPath = () => {
  if (!flightPathAction) return;

  stopAllDrawing();
  activeMode.value = 'path';
  flightSummary.value = '正在规划中，请继续左键落点，右键结束。';

  flightPathAction.activate((result: DrawFlightPathResult) => {
    console.log('--- 无人机路径规划完成 ---');
    console.log('1. 航线顶点坐标:', result.vertices);
    console.log('2. 航线长度(米):', result.lengthMeter);
    console.log('3. 航线长度(公里):', result.lengthKilometer);

    flightSummary.value = `已完成 ${result.vertices.length} 个航点规划，总航线长度约 ${result.lengthMeter} 米。`;
    activeMode.value = 'idle';
  });
};

const startMeasureArea = () => {
  if (!polygonAction) return;

  stopAllDrawing();
  activeMode.value = 'area';
  areaSummary.value = '正在测量中，请继续左键画点成面，右键结束。';

  polygonAction.activate((result: DrawPolygonResult) => {
    console.log('--- 面积测量完成 ---');
    console.log('1. 面积顶点坐标:', result.vertices);
    console.log('2. 面积(平方米):', result.areaMeter);
    console.log('3. 面积(亩):', result.areaMu);

    areaSummary.value = `已完成 ${result.vertices.length} 个顶点测量，面积约 ${result.areaMeter.toFixed(2)} 平方米 / ${result.areaMu} 亩。`;
    activeMode.value = 'idle';
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

    flightPathAction = new DrawFlightPathAction(viewer);
    polygonAction = new DrawPolygonAction(viewer);
  }
});

onUnmounted(() => {
  stopAllDrawing();
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
  flex-wrap: wrap;
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

.area-btn {
  background-color: #b45309;
}

.area-btn:hover {
  background-color: #92400e;
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
  width: min(360px, calc(100vw - 40px));
  padding: 14px 16px;
  color: #ecfeff;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.35);
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
}

.path-result {
  color: #67e8f9;
}

.area-result {
  color: #fde68a;
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
