
### Globe (地球) 类

* **构造参数 (Options)**
    * `ellipsoid`: 决定地球形状的椭球体（默认使用 WGS84 椭球体）。
* **Members 属性**
    * `baseColor`: 地球在没有加载任何影像时的基础颜色。
    * `depthTestAgainstTerrain`: 是否开启地形深度测试（决定了被地形遮挡的物体是否可见）。
    * `ellipsoid`: 获取当前地球使用的椭球体实例。
    * `enableLighting`: 是否启用昼夜光照效果。
    * `imageryLayers`: 影像图层集合（用于管理叠加在地球上的各种卫星图、电子地图）。
    * `maximumScreenSpaceError`: 控制地形渲染细节的最大屏幕空间误差。
    * `show`: 是否在场景中显示地球。
    * `showWaterEffect`: 是否显示水面动态波浪效果。
    * `terrainProvider`: 地形数据提供者（决定地球表面的高低起伏）。
* **Methods 方法**
    * `destroy()`: 销毁对象并释放 WebGL 资源。
    * `getHeight(cartographic)`: 根据给定的经纬度（弧度制）获取对应的地形高度。
    * `pick(ray, scene, result)`: 通过射线（通常是鼠标点击屏幕生成的射线）拾取地球表面的交点坐标。

### ImageryLayer (影像图层 🖼️)
在 Cesium 中，“影像”主要由 `ImageryProvider`（数据源）和 `ImageryLayer`（图层表现）配合完成。这里我们以控制图层表现的 `ImageryLayer` 为主：

* **构造参数 (Options)**
    * `imageryProvider`: （必填）影像数据的提供者（例如 BingMapsImageryProvider, WebMapServiceImageryProvider 等）。
    * `alpha`: 图层的初始透明度（0.0 到 1.0）。
    * `brightness` / `contrast` / `hue` / `saturation`: 亮度、对比度、色调和饱和度的初始设置。
    * `rectangle`: 限制该图层显示的地理矩形范围。
    * `show`: 图层是否初始可见。
* **Members 属性**
    * `alpha`, `brightness`, `contrast`, `hue`, `saturation`: 控制图像渲染效果的属性（可以随时动态修改）。
    * `imageryProvider`: 获取该图层绑定的数据源对象。
    * `show`: 控制图层显示/隐藏的布尔值。
* **Methods 方法**
    * `destroy()`: 销毁图层并释放 WebGL 资源。
    * `isBaseLayer()`: 返回该图层是否为最底层的基底图层。

### CesiumTerrainProvider (地形提供者 ⛰️)
地形决定了地球表面的三维起伏。

* **构造参数 (Options)**
    * `url`: 地形数据服务的地址（通常是 quantized-mesh 格式的数据源）。
    * `requestVertexNormals`: 是否请求顶点法线数据（如果需要地形受光照产生阴影，需设为 true）。
    * `requestWaterMask`: 是否请求水面掩码数据（如果需要渲染动态水面波纹效果，需设为 true）。
* **Members 属性**
    * `credit`: 该地形数据的版权或来源信息（会在屏幕右下角显示）。
    * `hasVertexNormals`: 只读属性，表示当前地形数据是否包含法线。
    * `hasWaterMask`: 只读属性，表示当前地形数据是否包含水面掩码。
    * `ready`: 布尔值，表示地形提供者是否已经准备好被渲染。
* **Methods 方法**
    * `getTileDataAvailable(x, y, level)`: 检查特定的地形瓦片（根据层级和坐标）是否存在。

### Entity (实体 📦)
`Entity` 是 Cesium 中用于数据驱动的高级 API，你可以用它来绘制点、线、面、模型等。

* **构造参数 (Options)**
    * `id`: 实体的唯一标识符（如果不填，系统会自动生成一个 GUID）。
    * `name`: 实体的名称（当用户点击该实体时，InfoBox 弹窗通常会显示这个名称）。
    * `position`: 实体在三维空间中的位置（通常是 `Cartesian3` 坐标）。
    * `orientation`: 实体的朝向/姿态。
    * `description`: 实体的详细描述信息（支持传入 HTML 字符串，显示在 InfoBox 中）。
    * *各种图形组件*: 例如 `point` (点), `polyline` (线), `polygon` (面), `billboard` (广告牌/图标), `model` (3D模型) 等。
* **Members 属性**
    * 与构造参数基本一一对应（如 `id`, `name`, `position`, `polygon` 等）。需要注意的是，Entity 的属性通常是 `Property` 对象，这意味着它们可以随时间动态变化（例如做轨迹回放）。
    * `isShowing`: 只读属性，指示该实体当前是否实际渲染在屏幕上。
* **Methods 方法**
    * `computeModelMatrix(time, result)`: 计算实体在特定时间点的模型变换矩阵（常用于底层渲染计算）。
