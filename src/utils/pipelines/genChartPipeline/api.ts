import { apiRequest } from "@/utils/api";
import { GetChartTypeRequest, GetChartTypeResponse, GenerateChartConfigRequest, GenerateChartConfigResponse } from "@/app/api/pipeline/genChart/type";
import { ChartTypeResult, ChartConfigResult } from "./type";

export const getChartType = async (request: GetChartTypeRequest): Promise<ChartTypeResult> => {
    const response = await apiRequest<GetChartTypeResponse>('/api/pipeline/genChart/step/getChartType', 'POST', request);
    return response as ChartTypeResult;
};

export const generateChartConfig = async (request: GenerateChartConfigRequest): Promise<ChartConfigResult> => {
    const response = await apiRequest<GenerateChartConfigResponse>('/api/pipeline/genChart/step/generateConfig', 'POST', request);
    return response as ChartConfigResult;
}; 