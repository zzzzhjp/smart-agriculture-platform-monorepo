import * as Cesium from 'cesium';

// 全局保存 viewer 实例，不要用 Vue 的 ref 或 reactive 包裹它！
// 这样可以在其他的工具函数或组件中直接引入使用
export let viewer: Cesium.Viewer | null = null;

export const initViewer = (containerId: string): Cesium.Viewer => {
    // 1. 设置 Cesium Ion Token (如果不使用 Cesium 官方的底图和地形，可以不设)
    // Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_ION_TOKEN';

    // 2. 初始化 Viewer，关闭智慧农业大屏通常不需要的自带控件
    viewer = new Cesium.Viewer(containerId, {
        animation: false,           // 隐藏左下角动画控件
        baseLayerPicker: false,     // 隐藏右上角图层选择器
        fullscreenButton: false,    // 隐藏全屏按钮
        geocoder: false,            // 隐藏右上角地名查找控件
        homeButton: false,          // 隐藏右上角 Home 按钮
        infoBox: false,             // 隐藏点击要素之后显示的自带信息框（大屏通常自己写UI）
        sceneModePicker: false,     // 隐藏 2D/3D 模式选择器
        selectionIndicator: false,  // 隐藏点击实体时的绿色指示框
        timeline: false,            // 隐藏底部时间轴
        navigationHelpButton: false,// 隐藏右上角帮助按钮
        shouldAnimate: true,        // 允许动画（水面、粒子效果等需要）

        // 如果你有自己的底图服务（如天地图、星图地球），可以在这里配置
        // imageryProvider: new Cesium.WebMapTileServiceImageryProvider({ ... })

        terrain: Cesium.Terrain.fromWorldTerrain({
            requestVertexNormals: true,
            requestWaterMask: true
        })
    });

    // 3. 场景基础优化
    // 隐藏底部的 Cesium 版权信息 (根据具体版权要求决定是否开启)
    const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement;
    if (creditContainer) {
        creditContainer.style.display = 'none';
    }

    // 开启抗锯齿，让三维模型边缘更平滑
    viewer.scene.postProcessStages.fxaa.enabled = true;

    // 开启深度检测，防止模型在地形下方也能被看到
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // 滚轮缩放倍率
    viewer.scene.screenSpaceCameraController.zoomFactor = 2.0

    return viewer;
};