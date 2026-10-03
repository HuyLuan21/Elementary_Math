import { apiClient } from "./axios";
import {
  ChildReportResponse,
  ParentOverviewResponse,
} from "../types/parentReport";

export const parentApi = {
  getParentOverview: async (): Promise<
    ParentOverviewResponse["data"]["profiles"]
  > => {
    const response = await apiClient.get<ParentOverviewResponse>("/parent/overview");
    return response.data.data.profiles;
  },

  getChildReport: async (
    profileId: string,
  ): Promise<ChildReportResponse["data"]> => {
    const response = await apiClient.get<ChildReportResponse>(
      `/parent/profiles/${encodeURIComponent(profileId)}/report`,
    );
    return response.data.data;
  },
};
