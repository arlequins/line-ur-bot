import {create, isAxiosError} from "axios";
import {logger} from "firebase-functions/v1";
import {UR_BASE_API_URL} from "../../constants/ur";
import {LeadTimeSearchOptions} from "../../constants";
import {PayloadUrAreaList, PayloadUrRoomList, ResponseLeadTime} from "../../types/api";

const instance = create({
  baseURL: UR_BASE_API_URL,
  timeout: 10_000,
});

const stationConditionBaseUrl = "https://www.ur-net.go.jp/chintai/common/xml/cost-time";

const getStationCondition = async (search: LeadTimeSearchOptions) => {
  const stationCode = search.destinationStationCode;
  const stationConditionUrl = `${stationConditionBaseUrl}/cost-time_${stationCode.padStart(8, "0")}.xml`;

  try {
    const response = await create({timeout: 10_000}).get<string>(stationConditionUrl);
    const stationCodes = [stationCode];

    for (const station of response.data.matchAll(
      /<stationTo code="(\d+)">([\s\S]*?)<\/stationTo>/g
    )) {
      const costTime = station[2].match(/<costTime>(\d+)<\/costTime>/)?.[1];
      const changeTimes = station[2].match(/<changeTimes>(\d+)<\/changeTimes>/)?.[1];

      if (
        costTime && changeTimes &&
        Number(costTime) <= search.maximumTravelMinutes &&
        Number(changeTimes) <= search.maximumTransfers
      ) {
        stationCodes.push(station[1]);
      }
    }

    return stationCodes.join(",");
  } catch (error) {
    logger.error({
      message: "Unable to build the UR commute-time station filter",
      stationCode,
      error: isAxiosError(error) ? error.message : error,
    });
    throw error;
  }
};

export const fetchAreaList = async<T>(payload: PayloadUrAreaList) => {
  try {
    logger.info({
      message: "fetchAreaList request",
      base: UR_BASE_API_URL,
      url: "/bukken/search/list_bukken/",
      payload,
    });

    const response = await instance.post("/bukken/search/list_bukken/", payload);

    return response.data as T;
  } catch (error) {
    if (isAxiosError(error)) {
      logger.error({
        name: error.name,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    return null;
  }
};

export const fetchRoomList = async<T>(payload: PayloadUrRoomList) => {
  try {
    logger.info({
      message: "fetchRoomList request",
      base: UR_BASE_API_URL,
      url: "/room/list/",
      payload,
    });

    const response = await instance.post("/room/list/", payload);

    return response.data as T;
  } catch (error) {
    if (isAxiosError(error)) {
      logger.error({
        name: error.name,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    return null;
  }
};

export const fetchLeadTimeList = async (search: LeadTimeSearchOptions): Promise<ResponseLeadTime[] | null> => {
  try {
    const params = new URLSearchParams();
    params.append("rent_low", "");
    params.append("rent_high", `${search.rentHigh}`);
    search.rooms.forEach((room) => params.append("room", room));
    params.append("walk", "");
    params.append("floorspace_low", "");
    params.append("floorspace_high", "");
    params.append("years", search.year);
    if (search.requiresUnderfloorHeating) {
      params.append("facility_hotfloor", "1");
    }
    params.append("station_cd", search.destinationStationCode);
    params.append("station_condition", await getStationCondition(search));
    params.append("station_cost", `${search.maximumTravelMinutes}`);
    params.append("station_change", `${search.maximumTransfers}`);
    params.append("mode", "leadtime");
    params.append("eki", search.destinationStationCode);
    params.append("block", "kanto");
    search.prefectureCodes.forEach((prefectureCode) => params.append("tdfk", prefectureCode));
    params.append("rireki_tdfk", "13");
    params.append("orderByField", "1");
    params.append("pageSize", "10");
    params.append("pageIndex", "0");
    params.append("danchi", "");
    params.append("shikibetu", "");
    params.append("pageIndexRoom", "0");
    params.append("sp", "");

    const fetchPage = async (pageIndex: number) => {
      const pageParams = new URLSearchParams(params);
      pageParams.set("pageIndex", `${pageIndex}`);
      const response = await instance.post("/bukken/result/bukken_result/", pageParams);
      return response.data as ResponseLeadTime[];
    };

    const firstPage = await fetchPage(0);
    const pageMax = Number.parseInt(firstPage[0]?.pageMax ?? "1", 10);

    const pageCount = Math.min(pageMax, search.maximumPages);

    if (!Number.isInteger(pageCount) || pageCount <= 1) {
      return firstPage;
    }

    const remainingPages = await Promise.all(
      Array.from({length: pageCount - 1}, (_, index) => fetchPage(index + 1))
    );

    return firstPage.concat(...remainingPages);
  } catch (error) {
    if (isAxiosError(error)) {
      logger.error({
        name: error.name,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    return null;
  }
};
