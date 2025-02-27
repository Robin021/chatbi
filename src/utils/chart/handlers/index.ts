import { chartHandlerRegistry } from './registry';

import { barChartHandler } from './implementations/barChart.handler';
import { lineChartHandler } from './implementations/lineChart.handler';
import { pieChartHandler } from './implementations/pieChart.handler';
import { treemapChartHandler } from './implementations/treemapChart.handler';
import { ScatterChartHandler } from './implementations/scatterChart.handler';
import { MapChartHandler } from './implementations/mapChart.handler';

const scatterChartHandler = new ScatterChartHandler();
const mapChartHandler = new MapChartHandler();
 
chartHandlerRegistry.register('bar', barChartHandler);
chartHandlerRegistry.register('line', lineChartHandler);
chartHandlerRegistry.register('pie', pieChartHandler);
chartHandlerRegistry.register('treemap', treemapChartHandler);
chartHandlerRegistry.register('scatter', scatterChartHandler);
chartHandlerRegistry.register('map', mapChartHandler);
 
export * from './implementations/barChart.handler';
export * from './implementations/lineChart.handler';
export * from './implementations/pieChart.handler';
export * from './implementations/treemapChart.handler';
export * from './implementations/scatterChart.handler';
export * from './implementations/mapChart.handler';
 
export * from './registry';